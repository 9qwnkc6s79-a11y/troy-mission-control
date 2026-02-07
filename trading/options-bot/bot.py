"""
Options Trading Bot - Main Loop
Scans market, evaluates signals, executes trades, manages positions.
"""

import os
import sys
import json
import time
import signal
import logging
import requests
from datetime import datetime, timezone
from logging.handlers import RotatingFileHandler

# Ensure we can import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config
from scanner import MarketScanner
from risk_manager import RiskManager
from options_chain import get_stock_price, match_yf_to_alpaca, get_vix

# ─── Logging Setup ────────────────────────────────────────────────────────────

os.makedirs(config.LOG_DIR, exist_ok=True)

logger = logging.getLogger("options_bot")
logger.setLevel(logging.DEBUG)

# File handler with rotation
fh = RotatingFileHandler(config.LOG_FILE, maxBytes=10_000_000, backupCount=5)
fh.setLevel(logging.DEBUG)
fh.setFormatter(logging.Formatter(
    "%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
))
logger.addHandler(fh)

# Console handler
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
ch.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s", datefmt="%H:%M:%S"))
logger.addHandler(ch)

# Set child loggers
for name in ["options_bot.chain", "options_bot.greeks", "options_bot.scanner",
             "options_bot.risk", "options_bot.iv_crush", "options_bot.mean_reversion",
             "options_bot.vol_arb", "options_bot.momentum"]:
    logging.getLogger(name).setLevel(logging.DEBUG)


# ─── Globals ──────────────────────────────────────────────────────────────────

running = True


def handle_signal(signum, frame):
    global running
    logger.info(f"Received signal {signum}, shutting down...")
    running = False


signal.signal(signal.SIGTERM, handle_signal)
signal.signal(signal.SIGINT, handle_signal)


# ─── Alpaca Trade Execution ──────────────────────────────────────────────────

def get_alpaca_headers():
    return {
        "APCA-API-KEY-ID": config.ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": config.ALPACA_API_SECRET,
        "Content-Type": "application/json"
    }


def get_account_info():
    """Get Alpaca account info."""
    try:
        resp = requests.get(
            f"{config.ALPACA_BASE_URL}/v2/account",
            headers=get_alpaca_headers(),
            timeout=10
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.error(f"Error fetching account info: {e}")
        return None


def get_positions():
    """Get all current positions from Alpaca."""
    try:
        resp = requests.get(
            f"{config.ALPACA_BASE_URL}/v2/positions",
            headers=get_alpaca_headers(),
            timeout=10
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.error(f"Error fetching positions: {e}")
        return []


def place_options_order(symbol: str, qty: int, side: str, order_type: str = "market",
                         limit_price: float = None, time_in_force: str = "day") -> dict:
    """
    Place an options order on Alpaca.
    symbol: OCC options symbol (e.g., AAPL250117C00150000)
    side: 'buy' or 'sell'
    """
    try:
        order = {
            "symbol": symbol,
            "qty": str(qty),
            "side": side,
            "type": order_type,
            "time_in_force": time_in_force,
        }
        if order_type == "limit" and limit_price:
            order["limit_price"] = str(round(limit_price, 2))

        logger.info(f"📤 Placing order: {side} {qty}x {symbol} ({order_type})")

        resp = requests.post(
            f"{config.ALPACA_BASE_URL}/v2/orders",
            headers=get_alpaca_headers(),
            json=order,
            timeout=15
        )

        if resp.status_code in (200, 201):
            result = resp.json()
            logger.info(f"  ✅ Order placed: {result.get('id')} status={result.get('status')}")
            return result
        else:
            logger.error(f"  ❌ Order failed: {resp.status_code} {resp.text}")
            return {"error": resp.text, "status_code": resp.status_code}

    except Exception as e:
        logger.error(f"Error placing order: {e}")
        return {"error": str(e)}


def execute_multi_leg_trade(trade_signal: dict) -> list:
    """
    Execute a multi-leg options trade.
    Returns list of order IDs.
    """
    order_ids = []
    legs = trade_signal.get("legs", [])
    ticker = trade_signal["ticker"]
    expiration = trade_signal["expiration"]
    num_contracts = trade_signal.get("num_contracts", 1)

    logger.info(f"🔄 Executing {trade_signal['trade_type']} on {ticker} ({len(legs)} legs)")

    for leg in legs:
        strike = leg["strike"]
        opt_type = leg["type"]
        action = leg["action"]  # "buy" or "sell"

        # Find Alpaca symbol
        alpaca_symbol = match_yf_to_alpaca(ticker, expiration, strike, opt_type)
        if not alpaca_symbol:
            logger.error(f"  Could not find Alpaca symbol for {ticker} {expiration} "
                        f"{strike} {opt_type}")
            # Try to build OCC symbol manually
            alpaca_symbol = _build_occ_symbol(ticker, expiration, strike, opt_type)
            if not alpaca_symbol:
                continue

        # Use limit order at mid price for better fills
        mid_price = leg.get("mid_price", 0)
        if mid_price > 0:
            result = place_options_order(
                alpaca_symbol, num_contracts, action,
                order_type="limit", limit_price=mid_price
            )
        else:
            result = place_options_order(
                alpaca_symbol, num_contracts, action,
                order_type="market"
            )

        if "error" not in result:
            order_ids.append(result.get("id", "unknown"))
        else:
            logger.error(f"  Leg failed: {action} {strike} {opt_type}: {result.get('error')}")

    return order_ids


def _build_occ_symbol(ticker: str, expiration: str, strike: float,
                       option_type: str) -> str:
    """Build OCC-format options symbol: AAPL250117C00150000"""
    try:
        exp_date = datetime.strptime(expiration, "%Y-%m-%d")
        exp_str = exp_date.strftime("%y%m%d")
        type_char = "C" if option_type == "call" else "P"
        strike_int = int(strike * 1000)
        symbol = f"{ticker:<6}{exp_str}{type_char}{strike_int:08d}"
        return symbol.replace(" ", "")
    except Exception as e:
        logger.error(f"Error building OCC symbol: {e}")
        return None


def close_position_by_trade(trade: dict) -> bool:
    """Close all legs of a trade."""
    logger.info(f"🔄 Closing trade: {trade['trade_id']}")
    ticker = trade["ticker"]
    expiration = trade["expiration"]
    num_contracts = trade.get("num_contracts", 1)

    success = True
    for leg in trade.get("legs", []):
        strike = leg["strike"]
        opt_type = leg["type"]
        # Reverse the original action
        close_action = "sell" if leg["action"] == "buy" else "buy"

        alpaca_symbol = match_yf_to_alpaca(ticker, expiration, strike, opt_type)
        if not alpaca_symbol:
            alpaca_symbol = _build_occ_symbol(ticker, expiration, strike, opt_type)

        if alpaca_symbol:
            result = place_options_order(
                alpaca_symbol, num_contracts, close_action,
                order_type="market"
            )
            if "error" in result:
                logger.error(f"  Failed to close leg: {strike} {opt_type}")
                success = False
        else:
            logger.error(f"  Could not find symbol to close {strike} {opt_type}")
            success = False

    return success


# ─── Status File ──────────────────────────────────────────────────────────────

def write_status(risk_mgr: RiskManager, last_scan_time: str = None,
                  signals_found: int = 0, vix: float = None):
    """Write status.json for dashboard compatibility."""
    try:
        active = risk_mgr.trades_db.get("active_trades", {})
        stats = risk_mgr.trades_db.get("stats", {})
        greeks = risk_mgr.get_portfolio_greeks()

        # Check if running
        is_running = True
        pid = os.getpid()

        total_deployed = sum(t.get("max_risk", 0) for t in active.values())

        status = {
            "bot_name": "Options Trading Bot",
            "bot_type": "options",
            "status": "running" if is_running else "stopped",
            "pid": pid,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "last_scan": last_scan_time or "N/A",
            "signals_found_last_scan": signals_found,
            "vix": vix,
            "capital": {
                "total_allocation": config.TOTAL_ALLOCATION,
                "deployed": total_deployed,
                "available": config.TOTAL_ALLOCATION - total_deployed,
            },
            "positions": {
                "active": len(active),
                "max": config.MAX_CONCURRENT_POSITIONS,
            },
            "portfolio_greeks": greeks,
            "performance": stats,
            "active_trades": {
                tid: {
                    "ticker": t["ticker"],
                    "strategy": t["strategy"],
                    "trade_type": t["trade_type"],
                    "direction": t.get("direction", "neutral"),
                    "expiration": t["expiration"],
                    "max_risk": t.get("max_risk", 0),
                    "opened_at": t.get("opened_at", ""),
                    "reason": t.get("reason", "")[:100],
                }
                for tid, t in active.items()
            },
            "strategies": {
                "iv_crush": {"enabled": config.IV_CRUSH_ENABLED},
                "mean_reversion": {"enabled": config.MEAN_REVERSION_ENABLED},
                "vol_arb": {"enabled": config.VOL_ARB_ENABLED},
                "momentum": {"enabled": config.MOMENTUM_ENABLED},
            },
            "watchlist": config.WATCHLIST,
        }

        with open(config.STATUS_FILE, 'w') as f:
            json.dump(status, f, indent=2, default=str)

    except Exception as e:
        logger.error(f"Error writing status: {e}")


# ─── Market Hours Check ──────────────────────────────────────────────────────

def is_market_hours() -> bool:
    """Check if we're within market hours (9:30 AM - 4:00 PM ET)."""
    from datetime import timezone as tz
    try:
        import zoneinfo
        et = zoneinfo.ZoneInfo("America/New_York")
    except ImportError:
        # Fallback: assume UTC-5 (EST) or UTC-4 (EDT)
        import datetime as dt
        et = timezone(offset=dt.timedelta(hours=-5))

    now_et = datetime.now(tz=et if isinstance(et, timezone) else None)
    if hasattr(et, 'key'):
        now_et = datetime.now(et)

    # Check weekday (0=Mon, 6=Sun)
    if now_et.weekday() >= 5:
        return False

    market_open = now_et.replace(
        hour=config.MARKET_OPEN_HOUR, minute=config.MARKET_OPEN_MINUTE, second=0
    )
    market_close = now_et.replace(
        hour=config.MARKET_CLOSE_HOUR, minute=0, second=0
    )

    return market_open <= now_et <= market_close


# ─── Main Loop ────────────────────────────────────────────────────────────────

def main():
    global running

    logger.info("=" * 60)
    logger.info("🎯 OPTIONS TRADING BOT - Starting")
    logger.info("=" * 60)

    # Write PID file
    with open(config.PID_FILE, 'w') as f:
        f.write(str(os.getpid()))

    # Verify Alpaca connection
    account = get_account_info()
    if account:
        logger.info(f"💰 Alpaca account: {account.get('account_number', 'N/A')}")
        logger.info(f"   Equity: ${float(account.get('equity', 0)):,.2f}")
        logger.info(f"   Cash: ${float(account.get('cash', 0)):,.2f}")
        logger.info(f"   Options allocation: ${config.TOTAL_ALLOCATION:,.2f}")
        options_approved = account.get("options_trading_level", account.get("options_approved_level", "N/A"))
        logger.info(f"   Options level: {options_approved}")
    else:
        logger.error("❌ Could not connect to Alpaca!")
        logger.info("Continuing anyway — will retry on next scan")

    # Initialize components
    scanner = MarketScanner()
    risk_mgr = RiskManager()

    # Initial VIX check
    vix = get_vix()
    if vix:
        logger.info(f"📊 VIX: {vix:.2f}")

    # Write initial status
    write_status(risk_mgr, vix=vix)

    logger.info(f"\n📋 Configuration:")
    logger.info(f"   Allocation: ${config.TOTAL_ALLOCATION:,.0f}")
    logger.info(f"   Max risk/trade: ${config.MAX_RISK_PER_TRADE:,.0f}")
    logger.info(f"   Max positions: {config.MAX_CONCURRENT_POSITIONS}")
    logger.info(f"   Watchlist: {config.WATCHLIST}")
    logger.info(f"   Scan interval: {config.SCAN_INTERVAL_SECONDS}s")
    logger.info(f"   Strategies: IV Crush={config.IV_CRUSH_ENABLED}, "
                f"Mean Rev={config.MEAN_REVERSION_ENABLED}, "
                f"Vol Arb={config.VOL_ARB_ENABLED}, "
                f"Momentum={config.MOMENTUM_ENABLED}")

    # ─── Initial scan on startup ─────────────────────────────────────────
    logger.info("\n🚀 Running initial full market scan...")
    try:
        signals = scanner.full_scan()
        ranked = scanner.rank_signals(signals)
        last_scan = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        write_status(risk_mgr, last_scan_time=last_scan, signals_found=len(ranked), vix=vix)

        if ranked:
            logger.info(f"\n📊 Top signals from initial scan:")
            for sig in ranked[:5]:
                logger.info(f"   {sig['ticker']} | {sig['strategy']} | {sig['trade_type']} | "
                          f"score={sig.get('score', 0)} | {sig.get('reason', '')[:80]}")
    except Exception as e:
        logger.error(f"Error in initial scan: {e}", exc_info=True)

    # ─── Main loop ────────────────────────────────────────────────────────
    scan_count = 0
    last_scan_ts = time.time()

    while running:
        try:
            now = time.time()

            # Check if it's time to scan
            if now - last_scan_ts >= config.SCAN_INTERVAL_SECONDS:
                scan_count += 1
                vix = get_vix()

                if is_market_hours():
                    logger.info(f"\n🔄 Scan #{scan_count} (market hours)")

                    # 1. Check existing positions for exits
                    exits = risk_mgr.check_exits()
                    for trade_id, reason in exits:
                        trade = risk_mgr.trades_db["active_trades"].get(trade_id)
                        if trade:
                            logger.info(f"⚠️ Exit trigger: {trade_id} — {reason}")
                            closed = close_position_by_trade(trade)
                            if closed:
                                # Estimate P&L (simplified — actual P&L requires current prices)
                                risk_mgr.record_trade_close(trade_id, reason, pnl=0, pnl_pct=0)
                            else:
                                logger.error(f"Failed to close {trade_id}")

                    # 2. Scan for new opportunities
                    signals = scanner.full_scan()
                    ranked = scanner.rank_signals(signals)

                    # 3. Execute top signals within risk limits
                    for signal in ranked:
                        can_open, reason = risk_mgr.can_open_position(signal)
                        if not can_open:
                            logger.info(f"  ⏭️ Skip {signal['ticker']} {signal['trade_type']}: {reason}")
                            continue

                        port_ok, port_reason = risk_mgr.check_portfolio_limits(signal)
                        if not port_ok:
                            logger.info(f"  ⏭️ Skip {signal['ticker']} {signal['trade_type']}: {port_reason}")
                            continue

                        # Execute!
                        logger.info(f"\n💎 EXECUTING: {signal['ticker']} {signal['trade_type']} "
                                  f"(score={signal.get('score', 0)})")
                        order_ids = execute_multi_leg_trade(signal)

                        if order_ids:
                            risk_mgr.record_trade_open(signal, order_ids)
                            logger.info(f"  ✅ Trade opened: {len(order_ids)} orders placed")
                        else:
                            logger.warning(f"  ⚠️ No orders filled for {signal['ticker']}")

                else:
                    logger.info(f"🌙 After hours — monitoring positions only (scan #{scan_count})")

                    # Still check exits (DTE-based)
                    exits = risk_mgr.check_exits()
                    for trade_id, reason in exits:
                        logger.info(f"⚠️ Exit needed (will execute at market open): {trade_id} — {reason}")

                last_scan = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                write_status(risk_mgr, last_scan_time=last_scan,
                           signals_found=len(ranked) if is_market_hours() else 0,
                           vix=vix)
                last_scan_ts = now

            # Sleep 30 seconds between checks
            time.sleep(30)

        except KeyboardInterrupt:
            break
        except Exception as e:
            logger.error(f"Error in main loop: {e}", exc_info=True)
            time.sleep(60)

    # ─── Cleanup ──────────────────────────────────────────────────────────
    logger.info("🛑 Bot shutting down...")
    write_status(risk_mgr, vix=vix)

    # Remove PID file
    try:
        os.remove(config.PID_FILE)
    except OSError:
        pass

    logger.info("👋 Goodbye!")


if __name__ == "__main__":
    main()
