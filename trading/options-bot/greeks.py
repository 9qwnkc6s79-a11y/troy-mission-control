"""
Greeks & Volatility Analysis
Calculate/analyze Greeks, IV percentile, IV vs HV, and option pricing.
"""

import logging
import numpy as np
import pandas as pd
from scipy.stats import norm
from datetime import datetime, timedelta
from typing import Optional

import config
from options_chain import get_stock_history

logger = logging.getLogger("options_bot.greeks")


# ─── Black-Scholes Greeks ────────────────────────────────────────────────────

def black_scholes_price(S: float, K: float, T: float, r: float, sigma: float,
                         option_type: str = "call") -> float:
    """
    Black-Scholes option price.
    S: stock price, K: strike, T: time to expiry (years), r: risk-free rate, sigma: volatility
    """
    if T <= 0 or sigma <= 0:
        return max(0, S - K) if option_type == "call" else max(0, K - S)

    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)

    if option_type == "call":
        return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
    else:
        return K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)


def calculate_delta(S: float, K: float, T: float, r: float, sigma: float,
                     option_type: str = "call") -> float:
    """Calculate option delta."""
    if T <= 0 or sigma <= 0:
        if option_type == "call":
            return 1.0 if S > K else 0.0
        else:
            return -1.0 if S < K else 0.0

    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    if option_type == "call":
        return float(norm.cdf(d1))
    else:
        return float(norm.cdf(d1) - 1)


def calculate_gamma(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Calculate option gamma (same for calls and puts)."""
    if T <= 0 or sigma <= 0:
        return 0.0
    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    return float(norm.pdf(d1) / (S * sigma * np.sqrt(T)))


def calculate_theta(S: float, K: float, T: float, r: float, sigma: float,
                     option_type: str = "call") -> float:
    """Calculate option theta (per day)."""
    if T <= 0 or sigma <= 0:
        return 0.0

    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)

    first_term = -(S * norm.pdf(d1) * sigma) / (2 * np.sqrt(T))

    if option_type == "call":
        theta = first_term - r * K * np.exp(-r * T) * norm.cdf(d2)
    else:
        theta = first_term + r * K * np.exp(-r * T) * norm.cdf(-d2)

    return float(theta / 365.0)  # Per-day theta


def calculate_vega(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Calculate option vega (per 1% change in vol)."""
    if T <= 0 or sigma <= 0:
        return 0.0
    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    return float(S * norm.pdf(d1) * np.sqrt(T) / 100.0)


def calculate_all_greeks(S: float, K: float, T: float, r: float, sigma: float,
                          option_type: str = "call") -> dict:
    """Calculate all Greeks for an option."""
    return {
        "delta": calculate_delta(S, K, T, r, sigma, option_type),
        "gamma": calculate_gamma(S, K, T, r, sigma),
        "theta": calculate_theta(S, K, T, r, sigma, option_type),
        "vega": calculate_vega(S, K, T, r, sigma),
        "price": black_scholes_price(S, K, T, r, sigma, option_type),
    }


# ─── Implied Volatility ──────────────────────────────────────────────────────

def implied_volatility(market_price: float, S: float, K: float, T: float,
                        r: float, option_type: str = "call",
                        max_iter: int = 100, tol: float = 1e-6) -> Optional[float]:
    """
    Calculate implied volatility using Newton-Raphson method.
    """
    if market_price <= 0 or T <= 0:
        return None

    sigma = 0.3  # Initial guess
    for _ in range(max_iter):
        price = black_scholes_price(S, K, T, r, sigma, option_type)
        vega = calculate_vega(S, K, T, r, sigma) * 100  # Convert back from per-1%

        diff = price - market_price
        if abs(diff) < tol:
            return sigma

        if abs(vega) < 1e-10:
            break

        sigma -= diff / vega
        if sigma <= 0.001:
            sigma = 0.001
        if sigma > 5.0:
            sigma = 5.0

    return sigma if abs(black_scholes_price(S, K, T, r, sigma, option_type) - market_price) < 0.5 else None


# ─── Historical Volatility ───────────────────────────────────────────────────

def calculate_historical_volatility(ticker: str, lookback_days: int = 30) -> Optional[float]:
    """
    Calculate annualized historical (realized) volatility.
    """
    try:
        hist = get_stock_history(ticker, period="6mo")
        if hist.empty or len(hist) < lookback_days:
            return None

        # Use close-to-close log returns
        prices = hist["Close"].tail(lookback_days + 1)
        log_returns = np.log(prices / prices.shift(1)).dropna()

        if len(log_returns) < 5:
            return None

        hv = float(log_returns.std() * np.sqrt(252))  # Annualize
        return hv
    except Exception as e:
        logger.error(f"Error calculating HV for {ticker}: {e}")
        return None


def calculate_iv_percentile(ticker: str, current_iv: float,
                             lookback_days: int = 252) -> Optional[float]:
    """
    Calculate IV percentile (what % of days in the past year had lower IV).
    Uses ATM implied volatility proxy from historical option-implied data.
    Since we don't have historical IV data, we use realized vol distribution as proxy.
    """
    try:
        hist = get_stock_history(ticker, period="1y")
        if hist.empty or len(hist) < 60:
            return None

        # Calculate rolling 30-day realized volatilities
        log_returns = np.log(hist["Close"] / hist["Close"].shift(1)).dropna()
        rolling_vols = log_returns.rolling(window=30).std() * np.sqrt(252)
        rolling_vols = rolling_vols.dropna()

        if len(rolling_vols) < 30:
            return None

        # IV percentile = % of rolling HVs that are below current IV
        percentile = float((rolling_vols < current_iv).sum() / len(rolling_vols) * 100)
        return percentile
    except Exception as e:
        logger.error(f"Error calculating IV percentile for {ticker}: {e}")
        return None


def iv_vs_hv_zscore(iv: float, ticker: str, lookback_days: int = 30) -> Optional[float]:
    """
    Calculate z-score of IV relative to historical volatility distribution.
    Positive z-score = IV is elevated relative to realized vol.
    """
    try:
        hist = get_stock_history(ticker, period="1y")
        if hist.empty or len(hist) < 60:
            return None

        log_returns = np.log(hist["Close"] / hist["Close"].shift(1)).dropna()
        rolling_vols = log_returns.rolling(window=lookback_days).std() * np.sqrt(252)
        rolling_vols = rolling_vols.dropna()

        if len(rolling_vols) < 30:
            return None

        mean_hv = float(rolling_vols.mean())
        std_hv = float(rolling_vols.std())

        if std_hv < 0.001:
            return None

        z_score = (iv - mean_hv) / std_hv
        return float(z_score)
    except Exception as e:
        logger.error(f"Error calculating IV vs HV z-score for {ticker}: {e}")
        return None


# ─── Volatility Surface Analysis ─────────────────────────────────────────────

def analyze_iv_skew(calls_df: pd.DataFrame, puts_df: pd.DataFrame,
                     stock_price: float) -> dict:
    """
    Analyze the IV skew across strikes.
    Returns skew metrics useful for strategy selection.
    """
    result = {
        "call_iv_mean": None,
        "put_iv_mean": None,
        "atm_iv": None,
        "skew": None,
        "put_call_iv_ratio": None,
    }

    try:
        iv_col = "impliedVolatility"

        if iv_col not in calls_df.columns or iv_col not in puts_df.columns:
            return result

        # Filter for reasonable range (within 20% of stock price)
        low = stock_price * 0.8
        high = stock_price * 1.2

        calls_near = calls_df[(calls_df["strike"] >= low) & (calls_df["strike"] <= high)]
        puts_near = puts_df[(puts_df["strike"] >= low) & (puts_df["strike"] <= high)]

        if calls_near.empty or puts_near.empty:
            return result

        result["call_iv_mean"] = float(calls_near[iv_col].mean())
        result["put_iv_mean"] = float(puts_near[iv_col].mean())

        # ATM IV (nearest to stock price)
        calls_near = calls_near.copy()
        calls_near["dist"] = abs(calls_near["strike"] - stock_price)
        atm_call_iv = float(calls_near.loc[calls_near["dist"].idxmin(), iv_col])
        result["atm_iv"] = atm_call_iv

        # Skew: compare 25-delta put IV to 25-delta call IV (approximate)
        otm_puts = puts_df[puts_df["strike"] < stock_price * 0.95]
        otm_calls = calls_df[calls_df["strike"] > stock_price * 1.05]

        if not otm_puts.empty and not otm_calls.empty:
            result["skew"] = float(otm_puts[iv_col].mean() - otm_calls[iv_col].mean())

        if result["put_iv_mean"] and result["call_iv_mean"]:
            result["put_call_iv_ratio"] = result["put_iv_mean"] / result["call_iv_mean"]

    except Exception as e:
        logger.error(f"Error analyzing IV skew: {e}")

    return result


# ─── Technical Indicators ────────────────────────────────────────────────────

def calculate_rsi(prices: pd.Series, period: int = 14) -> Optional[float]:
    """Calculate RSI."""
    if len(prices) < period + 1:
        return None

    delta = prices.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)

    avg_gain = gain.rolling(window=period).mean().iloc[-1]
    avg_loss = loss.rolling(window=period).mean().iloc[-1]

    if avg_loss == 0:
        return 100.0

    rs = avg_gain / avg_loss
    return float(100 - (100 / (1 + rs)))


def calculate_macd(prices: pd.Series) -> dict:
    """Calculate MACD, signal, and histogram."""
    if len(prices) < 26:
        return {"macd": 0, "signal": 0, "histogram": 0, "cross": None}

    ema12 = prices.ewm(span=12).mean()
    ema26 = prices.ewm(span=26).mean()
    macd = ema12 - ema26
    signal = macd.ewm(span=9).mean()
    histogram = macd - signal

    # Detect cross
    cross = None
    if len(histogram) >= 2:
        if histogram.iloc[-1] > 0 and histogram.iloc[-2] <= 0:
            cross = "bullish"
        elif histogram.iloc[-1] < 0 and histogram.iloc[-2] >= 0:
            cross = "bearish"

    return {
        "macd": float(macd.iloc[-1]),
        "signal": float(signal.iloc[-1]),
        "histogram": float(histogram.iloc[-1]),
        "cross": cross
    }
