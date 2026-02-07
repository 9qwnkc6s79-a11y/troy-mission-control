"""
Stock Trade Executor
Executes stock (equity) orders on Alpaca as an alternative/complement to options.
Used when:
- Options analysis generates a directional signal → execute with shares
- Options execution fails → fall back to stock order
- Strategy indicates stock trade is preferable
"""

import logging
import math
import requests
from typing import Optional

import config

logger = logging.getLogger("options_bot.stock_exec")


def get_alpaca_headers():
    return {
        "APCA-API-KEY-ID": config.ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": config.ALPACA_API_SECRET,
        "Content-Type": "application/json",
    }


def place_stock_order(
    symbol: str,
    qty: int,
    side: str,
    order_type: str = "market",
    limit_price: float = None,
    stop_price: float = None,
    time_in_force: str = "day",
) -> dict:
    """
    Place a stock order on Alpaca.
    Returns order dict or error dict.
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
        if order_type == "stop_limit" and stop_price:
            order["stop_price"] = str(round(stop_price, 2))
            if limit_price:
                order["limit_price"] = str(round(limit_price, 2))

        logger.info(f"📤 Placing STOCK order: {side} {qty}x {symbol} ({order_type})")

        resp = requests.post(
            f"{config.ALPACA_BASE_URL}/v2/orders",
            headers=get_alpaca_headers(),
            json=order,
            timeout=15,
        )

        if resp.status_code in (200, 201):
            result = resp.json()
            logger.info(f"  ✅ Stock order placed: {result.get('id')} status={result.get('status')}")
            return result
        else:
            logger.error(f"  ❌ Stock order failed: {resp.status_code} {resp.text}")
            return {"error": resp.text, "status_code": resp.status_code}

    except Exception as e:
        logger.error(f"Error placing stock order: {e}")
        return {"error": str(e)}


def place_bracket_order(
    symbol: str,
    qty: int,
    side: str,
    take_profit_price: float,
    stop_loss_price: float,
    limit_price: float = None,
) -> dict:
    """
    Place a bracket order (entry + take profit + stop loss) on Alpaca.
    This is the ideal way to execute stock trades with built-in risk management.
    """
    try:
        order = {
            "symbol": symbol,
            "qty": str(qty),
            "side": side,
            "type": "market" if not limit_price else "limit",
            "time_in_force": "gtc",
            "order_class": "bracket",
            "take_profit": {
                "limit_price": str(round(take_profit_price, 2)),
            },
            "stop_loss": {
                "stop_price": str(round(stop_loss_price, 2)),
            },
        }
        if limit_price:
            order["limit_price"] = str(round(limit_price, 2))

        logger.info(
            f"📤 BRACKET order: {side} {qty}x {symbol} | "
            f"TP=${take_profit_price:.2f} SL=${stop_loss_price:.2f}"
        )

        resp = requests.post(
            f"{config.ALPACA_BASE_URL}/v2/orders",
            headers=get_alpaca_headers(),
            json=order,
            timeout=15,
        )

        if resp.status_code in (200, 201):
            result = resp.json()
            logger.info(f"  ✅ Bracket order placed: {result.get('id')} status={result.get('status')}")
            return result
        else:
            logger.error(f"  ❌ Bracket order failed: {resp.status_code} {resp.text}")
            return {"error": resp.text, "status_code": resp.status_code}

    except Exception as e:
        logger.error(f"Error placing bracket order: {e}")
        return {"error": str(e)}


def execute_stock_signal(signal: dict, regime_multiplier: float = 1.0) -> dict:
    """
    Convert an options signal into a stock trade and execute it.

    Logic:
    - Bullish signal → buy shares
    - Bearish signal → short shares (if allowed)
    - Neutral → skip (can't express neutral with stocks)

    Returns trade result dict.
    """
    ticker = signal["ticker"]
    direction = signal.get("direction", "")
    price = signal.get("stock_price", 0)

    if price <= 0:
        return {"error": "No stock price available"}

    if direction in ("neutral", "neutral_sell", "neutral_buy"):
        logger.info(f"  ⏭️ Skip stock trade for {ticker}: neutral direction not suitable for stock")
        return {"error": "Neutral signals not suitable for stock trades"}

    # Calculate position size
    stop_loss_pct = config.STOCK_STOP_LOSS_PCT
    take_profit_pct = config.STOCK_TAKE_PROFIT_PCT

    risk_per_share = price * stop_loss_pct
    if risk_per_share <= 0:
        return {"error": "Invalid risk calculation"}

    max_risk = min(config.MAX_RISK_PER_TRADE, config.STOCK_POSITION_MAX * stop_loss_pct)
    max_risk *= regime_multiplier

    qty = max(1, int(max_risk / risk_per_share))

    # Cap position value
    position_value = qty * price
    if position_value > config.STOCK_POSITION_MAX * regime_multiplier:
        qty = max(1, int(config.STOCK_POSITION_MAX * regime_multiplier / price))

    if direction == "bullish":
        side = "buy"
        take_profit = round(price * (1 + take_profit_pct), 2)
        stop_loss = round(price * (1 - stop_loss_pct), 2)
    elif direction == "bearish":
        side = "sell"
        take_profit = round(price * (1 - take_profit_pct), 2)
        stop_loss = round(price * (1 + stop_loss_pct), 2)
    else:
        return {"error": f"Unknown direction: {direction}"}

    logger.info(
        f"🔄 Stock trade: {side} {qty}x {ticker} @ ~${price:.2f} | "
        f"TP=${take_profit:.2f} SL=${stop_loss:.2f} | "
        f"Risk: ${qty * price * stop_loss_pct:.0f}"
    )

    # Execute bracket order
    result = place_bracket_order(
        symbol=ticker,
        qty=qty,
        side=side,
        take_profit_price=take_profit,
        stop_loss_price=stop_loss,
    )

    if "error" not in result:
        return {
            "order_id": result.get("id"),
            "symbol": ticker,
            "qty": qty,
            "side": side,
            "price": price,
            "take_profit": take_profit,
            "stop_loss": stop_loss,
            "execution_type": "stock_bracket",
            "status": result.get("status"),
        }
    else:
        # Fallback: simple market order
        logger.warning(f"  Bracket order failed, trying simple market order for {ticker}")
        fallback = place_stock_order(ticker, qty, side, order_type="market")
        if "error" not in fallback:
            return {
                "order_id": fallback.get("id"),
                "symbol": ticker,
                "qty": qty,
                "side": side,
                "price": price,
                "take_profit": take_profit,
                "stop_loss": stop_loss,
                "execution_type": "stock_market_fallback",
                "status": fallback.get("status"),
            }
        return {"error": f"Both bracket and market orders failed: {result.get('error')}"}


def close_stock_position(symbol: str) -> dict:
    """Close an entire stock position."""
    try:
        resp = requests.delete(
            f"{config.ALPACA_BASE_URL}/v2/positions/{symbol}",
            headers=get_alpaca_headers(),
            timeout=15,
        )
        if resp.status_code in (200, 204):
            logger.info(f"  ✅ Closed stock position: {symbol}")
            return resp.json() if resp.text else {"status": "closed"}
        else:
            logger.error(f"  ❌ Failed to close {symbol}: {resp.status_code} {resp.text}")
            return {"error": resp.text}
    except Exception as e:
        logger.error(f"Error closing stock position {symbol}: {e}")
        return {"error": str(e)}
