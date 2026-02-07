#!/usr/bin/env python3
"""
Status Display for Options Trading Bot
Shows current positions, Greeks, strategy performance, and recent activity.
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
    if os.path.exists(config.PID_FILE):
        with open(config.PID_FILE, 'r') as f:
            pid = f.read().strip()
        try:
            os.kill(int(pid), 0)
            return True, pid
        except (OSError, ValueError):
            return False, pid
    return False, None


def main():
    print("=" * 65)
    print("🎯  OPTIONS TRADING BOT - Status")
    print("=" * 65)

    # Bot status
    is_running, pid = check_process()
    status_emoji = "🟢" if is_running else "🔴"
    print(f"\nBot Status: {status_emoji} {'RUNNING' if is_running else 'STOPPED'}", end="")
    if pid:
        print(f" (PID: {pid})")
    else:
        print()

    # Load status.json
    status = load_json(config.STATUS_FILE)
    if status:
        print(f"Last Scan: {status.get('last_scan', 'N/A')}")
        print(f"Signals Found: {status.get('signals_found_last_scan', 0)}")
        vix = status.get('vix')
        if vix:
            print(f"VIX: {vix:.2f}")

    # Load trades DB
    db = load_json(config.TRADES_DB)
    if not db:
        db = {"active_trades": {}, "closed_trades": [], "stats": {}}

    active_trades = db.get("active_trades", {})
    closed_trades = db.get("closed_trades", [])
    stats = db.get("stats", {})

    # Capital
    total_risk = sum(t.get("max_risk", 0) for t in active_trades.values())
    available = config.TOTAL_ALLOCATION - total_risk

    print(f"\n{'─' * 50}")
    print(f"💰 Capital Allocation")
    print(f"{'─' * 50}")
    print(f"  Total:      ${config.TOTAL_ALLOCATION:>10,.2f}")
    print(f"  At Risk:    ${total_risk:>10,.2f}")
    print(f"  Available:  ${available:>10,.2f}")

    # Portfolio Greeks
    if status:
        greeks = status.get("portfolio_greeks", {})
        print(f"\n{'─' * 50}")
        print(f"📐 Portfolio Greeks")
        print(f"{'─' * 50}")
        print(f"  Net Delta:     {greeks.get('net_delta', 0):>8.0f}  (limit: ±{config.MAX_NET_DELTA})")
        print(f"  Est. Theta:    {greeks.get('est_theta', 0):>8.2f}")
        print(f"  Total Risk:    ${greeks.get('total_risk', 0):>8,.0f}")
        print(f"  Positions:     {greeks.get('num_positions', 0)}/{config.MAX_CONCURRENT_POSITIONS}")

    # Strategies
    print(f"\n{'─' * 50}")
    print(f"⚡ Strategies")
    print(f"{'─' * 50}")
    strats = [
        ("IV Crush (Earnings)", config.IV_CRUSH_ENABLED),
        ("Mean Reversion", config.MEAN_REVERSION_ENABLED),
        ("Volatility Arbitrage", config.VOL_ARB_ENABLED),
        ("Momentum Options", config.MOMENTUM_ENABLED),
    ]
    for name, enabled in strats:
        emoji = "✅" if enabled else "❌"
        print(f"  {emoji} {name}")

    # Active Positions
    print(f"\n{'─' * 50}")
    print(f"📊 Active Positions ({len(active_trades)})")
    print(f"{'─' * 50}")

    if active_trades:
        for tid, trade in active_trades.items():
            direction_emoji = {
                "bullish": "📈", "bearish": "📉",
                "neutral": "↔️", "neutral_sell": "↔️💰",
                "neutral_buy": "↔️📊"
            }.get(trade.get("direction", ""), "❓")

            print(f"\n  {direction_emoji} {trade['ticker']:6s} | {trade['trade_type']:20s}")
            print(f"    Strategy: {trade['strategy']}")
            print(f"    Direction: {trade.get('direction', 'N/A')}")
            print(f"    Expiration: {trade['expiration']} (DTE@entry: {trade.get('dte_at_entry', '?')})")
            print(f"    Contracts: {trade.get('num_contracts', 1)}")
            print(f"    Max Risk: ${trade.get('max_risk', 0):,.0f}")

            # Show legs
            for leg in trade.get("legs", []):
                print(f"      {leg['action'].upper():4s} {leg['strike']:>8.1f} {leg['type']:4s} "
                      f"@ ${leg.get('mid_price', 0):.2f}")

            credit = trade.get('net_credit', 0)
            debit = trade.get('net_debit', 0)
            if credit > 0:
                print(f"    Net Credit: ${credit:.2f}/contract")
            elif debit > 0:
                print(f"    Net Debit: ${debit:.2f}/contract")

            print(f"    Opened: {trade.get('opened_at', 'N/A')[:19]}")
            print(f"    Score: {trade.get('score', 'N/A')}")
    else:
        print("  No active positions")

    # Performance Stats
    if stats and stats.get("total_trades", 0) > 0:
        print(f"\n{'─' * 50}")
        print(f"📈 Performance Stats")
        print(f"{'─' * 50}")
        print(f"  Total Closed: {stats.get('total_trades', 0)}")
        print(f"  Winners:      {stats.get('winners', 0)}")
        print(f"  Losers:       {stats.get('losers', 0)}")
        print(f"  Win Rate:     {stats.get('win_rate', 0):.1f}%")
        print(f"  Total P&L:    ${stats.get('total_pnl', 0):,.2f}")
        print(f"  Avg P&L:      ${stats.get('avg_pnl', 0):,.2f}")
        print(f"  Best Trade:   ${stats.get('best_trade', 0):,.2f}")
        print(f"  Worst Trade:  ${stats.get('worst_trade', 0):,.2f}")

    # Recent Closed Trades
    if closed_trades:
        print(f"\n{'─' * 50}")
        print(f"📋 Recent Closed Trades (last 5)")
        print(f"{'─' * 50}")
        for trade in closed_trades[-5:]:
            pnl = trade.get("pnl", 0)
            emoji = "✅" if pnl > 0 else "❌" if pnl < 0 else "➖"
            print(f"  {emoji} {trade['ticker']:6s} | {trade['trade_type']:20s} | "
                  f"P&L: ${pnl:>8,.2f} | {trade.get('exit_reason', 'N/A')}")

    # Watchlist
    print(f"\n{'─' * 50}")
    print(f"👁️  Watchlist")
    print(f"{'─' * 50}")
    print(f"  {', '.join(config.WATCHLIST)}")

    # Log tail
    print(f"\n{'─' * 50}")
    print(f"📝 Recent Log (last 15 lines)")
    print(f"{'─' * 50}")

    if os.path.exists(config.LOG_FILE):
        try:
            result = subprocess.run(
                ["tail", "-15", config.LOG_FILE],
                capture_output=True, text=True
            )
            print(result.stdout)
        except Exception:
            print("  Could not read log file")
    else:
        print("  No log file yet")

    print()


if __name__ == "__main__":
    main()
