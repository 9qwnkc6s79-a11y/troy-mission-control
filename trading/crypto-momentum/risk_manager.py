"""
Risk Management Module — V2
Conservative parameters: let winners run, cut losses at 3%, max 3 positions.
Anti-churn: minimum 30 min between trades on same symbol, max 10 trades/day.
"""

import json
import os
import time
from datetime import datetime, timezone, timedelta
from typing import Optional

from config import (
    MAX_PORTFOLIO_PCT_PER_TRADE,
    STOP_LOSS_PCT,
    TAKE_PROFIT_PCT,
    TRAILING_STOP_TRIGGER,
    TRAILING_STOP_TRAIL,
    MAX_CONCURRENT_POSITIONS,
    MAX_DAILY_LOSS_PCT,
    MAX_TRADES_PER_DAY,
    MIN_TRADE_INTERVAL_SECONDS,
    POSITION_SIZE,
    TRADE_LOG_FILE,
    STATUS_FILE,
)

import logging
logger = logging.getLogger("risk_manager")


class RiskManager:
    def __init__(self):
        self.daily_pnl = 0.0
        self.starting_equity = 0.0
        self.circuit_breaker_until = None
        self.positions = {}
        self.trade_history = []
        self.daily_trade_count = 0
        self.last_trade_time = {}  # symbol -> timestamp
        self._load_trade_log()

    def _load_trade_log(self):
        """Load existing trade history from file."""
        if os.path.exists(TRADE_LOG_FILE):
            try:
                with open(TRADE_LOG_FILE, "r") as f:
                    data = json.load(f)
                    self.trade_history = data.get("trades", [])
                    self.daily_pnl = data.get("daily_pnl", 0.0)
                    self.daily_trade_count = data.get("daily_trade_count", 0)
                    cb = data.get("circuit_breaker_until")
                    if cb:
                        self.circuit_breaker_until = datetime.fromisoformat(cb)
                    # Restore last trade times
                    for sym, ts in data.get("last_trade_time", {}).items():
                        self.last_trade_time[sym] = float(ts)
            except (json.JSONDecodeError, KeyError, ValueError):
                self.trade_history = []

    def save_trade_log(self):
        """Save trade history to file."""
        os.makedirs(os.path.dirname(TRADE_LOG_FILE), exist_ok=True)
        data = {
            "trades": self.trade_history[-500:],
            "daily_pnl": self.daily_pnl,
            "daily_trade_count": self.daily_trade_count,
            "circuit_breaker_until": self.circuit_breaker_until.isoformat() if self.circuit_breaker_until else None,
            "last_trade_time": {k: str(v) for k, v in self.last_trade_time.items()},
            "positions": {k: {**v} for k, v in self.positions.items()},
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }
        with open(TRADE_LOG_FILE, "w") as f:
            json.dump(data, f, indent=2, default=str)

    def save_status(self, account_equity: float, account_cash: float):
        """Save current status for monitoring."""
        os.makedirs(os.path.dirname(STATUS_FILE), exist_ok=True)
        status = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": "v2-sentiment-regime",
            "account_equity": account_equity,
            "account_cash": account_cash,
            "starting_equity": self.starting_equity,
            "daily_pnl": self.daily_pnl,
            "daily_pnl_pct": (self.daily_pnl / self.starting_equity * 100) if self.starting_equity > 0 else 0,
            "daily_trade_count": self.daily_trade_count,
            "max_trades_per_day": MAX_TRADES_PER_DAY,
            "circuit_breaker_active": self.is_circuit_breaker_active(),
            "open_positions": len(self.positions),
            "max_positions": MAX_CONCURRENT_POSITIONS,
            "positions": {},
            "recent_trades": self.trade_history[-20:],
        }
        for sym, pos in self.positions.items():
            status["positions"][sym] = {
                "entry_price": pos["entry_price"],
                "qty": pos["qty"],
                "side": pos["side"],
                "stop_loss": pos["stop_loss"],
                "take_profit": pos["take_profit"],
                "entry_time": pos.get("entry_time", ""),
                "highest_price": pos.get("highest_price", pos["entry_price"]),
                "confidence": pos.get("confidence", "unknown"),
                "llm_conviction": pos.get("llm_conviction", 0),
            }
        with open(STATUS_FILE, "w") as f:
            json.dump(status, f, indent=2, default=str)

    def set_starting_equity(self, equity: float):
        """Set the starting equity for the day."""
        if self.starting_equity == 0:
            self.starting_equity = equity

    def is_circuit_breaker_active(self) -> bool:
        """Check if circuit breaker is currently active."""
        if self.circuit_breaker_until is None:
            return False
        now = datetime.now(timezone.utc)
        if now < self.circuit_breaker_until:
            return True
        self.circuit_breaker_until = None
        self.daily_pnl = 0.0
        self.daily_trade_count = 0
        return False

    def check_circuit_breaker(self, current_equity: float) -> bool:
        """Check if daily loss exceeds 3% threshold."""
        if self.starting_equity <= 0:
            return False
        daily_loss_pct = (self.starting_equity - current_equity) / self.starting_equity
        if daily_loss_pct >= MAX_DAILY_LOSS_PCT:
            self.circuit_breaker_until = datetime.now(timezone.utc) + timedelta(hours=24)
            self.daily_pnl = current_equity - self.starting_equity
            self.save_trade_log()
            return True
        return False

    def can_open_position(self, symbol: str) -> tuple:
        """
        Check if we can open a new position.
        Returns (can_trade: bool, reason: str)
        """
        if self.is_circuit_breaker_active():
            return False, "Circuit breaker active"

        if len(self.positions) >= MAX_CONCURRENT_POSITIONS:
            return False, f"Max positions reached ({MAX_CONCURRENT_POSITIONS})"

        if symbol in self.positions:
            return False, f"Already have position in {symbol}"

        if self.daily_trade_count >= MAX_TRADES_PER_DAY:
            return False, f"Max daily trades reached ({MAX_TRADES_PER_DAY})"

        # Anti-churn: minimum time between trades on same symbol
        last_time = self.last_trade_time.get(symbol, 0)
        elapsed = time.time() - last_time
        if elapsed < MIN_TRADE_INTERVAL_SECONDS:
            remaining = int(MIN_TRADE_INTERVAL_SECONDS - elapsed)
            return False, f"Trade cooldown: {remaining}s remaining for {symbol}"

        return True, "OK"

    def calculate_position_size(self, equity: float, confidence: str, price: float) -> float:
        """Calculate position size based on confidence level."""
        pct = POSITION_SIZE.get(confidence, POSITION_SIZE["low"])
        pct = min(pct, MAX_PORTFOLIO_PCT_PER_TRADE)
        dollar_amount = equity * pct
        qty = dollar_amount / price
        return qty

    def calculate_stops(self, entry_price: float, side: str) -> dict:
        """Calculate stop loss and take profit levels."""
        if side == "buy":
            stop_loss = entry_price * (1 - STOP_LOSS_PCT)
            take_profit = entry_price * (1 + TAKE_PROFIT_PCT)
        else:
            stop_loss = entry_price * (1 + STOP_LOSS_PCT)
            take_profit = entry_price * (1 - TAKE_PROFIT_PCT)
        return {"stop_loss": stop_loss, "take_profit": take_profit}

    def open_position(self, symbol: str, entry_price: float, qty: float,
                      side: str, confidence: str, reason: str, llm_conviction: int = 0):
        """Record a new position."""
        stops = self.calculate_stops(entry_price, side)
        self.positions[symbol] = {
            "entry_price": entry_price,
            "qty": qty,
            "side": side,
            "stop_loss": stops["stop_loss"],
            "take_profit": stops["take_profit"],
            "highest_price": entry_price,
            "lowest_price": entry_price,
            "trailing_active": False,
            "entry_time": datetime.now(timezone.utc).isoformat(),
            "confidence": confidence,
            "llm_conviction": llm_conviction,
        }
        self.trade_history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "symbol": symbol,
            "action": "open",
            "side": side,
            "price": entry_price,
            "qty": qty,
            "confidence": confidence,
            "llm_conviction": llm_conviction,
            "reason": reason,
            "stop_loss": stops["stop_loss"],
            "take_profit": stops["take_profit"],
        })
        self.daily_trade_count += 1
        self.last_trade_time[symbol] = time.time()
        self.save_trade_log()

    def close_position(self, symbol: str, exit_price: float, reason: str) -> float:
        """Close a position and calculate P&L."""
        if symbol not in self.positions:
            return 0.0

        pos = self.positions[symbol]
        if pos["side"] == "buy":
            pnl = (exit_price - pos["entry_price"]) * pos["qty"]
        else:
            pnl = (pos["entry_price"] - exit_price) * pos["qty"]

        pnl_pct = ((exit_price - pos["entry_price"]) / pos["entry_price"]) * 100
        if pos["side"] == "sell":
            pnl_pct = -pnl_pct

        self.daily_pnl += pnl
        self.trade_history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "symbol": symbol,
            "action": "close",
            "side": pos["side"],
            "entry_price": pos["entry_price"],
            "exit_price": exit_price,
            "qty": pos["qty"],
            "pnl": round(pnl, 2),
            "pnl_pct": round(pnl_pct, 2),
            "reason": reason,
            "hold_time": pos.get("entry_time", ""),
        })
        self.last_trade_time[symbol] = time.time()
        del self.positions[symbol]
        self.save_trade_log()
        return pnl

    def update_trailing_stop(self, symbol: str, current_price: float) -> dict:
        """
        Update trailing stop with improved logic:
        - Stop at 3% below entry
        - Take profit at 6%+
        - Trailing triggers at +4%, trails at 2% below peak
        """
        if symbol not in self.positions:
            return {"action": "hold"}

        pos = self.positions[symbol]
        entry = pos["entry_price"]
        side = pos["side"]

        if side == "buy":
            # Track highest price
            if current_price > pos.get("highest_price", entry):
                pos["highest_price"] = current_price

            # Stop loss check
            if current_price <= pos["stop_loss"]:
                return {
                    "action": "stop_hit",
                    "reason": f"Stop loss hit: ${current_price:,.2f} <= ${pos['stop_loss']:,.2f}",
                }

            # Take profit check
            if current_price >= pos["take_profit"]:
                return {
                    "action": "take_profit",
                    "reason": f"Take profit hit: ${current_price:,.2f} >= ${pos['take_profit']:,.2f}",
                }

            # Trailing stop logic
            gain_pct = (current_price - entry) / entry
            if gain_pct >= TRAILING_STOP_TRIGGER:
                pos["trailing_active"] = True
                # Trail at 2% below the highest price seen
                trail_stop = pos["highest_price"] * (1 - TRAILING_STOP_TRAIL)
                if trail_stop > pos["stop_loss"]:
                    old_stop = pos["stop_loss"]
                    pos["stop_loss"] = trail_stop
                    return {
                        "action": "update",
                        "reason": f"Trailing stop: ${old_stop:,.2f} → ${trail_stop:,.2f} (peak=${pos['highest_price']:,.2f}, gain={gain_pct*100:.1f}%)",
                    }

                # Check if price fell back to trailing stop
                if current_price <= trail_stop:
                    return {
                        "action": "stop_hit",
                        "reason": f"Trailing stop hit: ${current_price:,.2f} <= ${trail_stop:,.2f} (peak=${pos['highest_price']:,.2f})",
                    }

        elif side == "sell":
            if current_price < pos.get("lowest_price", entry):
                pos["lowest_price"] = current_price

            if current_price >= pos["stop_loss"]:
                return {"action": "stop_hit", "reason": f"Stop loss hit (short): ${current_price:,.2f}"}

            if current_price <= pos["take_profit"]:
                return {"action": "take_profit", "reason": f"Take profit hit (short): ${current_price:,.2f}"}

            gain_pct = (entry - current_price) / entry
            if gain_pct >= TRAILING_STOP_TRIGGER:
                pos["trailing_active"] = True
                trail_stop = pos["lowest_price"] * (1 + TRAILING_STOP_TRAIL)
                if trail_stop < pos["stop_loss"]:
                    pos["stop_loss"] = trail_stop

        return {"action": "hold"}
