"""
Risk Manager
Manages positions, stop losses, take profits, and trailing stops.
"""

import json
import logging
import os
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional

import config

logger = logging.getLogger("congress_bot.risk")


class RiskManager:
    """Manages active positions and exit strategies."""
    
    def __init__(self, api):
        self.api = api  # Alpaca API client
        self.trades_db = self._load_db()
    
    def _load_db(self) -> Dict:
        """Load trades database."""
        if os.path.exists(config.TRADES_DB):
            try:
                with open(config.TRADES_DB, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                pass
        return {"active_trades": {}, "closed_trades": [], "stats": {}}
    
    def _save_db(self):
        """Save trades database."""
        with open(config.TRADES_DB, 'w') as f:
            json.dump(self.trades_db, f, indent=2, default=str)
    
    def get_deployed_capital(self) -> float:
        """Calculate total capital currently deployed in positions."""
        total = 0
        for trade_id, trade in self.trades_db.get("active_trades", {}).items():
            total += trade.get("entry_cost", 0)
        return total
    
    def get_available_capital(self) -> float:
        """Calculate remaining capital available for new trades."""
        return config.TOTAL_ALLOCATION - self.get_deployed_capital()
    
    def record_trade(self, tx_id: str, ticker: str, side: str, qty: float, 
                     avg_price: float, politician: str, score: int,
                     is_high_alpha: bool):
        """Record a new trade in the database."""
        self.trades_db["active_trades"][tx_id] = {
            "tx_id": tx_id,
            "ticker": ticker,
            "side": side,
            "qty": qty,
            "entry_price": avg_price,
            "entry_cost": qty * avg_price,
            "entry_time": datetime.now(timezone.utc).isoformat(),
            "politician": politician,
            "score": score,
            "is_high_alpha": is_high_alpha,
            "highest_price": avg_price,
            "trailing_stop_active": False,
            "stop_loss_price": avg_price * (1 - config.STOP_LOSS_PCT) if side == "buy" else avg_price * (1 + config.STOP_LOSS_PCT),
            "take_profit_price": avg_price * (1 + config.TAKE_PROFIT_PCT) if side == "buy" else avg_price * (1 - config.TAKE_PROFIT_PCT),
            "trailing_trigger_price": avg_price * (1 + config.TRAILING_TRIGGER_PCT) if side == "buy" else avg_price * (1 - config.TRAILING_TRIGGER_PCT),
            "hold_until": (datetime.now(timezone.utc) + timedelta(days=config.HOLD_DAYS)).isoformat(),
        }
        self._save_db()
        logger.info(f"Recorded trade: {side} {qty} {ticker} @ ${avg_price:.2f} (tx: {tx_id})")
    
    def check_exits(self) -> List[Dict]:
        """
        Check all active positions for exit conditions.
        Returns list of positions that should be exited.
        """
        exits = []
        now = datetime.now(timezone.utc)
        
        for tx_id, trade in list(self.trades_db.get("active_trades", {}).items()):
            ticker = trade["ticker"]
            side = trade["side"]
            entry_price = trade["entry_price"]
            
            try:
                # Get current price from Alpaca
                current_price = self._get_current_price(ticker)
                if current_price is None:
                    continue
                
                exit_reason = None
                
                if side == "buy":
                    # Check stop loss
                    if current_price <= trade["stop_loss_price"]:
                        exit_reason = "stop_loss"
                    
                    # Check take profit
                    elif current_price >= trade["take_profit_price"]:
                        exit_reason = "take_profit"
                    
                    # Check trailing stop
                    elif trade.get("trailing_stop_active"):
                        trailing_stop = trade["highest_price"] * (1 - config.TRAILING_STOP_PCT)
                        if current_price <= trailing_stop:
                            exit_reason = "trailing_stop"
                    
                    # Update highest price and check trailing trigger
                    if current_price > trade.get("highest_price", 0):
                        trade["highest_price"] = current_price
                        if current_price >= trade["trailing_trigger_price"]:
                            trade["trailing_stop_active"] = True
                            logger.info(f"Trailing stop activated for {ticker} at ${current_price:.2f}")
                
                else:  # short position
                    if current_price >= trade["stop_loss_price"]:
                        exit_reason = "stop_loss"
                    elif current_price <= trade["take_profit_price"]:
                        exit_reason = "take_profit"
                
                # Check hold period expiry
                hold_until = datetime.fromisoformat(trade["hold_until"])
                if now >= hold_until and exit_reason is None:
                    exit_reason = "hold_expired"
                
                if exit_reason:
                    pnl = (current_price - entry_price) * trade["qty"]
                    if side == "sell":
                        pnl = -pnl
                    
                    pnl_pct = ((current_price / entry_price) - 1) * 100
                    if side == "sell":
                        pnl_pct = -pnl_pct
                    
                    exits.append({
                        "tx_id": tx_id,
                        "ticker": ticker,
                        "side": "sell" if side == "buy" else "buy",
                        "qty": trade["qty"],
                        "reason": exit_reason,
                        "entry_price": entry_price,
                        "exit_price": current_price,
                        "pnl": pnl,
                        "pnl_pct": pnl_pct,
                        "politician": trade["politician"],
                    })
                    
            except Exception as e:
                logger.error(f"Error checking exit for {ticker}: {e}")
        
        self._save_db()
        return exits
    
    def close_trade(self, tx_id: str, exit_price: float, reason: str):
        """Move a trade from active to closed."""
        if tx_id in self.trades_db["active_trades"]:
            trade = self.trades_db["active_trades"].pop(tx_id)
            trade["exit_price"] = exit_price
            trade["exit_time"] = datetime.now(timezone.utc).isoformat()
            trade["exit_reason"] = reason
            
            entry = trade["entry_price"]
            qty = trade["qty"]
            if trade["side"] == "buy":
                trade["pnl"] = (exit_price - entry) * qty
                trade["pnl_pct"] = ((exit_price / entry) - 1) * 100
            else:
                trade["pnl"] = (entry - exit_price) * qty
                trade["pnl_pct"] = ((entry / exit_price) - 1) * 100
            
            self.trades_db["closed_trades"].append(trade)
            self._update_stats()
            self._save_db()
            
            logger.info(f"Closed {trade['ticker']}: {reason} | P&L: ${trade['pnl']:.2f} ({trade['pnl_pct']:.1f}%)")
    
    def _update_stats(self):
        """Update aggregate statistics."""
        closed = self.trades_db["closed_trades"]
        if not closed:
            return
        
        total_pnl = sum(t.get("pnl", 0) for t in closed)
        winners = [t for t in closed if t.get("pnl", 0) > 0]
        losers = [t for t in closed if t.get("pnl", 0) <= 0]
        
        self.trades_db["stats"] = {
            "total_trades": len(closed),
            "winners": len(winners),
            "losers": len(losers),
            "win_rate": len(winners) / len(closed) * 100 if closed else 0,
            "total_pnl": total_pnl,
            "avg_pnl": total_pnl / len(closed) if closed else 0,
            "best_trade": max((t.get("pnl", 0) for t in closed), default=0),
            "worst_trade": min((t.get("pnl", 0) for t in closed), default=0),
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }
    
    def _get_current_price(self, ticker: str) -> Optional[float]:
        """Get current market price for a ticker."""
        try:
            quote = self.api.get_latest_quote(ticker)
            # Use ask price for buys, bid for sells, or mid
            if quote.ask_price and quote.bid_price:
                return (quote.ask_price + quote.bid_price) / 2
            return quote.ask_price or quote.bid_price
        except Exception as e:
            logger.error(f"Error getting price for {ticker}: {e}")
            return None
    
    def get_position_for_ticker(self, ticker: str) -> Optional[Dict]:
        """Check if we already have a position in this ticker."""
        for tx_id, trade in self.trades_db.get("active_trades", {}).items():
            if trade["ticker"] == ticker:
                return trade
        return None
    
    def get_active_positions(self) -> Dict:
        """Get all active positions."""
        return self.trades_db.get("active_trades", {})
    
    def get_stats(self) -> Dict:
        """Get trading statistics."""
        return self.trades_db.get("stats", {})
