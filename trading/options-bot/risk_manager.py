"""
Risk Manager
Position management, Greeks exposure limits, exit management.
"""

import json
import logging
import requests
from datetime import datetime, timezone
from typing import Optional

import config
from greeks import calculate_delta, calculate_theta

logger = logging.getLogger("options_bot.risk")


class RiskManager:
    """Manages portfolio risk, position limits, and exit rules."""

    def __init__(self):
        self.trades_db = self._load_trades_db()

    def _load_trades_db(self) -> dict:
        """Load trades database from disk."""
        try:
            with open(config.TRADES_DB, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {
                "active_trades": {},
                "closed_trades": [],
                "stats": {
                    "total_trades": 0,
                    "winners": 0,
                    "losers": 0,
                    "win_rate": 0,
                    "total_pnl": 0,
                    "avg_pnl": 0,
                    "best_trade": 0,
                    "worst_trade": 0,
                },
                "daily_pnl": {}
            }

    def _save_trades_db(self):
        """Save trades database to disk."""
        with open(config.TRADES_DB, 'w') as f:
            json.dump(self.trades_db, f, indent=2, default=str)

    def can_open_position(self, signal: dict) -> tuple:
        """
        Check if we can open a new position.
        Returns (bool, reason_string).
        """
        active = self.trades_db.get("active_trades", {})

        # Max concurrent positions
        if len(active) >= config.MAX_CONCURRENT_POSITIONS:
            return False, f"Max positions ({config.MAX_CONCURRENT_POSITIONS}) reached"

        # Max risk per trade
        max_risk = signal.get("max_risk", float("inf"))
        if max_risk > config.MAX_RISK_PER_TRADE * 1.5:  # Allow 50% buffer
            return False, f"Risk ${max_risk:.0f} exceeds limit ${config.MAX_RISK_PER_TRADE}"

        # Check if we already have a position in this ticker
        for trade_id, trade in active.items():
            if trade.get("ticker") == signal.get("ticker"):
                return False, f"Already have active position in {signal['ticker']}"

        # Check total capital deployed
        total_deployed = sum(
            t.get("max_risk", 0) for t in active.values()
        )
        new_risk = signal.get("max_risk", 0)
        if total_deployed + new_risk > config.TOTAL_ALLOCATION * 0.8:
            return False, f"Total deployed (${total_deployed + new_risk:.0f}) would exceed 80% of allocation"

        return True, "OK"

    def record_trade_open(self, signal: dict, order_ids: list) -> str:
        """Record a new trade opening. Returns trade_id."""
        trade_id = f"{signal['ticker']}_{signal['strategy']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        trade = {
            "trade_id": trade_id,
            "ticker": signal["ticker"],
            "strategy": signal["strategy"],
            "trade_type": signal["trade_type"],
            "direction": signal.get("direction", "neutral"),
            "expiration": signal["expiration"],
            "dte_at_entry": signal.get("dte", 0),
            "stock_price_at_entry": signal.get("stock_price", 0),
            "legs": signal.get("legs", []),
            "num_contracts": signal.get("num_contracts", 1),
            "net_credit": signal.get("net_credit", 0),
            "net_debit": signal.get("net_debit", 0),
            "max_risk": signal.get("max_risk", 0),
            "profit_target": signal.get("profit_target", 0),
            "stop_loss_price": signal.get("stop_loss_price"),
            "order_ids": order_ids,
            "opened_at": datetime.now(timezone.utc).isoformat(),
            "score": signal.get("score", 0),
            "reason": signal.get("reason", ""),
            "status": "open",
        }

        self.trades_db["active_trades"][trade_id] = trade
        self._save_trades_db()
        logger.info(f"📝 Recorded trade open: {trade_id}")
        return trade_id

    def record_trade_close(self, trade_id: str, exit_reason: str,
                            pnl: float = 0, pnl_pct: float = 0):
        """Record a trade closing."""
        active = self.trades_db.get("active_trades", {})
        if trade_id not in active:
            logger.warning(f"Trade {trade_id} not found in active trades")
            return

        trade = active.pop(trade_id)
        trade["closed_at"] = datetime.now(timezone.utc).isoformat()
        trade["exit_reason"] = exit_reason
        trade["pnl"] = pnl
        trade["pnl_pct"] = pnl_pct
        trade["status"] = "closed"

        self.trades_db["closed_trades"].append(trade)

        # Update stats
        stats = self.trades_db["stats"]
        stats["total_trades"] += 1
        if pnl > 0:
            stats["winners"] += 1
        else:
            stats["losers"] += 1
        stats["total_pnl"] += pnl
        stats["win_rate"] = (stats["winners"] / stats["total_trades"] * 100) if stats["total_trades"] > 0 else 0
        stats["avg_pnl"] = stats["total_pnl"] / stats["total_trades"] if stats["total_trades"] > 0 else 0
        stats["best_trade"] = max(stats["best_trade"], pnl)
        stats["worst_trade"] = min(stats["worst_trade"], pnl)

        # Daily P&L tracking
        today = datetime.now().strftime("%Y-%m-%d")
        daily = self.trades_db.get("daily_pnl", {})
        daily[today] = daily.get(today, 0) + pnl
        self.trades_db["daily_pnl"] = daily

        self._save_trades_db()
        logger.info(f"📝 Recorded trade close: {trade_id} | {exit_reason} | P&L: ${pnl:.2f}")

    def check_exits(self) -> list:
        """
        Check all active positions for exit conditions.
        Returns list of (trade_id, reason) tuples for trades that should be closed.
        """
        exits = []
        active = self.trades_db.get("active_trades", {})
        today = datetime.now().date()

        for trade_id, trade in active.items():
            # Check DTE
            exp_str = trade.get("expiration", "")
            if exp_str:
                try:
                    exp_date = datetime.strptime(exp_str, "%Y-%m-%d").date()
                    dte = (exp_date - today).days

                    if dte <= config.MIN_DTE_CLOSE:
                        exits.append((trade_id, f"DTE={dte} <= {config.MIN_DTE_CLOSE} (gamma risk)"))
                        continue

                    if dte <= 0:
                        exits.append((trade_id, "At or past expiration"))
                        continue
                except ValueError:
                    pass

            # For credit trades: check if 50% profit target reached
            # For debit trades: check stop loss and profit target
            # (Actual P&L check requires fetching current option prices,
            #  which we'll do in bot.py)

        return exits

    def get_portfolio_greeks(self) -> dict:
        """
        Calculate aggregate portfolio Greeks.
        (Simplified: based on recorded trade parameters)
        """
        total_delta = 0
        total_theta = 0
        total_risk = 0

        for trade_id, trade in self.trades_db.get("active_trades", {}).items():
            # Estimate delta and theta from trade type
            n = trade.get("num_contracts", 1)
            trade_type = trade.get("trade_type", "")
            direction = trade.get("direction", "neutral")

            if "iron_condor" in trade_type:
                # Iron condors are roughly delta-neutral, positive theta
                total_theta += trade.get("net_credit", 0) * n * 2  # Rough theta estimate
            elif "long_call" in trade_type:
                total_delta += 65 * n  # Rough delta for ITM call
                total_theta -= trade.get("net_debit", 0) * n * 1.5
            elif "long_put" in trade_type:
                total_delta -= 65 * n
                total_theta -= trade.get("net_debit", 0) * n * 1.5
            elif "bull_call_spread" in trade_type:
                total_delta += 30 * n
                total_theta -= trade.get("net_debit", 0) * n
            elif "bear_put_spread" in trade_type:
                total_delta -= 30 * n
                total_theta -= trade.get("net_debit", 0) * n
            elif "long_strangle" in trade_type:
                # Roughly delta neutral, negative theta
                total_theta -= trade.get("net_debit", 0) * n * 2

            total_risk += trade.get("max_risk", 0)

        return {
            "net_delta": total_delta,
            "est_theta": total_theta,
            "total_risk": total_risk,
            "num_positions": len(self.trades_db.get("active_trades", {})),
        }

    def check_portfolio_limits(self, signal: dict) -> tuple:
        """
        Check if adding a new trade would violate portfolio limits.
        Returns (bool, reason).
        """
        greeks = self.get_portfolio_greeks()

        # Check net delta
        new_delta = 0
        trade_type = signal.get("trade_type", "")
        n = signal.get("num_contracts", 1)

        if "long_call" in trade_type or "bull_call_spread" in trade_type:
            new_delta = 50 * n
        elif "long_put" in trade_type or "bear_put_spread" in trade_type:
            new_delta = -50 * n

        projected_delta = greeks["net_delta"] + new_delta
        if abs(projected_delta) > config.MAX_NET_DELTA:
            return False, f"Net delta would be {projected_delta}, limit is ±{config.MAX_NET_DELTA}"

        return True, "OK"
