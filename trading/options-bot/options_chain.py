"""
Options Chain Data Fetcher
Combines Yahoo Finance (free Greeks/IV) with Alpaca (execution).
"""

import time
import logging
import requests
import yfinance as yf
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional

import config

logger = logging.getLogger("options_bot.chain")

# Rate limiting
_last_yahoo_call = 0
YAHOO_MIN_INTERVAL = 1.0  # seconds between Yahoo calls


def _rate_limit_yahoo():
    global _last_yahoo_call
    elapsed = time.time() - _last_yahoo_call
    if elapsed < YAHOO_MIN_INTERVAL:
        time.sleep(YAHOO_MIN_INTERVAL - elapsed)
    _last_yahoo_call = time.time()


def get_options_chain_yf(ticker: str, expiration: Optional[str] = None) -> dict:
    """
    Fetch options chain from yfinance.
    Returns dict with 'calls' and 'puts' DataFrames, and 'expirations' list.
    """
    try:
        _rate_limit_yahoo()
        stock = yf.Ticker(ticker)
        expirations = stock.options  # list of expiration date strings

        if not expirations:
            logger.warning(f"No options expirations found for {ticker}")
            return {"calls": pd.DataFrame(), "puts": pd.DataFrame(), "expirations": []}

        if expiration and expiration in expirations:
            target_exp = expiration
        else:
            target_exp = expirations[0]

        chain = stock.option_chain(target_exp)

        calls = chain.calls.copy()
        puts = chain.puts.copy()

        # Add metadata
        calls["expiration"] = target_exp
        calls["underlying"] = ticker
        calls["option_type"] = "call"
        puts["expiration"] = target_exp
        puts["underlying"] = ticker
        puts["option_type"] = "put"

        return {
            "calls": calls,
            "puts": puts,
            "expirations": list(expirations),
            "expiration_used": target_exp
        }
    except Exception as e:
        logger.error(f"Error fetching options chain for {ticker}: {e}")
        return {"calls": pd.DataFrame(), "puts": pd.DataFrame(), "expirations": []}


def get_all_expirations_chain(ticker: str, dte_min: int = 7, dte_max: int = 60) -> list:
    """
    Get options chains across multiple expirations within DTE range.
    Returns list of chain dicts.
    """
    try:
        _rate_limit_yahoo()
        stock = yf.Ticker(ticker)
        expirations = stock.options
        if not expirations:
            return []

        today = datetime.now().date()
        chains = []

        for exp_str in expirations:
            exp_date = datetime.strptime(exp_str, "%Y-%m-%d").date()
            dte = (exp_date - today).days
            if dte_min <= dte <= dte_max:
                chain = get_options_chain_yf(ticker, exp_str)
                chain["dte"] = dte
                chains.append(chain)

        return chains
    except Exception as e:
        logger.error(f"Error fetching multi-expiration chain for {ticker}: {e}")
        return []


def get_stock_price(ticker: str) -> Optional[float]:
    """Get current stock price via yfinance."""
    try:
        _rate_limit_yahoo()
        stock = yf.Ticker(ticker)
        data = stock.history(period="1d")
        if not data.empty:
            return float(data["Close"].iloc[-1])
        return None
    except Exception as e:
        logger.error(f"Error fetching price for {ticker}: {e}")
        return None


def get_stock_history(ticker: str, period: str = "3mo") -> pd.DataFrame:
    """Get historical stock data for technical analysis."""
    try:
        _rate_limit_yahoo()
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        return hist
    except Exception as e:
        logger.error(f"Error fetching history for {ticker}: {e}")
        return pd.DataFrame()


def get_daily_change(ticker: str) -> dict:
    """Get today's price change and volume for a stock."""
    try:
        _rate_limit_yahoo()
        stock = yf.Ticker(ticker)
        hist = stock.history(period="5d")
        if len(hist) < 2:
            return {"change_pct": 0, "volume": 0, "avg_volume": 0, "price": 0}

        current = hist["Close"].iloc[-1]
        prev = hist["Close"].iloc[-2]
        change_pct = (current - prev) / prev
        volume = hist["Volume"].iloc[-1]
        avg_volume = hist["Volume"].mean()

        return {
            "change_pct": float(change_pct),
            "volume": int(volume),
            "avg_volume": float(avg_volume),
            "price": float(current),
            "volume_ratio": float(volume / avg_volume) if avg_volume > 0 else 1.0
        }
    except Exception as e:
        logger.error(f"Error fetching daily change for {ticker}: {e}")
        return {"change_pct": 0, "volume": 0, "avg_volume": 0, "price": 0, "volume_ratio": 1.0}


def get_vix() -> Optional[float]:
    """Get current VIX level."""
    try:
        _rate_limit_yahoo()
        vix = yf.Ticker("^VIX")
        hist = vix.history(period="1d")
        if not hist.empty:
            return float(hist["Close"].iloc[-1])
        return None
    except Exception as e:
        logger.error(f"Error fetching VIX: {e}")
        return None


def find_atm_options(chain: dict, stock_price: float) -> dict:
    """Find the at-the-money call and put from a chain."""
    calls = chain.get("calls", pd.DataFrame())
    puts = chain.get("puts", pd.DataFrame())

    result = {"atm_call": None, "atm_put": None}

    if not calls.empty:
        calls["dist"] = abs(calls["strike"] - stock_price)
        atm_idx = calls["dist"].idxmin()
        result["atm_call"] = calls.loc[atm_idx].to_dict()

    if not puts.empty:
        puts["dist"] = abs(puts["strike"] - stock_price)
        atm_idx = puts["dist"].idxmin()
        result["atm_put"] = puts.loc[atm_idx].to_dict()

    return result


def find_otm_options(chain: dict, stock_price: float, distance_pct: float = 0.05) -> dict:
    """
    Find OTM options at a given distance from current price.
    distance_pct: e.g. 0.05 = 5% OTM
    """
    calls = chain.get("calls", pd.DataFrame())
    puts = chain.get("puts", pd.DataFrame())

    result = {"otm_call": None, "otm_put": None}

    target_call_strike = stock_price * (1 + distance_pct)
    target_put_strike = stock_price * (1 - distance_pct)

    if not calls.empty:
        otm_calls = calls[calls["strike"] >= stock_price]
        if not otm_calls.empty:
            otm_calls = otm_calls.copy()
            otm_calls["dist"] = abs(otm_calls["strike"] - target_call_strike)
            idx = otm_calls["dist"].idxmin()
            result["otm_call"] = otm_calls.loc[idx].to_dict()

    if not puts.empty:
        otm_puts = puts[puts["strike"] <= stock_price]
        if not otm_puts.empty:
            otm_puts = otm_puts.copy()
            otm_puts["dist"] = abs(otm_puts["strike"] - target_put_strike)
            idx = otm_puts["dist"].idxmin()
            result["otm_put"] = otm_puts.loc[idx].to_dict()

    return result


def find_option_by_delta(chain: dict, target_delta: float, option_type: str = "call") -> Optional[dict]:
    """
    Find the option closest to a target delta.
    option_type: 'call' or 'put'
    """
    df = chain.get("calls" if option_type == "call" else "puts", pd.DataFrame())
    if df.empty:
        return None

    # yfinance doesn't always have Greeks - use impliedVolatility as proxy
    # For calls: higher strike = lower delta; for puts: lower strike = higher |delta|
    # If we don't have delta, estimate from moneyness
    if "delta" in df.columns:
        df = df.copy()
        df["delta_dist"] = abs(abs(df["delta"]) - abs(target_delta))
        idx = df["delta_dist"].idxmin()
        return df.loc[idx].to_dict()

    return None


def get_alpaca_options_contracts(ticker: str, expiration_date: str = None,
                                  strike_price: float = None,
                                  option_type: str = None) -> list:
    """
    Get options contracts from Alpaca API for trade execution.
    """
    try:
        headers = {
            "APCA-API-KEY-ID": config.ALPACA_API_KEY,
            "APCA-API-SECRET-KEY": config.ALPACA_API_SECRET,
        }
        params = {
            "underlying_symbols": ticker,
            "status": "active",
            "limit": 100,
        }
        if expiration_date:
            params["expiration_date"] = expiration_date
        if strike_price:
            params["strike_price_gte"] = str(strike_price - 0.5)
            params["strike_price_lte"] = str(strike_price + 0.5)
        if option_type:
            params["type"] = option_type  # "call" or "put"

        url = f"{config.ALPACA_BASE_URL}/v2/options/contracts"
        resp = requests.get(url, headers=headers, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        # Handle both list and dict responses
        if isinstance(data, dict):
            return data.get("option_contracts", data.get("options_contracts", []))
        return data if isinstance(data, list) else []
    except Exception as e:
        logger.error(f"Error fetching Alpaca options contracts for {ticker}: {e}")
        return []


def match_yf_to_alpaca(ticker: str, expiration: str, strike: float,
                        option_type: str) -> Optional[str]:
    """
    Given Yahoo Finance option details, find the matching Alpaca symbol.
    Returns the Alpaca options contract symbol or None.
    """
    contracts = get_alpaca_options_contracts(
        ticker, expiration_date=expiration,
        strike_price=strike, option_type=option_type
    )
    if not contracts:
        return None

    # Find closest strike match
    best = None
    best_dist = float("inf")
    for c in contracts:
        c_strike = float(c.get("strike_price", 0))
        dist = abs(c_strike - strike)
        if dist < best_dist:
            best_dist = dist
            best = c

    if best and best_dist < 1.0:
        return best.get("symbol")
    return None
