#!/usr/bin/env python3
"""
Trading Bot Status Script - AGGRESSIVE MODE
Shows current positions, P&L, sentiment, and recent trades.
"""

import json
import os
import sys
from datetime import datetime, timezone

STATUS_FILE = "logs/status.json"
TRADE_LOG_FILE = "logs/trades.json"
PID_FILE = "logs/bot.pid"
SENTIMENT_LOG_FILE = "logs/sentiment.log"


def check_bot_running():
    """Check if the bot process is running."""
    if not os.path.exists(PID_FILE):
        return False, None
    with open(PID_FILE, "r") as f:
        pid = int(f.read().strip())
    try:
        os.kill(pid, 0)
        return True, pid
    except OSError:
        return False, pid


def format_currency(val):
    if val >= 0:
        return f"${val:,.2f}"
    return f"-${abs(val):,.2f}"


def format_pnl(val):
    if val >= 0:
        return f"\033[92m+{format_currency(val)}\033[0m"
    return f"\033[91m{format_currency(val)}\033[0m"


def main():
    print("=" * 60)
    print("  🔥 AGGRESSIVE CRYPTO TRADING BOT - STATUS")
    print("=" * 60)

    # Bot status
    running, pid = check_bot_running()
    status_icon = "🟢" if running else "🔴"
    print(f"\n{status_icon} Bot: {'RUNNING' if running else 'STOPPED'}" + (f" (PID: {pid})" if pid else ""))

    # Load status file
    if not os.path.exists(STATUS_FILE):
        print("\n⚠️  No status file found. Bot may not have run yet.")
        print("=" * 60)
        return

    with open(STATUS_FILE, "r") as f:
        status = json.load(f)

    last_update = status.get("timestamp", "unknown")
    try:
        dt = datetime.fromisoformat(last_update.replace("Z", "+00:00"))
        age_secs = (datetime.now(timezone.utc) - dt).total_seconds()
        age_str = f" ({int(age_secs)}s ago)" if age_secs < 3600 else f" ({int(age_secs/60)}m ago)"
    except:
        age_str = ""
    print(f"📊 Last Update: {last_update}{age_str}")

    # Account info
    print(f"\n{'─' * 40}")
    print("  ACCOUNT")
    print(f"{'─' * 40}")
    equity = status.get("account_equity", 0)
    cash = status.get("account_cash", 0)
    starting = status.get("starting_equity", 0)
    daily_pnl = status.get("daily_pnl", 0)
    daily_pnl_pct = status.get("daily_pnl_pct", 0)

    print(f"  Equity:      {format_currency(equity)}")
    print(f"  Cash:        {format_currency(cash)}")
    print(f"  Start Eq:    {format_currency(starting)}")
    print(f"  Daily P&L:   {format_pnl(daily_pnl)} ({daily_pnl_pct:+.2f}%)")

    if status.get("circuit_breaker_active"):
        print(f"\n  ⚠️  CIRCUIT BREAKER ACTIVE until {status.get('circuit_breaker_until', 'unknown')}")

    # Positions
    positions = status.get("positions", {})
    max_pos = status.get("max_positions", 5)
    print(f"\n{'─' * 40}")
    print(f"  POSITIONS ({len(positions)}/{max_pos})")
    print(f"{'─' * 40}")

    if not positions:
        print("  No open positions")
    else:
        for sym, pos in positions.items():
            entry = pos.get("entry_price", 0)
            stop = pos.get("stop_loss", 0)
            tp = pos.get("take_profit", 0)
            side = pos.get("side", "?").upper()
            qty = pos.get("qty", 0)
            highest = pos.get("highest_price", entry)

            print(f"\n  {sym} ({side})")
            print(f"    Qty:      {qty}")
            print(f"    Entry:    {format_currency(entry)}")
            print(f"    Stop:     {format_currency(stop)}")
            print(f"    Target:   {format_currency(tp)}")
            print(f"    High:     {format_currency(highest)}")
            print(f"    Time:     {pos.get('entry_time', 'unknown')}")

    # Recent trades
    trades = status.get("recent_trades", [])
    print(f"\n{'─' * 40}")
    print(f"  RECENT TRADES (last {min(len(trades), 10)})")
    print(f"{'─' * 40}")

    if not trades:
        print("  No trades yet")
    else:
        for trade in trades[-10:]:
            ts = trade.get("timestamp", "")[:19]
            sym = trade.get("symbol", "?")
            action = trade.get("action", "?").upper()
            side = trade.get("side", "?").upper()
            price = trade.get("price", trade.get("exit_price", 0))
            qty = trade.get("qty", 0)
            pnl = trade.get("pnl")

            pnl_str = ""
            if pnl is not None:
                pnl_str = f" → P&L: {format_pnl(pnl)}"

            print(f"  {ts} | {action:5} {side:4} {sym:8} | {qty:.4f} @ {format_currency(price)}{pnl_str}")

    # Sentiment
    if os.path.exists(SENTIMENT_LOG_FILE):
        print(f"\n{'─' * 40}")
        print("  LATEST SENTIMENT")
        print(f"{'─' * 40}")
        try:
            with open(SENTIMENT_LOG_FILE, "r") as f:
                lines = f.readlines()
            # Get last sentiment block
            last_block = []
            in_block = False
            for line in reversed(lines):
                if "Sentiment Update:" in line:
                    last_block.append(line.rstrip())
                    in_block = False
                    break
                if line.strip():
                    last_block.append(line.rstrip())
                    in_block = True
            for line in reversed(last_block):
                print(f"  {line}")
        except:
            print("  Could not read sentiment log")

    print(f"\n{'=' * 60}")

    # Show log tail
    log_file = "logs/bot.log"
    if os.path.exists(log_file):
        print(f"\n📋 Last 10 log lines:")
        with open(log_file, "r") as f:
            lines = f.readlines()
            for line in lines[-10:]:
                print(f"  {line.rstrip()}")

    print()


if __name__ == "__main__":
    main()
