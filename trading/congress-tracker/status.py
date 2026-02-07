#!/usr/bin/env python3
"""
Status Display for Congress Trading Bot
Shows current positions, stats, and recent activity.
"""

import json
import os
import sys
import subprocess
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(__file__))
import config


def load_json(path):
    if os.path.exists(path):
        with open(path, 'r') as f:
            return json.load(f)
    return None


def check_process():
    """Check if the bot is running."""
    pid_file = os.path.join(os.path.dirname(__file__), "bot.pid")
    if os.path.exists(pid_file):
        with open(pid_file, 'r') as f:
            pid = f.read().strip()
        try:
            os.kill(int(pid), 0)
            return True, pid
        except (OSError, ValueError):
            return False, pid
    return False, None


def main():
    print("=" * 60)
    print("🏛️  CONGRESS TRADING BOT - Status")
    print("=" * 60)
    
    # Bot status
    is_running, pid = check_process()
    status_emoji = "🟢" if is_running else "🔴"
    print(f"\nBot Status: {status_emoji} {'RUNNING' if is_running else 'STOPPED'}", end="")
    if pid:
        print(f" (PID: {pid})")
    else:
        print()
    
    # Load state
    state = load_json(config.STATE_FILE)
    if state:
        seen = len(state.get("seen_tx_ids", []))
        last_update = state.get("last_updated", "N/A")
        print(f"Last Update: {last_update}")
        print(f"Transactions Seen: {seen}")
    
    # Load trades DB
    db = load_json(config.TRADES_DB)
    if not db:
        print("\nNo trade data yet.")
        print_log_tail()
        return
    
    # Capital
    active_trades = db.get("active_trades", {})
    closed_trades = db.get("closed_trades", [])
    
    deployed = sum(t.get("entry_cost", 0) for t in active_trades.values())
    available = config.TOTAL_ALLOCATION - deployed
    
    print(f"\n{'─' * 40}")
    print(f"💰 Capital Allocation")
    print(f"{'─' * 40}")
    print(f"  Total:     ${config.TOTAL_ALLOCATION:>10,.2f}")
    print(f"  Deployed:  ${deployed:>10,.2f}")
    print(f"  Available: ${available:>10,.2f}")
    
    # Active Positions
    print(f"\n{'─' * 40}")
    print(f"📊 Active Positions ({len(active_trades)})")
    print(f"{'─' * 40}")
    
    if active_trades:
        for tx_id, trade in active_trades.items():
            trailing = "🔄" if trade.get("trailing_stop_active") else ""
            alpha = "⭐" if trade.get("is_high_alpha") else ""
            print(
                f"  {trade['ticker']:6s} | {trade['side'].upper():4s} | "
                f"qty: {trade['qty']:.2f} | entry: ${trade['entry_price']:.2f} | "
                f"cost: ${trade['entry_cost']:.2f} | "
                f"score: {trade.get('score', '?')} | "
                f"{trade['politician'][:15]} {alpha}{trailing}"
            )
            print(
                f"         SL: ${trade.get('stop_loss_price', 0):.2f} | "
                f"TP: ${trade.get('take_profit_price', 0):.2f} | "
                f"Hold until: {trade.get('hold_until', 'N/A')[:10]}"
            )
    else:
        print("  No active positions")
    
    # Stats
    stats = db.get("stats", {})
    if stats:
        print(f"\n{'─' * 40}")
        print(f"📈 Performance Stats")
        print(f"{'─' * 40}")
        print(f"  Total Closed Trades: {stats.get('total_trades', 0)}")
        print(f"  Winners:  {stats.get('winners', 0)}")
        print(f"  Losers:   {stats.get('losers', 0)}")
        print(f"  Win Rate: {stats.get('win_rate', 0):.1f}%")
        print(f"  Total P&L: ${stats.get('total_pnl', 0):,.2f}")
        print(f"  Avg P&L:   ${stats.get('avg_pnl', 0):,.2f}")
        print(f"  Best Trade:  ${stats.get('best_trade', 0):,.2f}")
        print(f"  Worst Trade: ${stats.get('worst_trade', 0):,.2f}")
    
    # Recent Closed Trades
    if closed_trades:
        print(f"\n{'─' * 40}")
        print(f"📋 Recent Closed Trades (last 5)")
        print(f"{'─' * 40}")
        for trade in closed_trades[-5:]:
            pnl = trade.get("pnl", 0)
            emoji = "✅" if pnl > 0 else "❌"
            print(
                f"  {emoji} {trade['ticker']:6s} | {trade['exit_reason']:15s} | "
                f"P&L: ${pnl:>8,.2f} ({trade.get('pnl_pct', 0):.1f}%) | "
                f"{trade['politician'][:15]}"
            )
    
    print_log_tail()
    print()


def print_log_tail():
    """Print last few lines of the log file."""
    print(f"\n{'─' * 40}")
    print(f"📝 Recent Log (last 10 lines)")
    print(f"{'─' * 40}")
    
    if os.path.exists(config.LOG_FILE):
        try:
            result = subprocess.run(
                ["tail", "-10", config.LOG_FILE],
                capture_output=True, text=True
            )
            print(result.stdout)
        except Exception:
            print("  Could not read log file")
    else:
        print("  No log file yet")


if __name__ == "__main__":
    main()
