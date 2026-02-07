"""
Technical Indicators Module — V2
Computes RSI, EMA, MACD, Bollinger Bands, ADX, ATR.
Adapted for 15-minute and 1-hour timeframes.
"""

import pandas as pd
import numpy as np
import ta
import logging

from config import (
    RSI_PERIOD, EMA_FAST, EMA_SLOW, EMA_TREND,
    BB_PERIOD, BB_STD, MACD_FAST, MACD_SLOW, MACD_SIGNAL,
    ADX_PERIOD, ATR_PERIOD,
)

logger = logging.getLogger("indicators")


def compute_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute all technical indicators on a DataFrame.
    Expects columns: open, high, low, close, volume, timestamp
    """
    if df is None or df.empty:
        return df

    min_required = max(RSI_PERIOD, EMA_SLOW, BB_PERIOD, MACD_SLOW, ADX_PERIOD, EMA_TREND) + 5
    if len(df) < min_required:
        logger.debug(f"Not enough bars ({len(df)}) for indicators (need {min_required})")
        return pd.DataFrame()

    close = df["close"].astype(float)
    high = df["high"].astype(float)
    low = df["low"].astype(float)

    # RSI
    df["rsi"] = ta.momentum.RSIIndicator(close=close, window=RSI_PERIOD).rsi()

    # EMA Fast / Slow / Trend
    df["ema_fast"] = ta.trend.EMAIndicator(close=close, window=EMA_FAST).ema_indicator()
    df["ema_slow"] = ta.trend.EMAIndicator(close=close, window=EMA_SLOW).ema_indicator()
    df["ema_trend"] = ta.trend.EMAIndicator(close=close, window=EMA_TREND).ema_indicator()

    # MACD
    macd_ind = ta.trend.MACD(close=close, window_fast=MACD_FAST, window_slow=MACD_SLOW, window_sign=MACD_SIGNAL)
    df["macd"] = macd_ind.macd()
    df["macd_signal"] = macd_ind.macd_signal()
    df["macd_hist"] = macd_ind.macd_diff()

    # Bollinger Bands
    bb = ta.volatility.BollingerBands(close=close, window=BB_PERIOD, window_dev=BB_STD)
    df["bb_upper"] = bb.bollinger_hband()
    df["bb_lower"] = bb.bollinger_lband()
    df["bb_middle"] = bb.bollinger_mavg()
    df["bb_width"] = (df["bb_upper"] - df["bb_lower"]) / df["bb_middle"]

    # ADX (Average Directional Index)
    adx_ind = ta.trend.ADXIndicator(high=high, low=low, close=close, window=ADX_PERIOD)
    df["adx"] = adx_ind.adx()
    df["plus_di"] = adx_ind.adx_pos()
    df["minus_di"] = adx_ind.adx_neg()

    # ATR (Average True Range)
    df["atr"] = ta.volatility.AverageTrueRange(high=high, low=low, close=close, window=ATR_PERIOD).average_true_range()

    # Volume average
    df["vol_avg"] = df["volume"].rolling(window=20).mean()
    df["vol_ratio"] = df["volume"] / df["vol_avg"]

    return df


def get_ta_signal(df: pd.DataFrame, regime_strategy: str = "trend_follow") -> dict:
    """
    Generate TA signal adapted to the current regime strategy.

    Args:
        df: DataFrame with computed indicators
        regime_strategy: "trend_follow", "mean_revert", or "cautious"

    Returns:
        dict with action, confidence, reason, signals list
    """
    if df is None or df.empty or len(df) < 5:
        return {"action": "hold", "confidence": "low", "reason": "Insufficient data", "signals": []}

    latest = df.iloc[-1]
    prev = df.iloc[-2]

    rsi = latest.get("rsi")
    prev_rsi = prev.get("rsi")
    ema_fast = latest.get("ema_fast")
    ema_slow = latest.get("ema_slow")
    ema_trend = latest.get("ema_trend")
    prev_ema_fast = prev.get("ema_fast")
    prev_ema_slow = prev.get("ema_slow")
    macd = latest.get("macd")
    macd_signal_val = latest.get("macd_signal")
    prev_macd = prev.get("macd")
    prev_macd_signal = prev.get("macd_signal")
    macd_hist = latest.get("macd_hist")
    prev_macd_hist = prev.get("macd_hist")
    bb_upper = latest.get("bb_upper")
    bb_lower = latest.get("bb_lower")
    close = latest["close"]
    prev_close = prev["close"]
    adx = latest.get("adx", 0)

    # Check for NaN
    critical = [rsi, ema_fast, ema_slow, macd, macd_signal_val, bb_upper, bb_lower]
    if any(pd.isna(x) for x in critical):
        return {"action": "hold", "confidence": "low", "reason": "Indicators not ready", "signals": []}

    buy_signals = []
    sell_signals = []
    checks = []

    if regime_strategy == "trend_follow":
        # ═══ TREND-FOLLOWING SIGNALS ═══
        # More weight on momentum, less on reversals

        # RSI momentum (not extreme — look for trending RSI)
        from config import RSI_TREND_BUY, RSI_TREND_SELL
        rsi_rising = rsi > prev_rsi
        rsi_falling = rsi < prev_rsi

        if rsi < RSI_TREND_BUY and rsi_rising:
            buy_signals.append(("rsi_trend", 1, f"RSI={rsi:.1f} < {RSI_TREND_BUY}, rising"))
            checks.append(f"✅ RSI trend buy: {rsi:.1f}")
        elif rsi > RSI_TREND_SELL and rsi_falling:
            sell_signals.append(("rsi_trend", 1, f"RSI={rsi:.1f} > {RSI_TREND_SELL}, falling"))
            checks.append(f"✅ RSI trend sell: {rsi:.1f}")
        else:
            checks.append(f"⬚ RSI: {rsi:.1f}")

        # MACD crossover (primary trend signal)
        if not pd.isna(prev_macd) and not pd.isna(prev_macd_signal):
            if prev_macd <= prev_macd_signal and macd > macd_signal_val:
                buy_signals.append(("macd_cross", 3, "MACD bullish crossover"))
                checks.append("✅ MACD bull cross")
            elif prev_macd >= prev_macd_signal and macd < macd_signal_val:
                sell_signals.append(("macd_cross", 3, "MACD bearish crossover"))
                checks.append("✅ MACD bear cross")
            else:
                checks.append(f"⬚ MACD: {'above' if macd > macd_signal_val else 'below'} signal")

        # EMA crossover
        if not pd.isna(prev_ema_fast) and not pd.isna(prev_ema_slow):
            if prev_ema_fast <= prev_ema_slow and ema_fast > ema_slow:
                buy_signals.append(("ema_cross", 2, f"EMA {EMA_FAST}/{EMA_SLOW} bull cross"))
                checks.append("✅ EMA bull cross")
            elif prev_ema_fast >= prev_ema_slow and ema_fast < ema_slow:
                sell_signals.append(("ema_cross", 2, f"EMA {EMA_FAST}/{EMA_SLOW} bear cross"))
                checks.append("✅ EMA bear cross")
            else:
                checks.append(f"⬚ EMA: fast {'>' if ema_fast > ema_slow else '<'} slow")

        # Price vs EMA trend
        if close > ema_trend and prev_close <= ema_trend and macd > 0:
            buy_signals.append(("trend_break", 2, "Price crossed above EMA trend + MACD positive"))
            checks.append("✅ Trend breakout buy")
        elif close < ema_trend and prev_close >= ema_trend and macd < 0:
            sell_signals.append(("trend_break", 2, "Price crossed below EMA trend + MACD negative"))
            checks.append("✅ Trend breakdown sell")

    elif regime_strategy == "mean_revert":
        # ═══ MEAN REVERSION SIGNALS ═══
        # Focus on Bollinger Band extremes and RSI overbought/oversold
        from config import RSI_OVERSOLD, RSI_OVERBOUGHT

        # RSI extremes
        if rsi < RSI_OVERSOLD:
            weight = 3 if rsi < 25 else 2
            buy_signals.append(("rsi_oversold", weight, f"RSI={rsi:.1f} oversold"))
            checks.append(f"✅ RSI oversold: {rsi:.1f}")
        elif rsi > RSI_OVERBOUGHT:
            weight = 3 if rsi > 75 else 2
            sell_signals.append(("rsi_overbought", weight, f"RSI={rsi:.1f} overbought"))
            checks.append(f"✅ RSI overbought: {rsi:.1f}")
        else:
            checks.append(f"⬚ RSI: {rsi:.1f}")

        # Bollinger Band touches
        if close <= bb_lower:
            buy_signals.append(("bb_lower", 3, f"Price at/below lower BB ({close:.2f} <= {bb_lower:.2f})"))
            checks.append("✅ BB lower touch — buy")
        elif close >= bb_upper:
            sell_signals.append(("bb_upper", 3, f"Price at/above upper BB ({close:.2f} >= {bb_upper:.2f})"))
            checks.append("✅ BB upper touch — sell")
        else:
            bb_range = bb_upper - bb_lower
            if bb_range > 0:
                position = (close - bb_lower) / bb_range
                checks.append(f"⬚ BB position: {position:.2f} (0=lower, 1=upper)")

    else:  # cautious / transitional
        # ═══ CAUTIOUS: require strong multi-signal confirmation ═══
        from config import RSI_OVERSOLD, RSI_OVERBOUGHT

        # Only trade on very strong RSI extremes
        if rsi < 25:
            buy_signals.append(("rsi_extreme", 2, f"RSI={rsi:.1f} extreme oversold"))
            checks.append(f"✅ RSI extreme: {rsi:.1f}")
        elif rsi > 75:
            sell_signals.append(("rsi_extreme", 2, f"RSI={rsi:.1f} extreme overbought"))
            checks.append(f"✅ RSI extreme: {rsi:.1f}")

        # MACD crossover only
        if not pd.isna(prev_macd) and not pd.isna(prev_macd_signal):
            if prev_macd <= prev_macd_signal and macd > macd_signal_val:
                buy_signals.append(("macd_cross", 2, "MACD bull cross"))
                checks.append("✅ MACD bull cross")
            elif prev_macd >= prev_macd_signal and macd < macd_signal_val:
                sell_signals.append(("macd_cross", 2, "MACD bear cross"))
                checks.append("✅ MACD bear cross")

    # ═══ AGGREGATE ═══
    buy_weight = sum(w for _, w, _ in buy_signals)
    sell_weight = sum(w for _, w, _ in sell_signals)

    # Higher threshold for trades — need weight >= 3
    min_weight = 3 if regime_strategy in ("trend_follow", "mean_revert") else 4

    if buy_weight >= min_weight and buy_weight > sell_weight:
        confidence = "high" if buy_weight >= 6 else "medium" if buy_weight >= 4 else "low"
        reasons = "; ".join(r for _, _, r in buy_signals)
        return {
            "action": "buy",
            "confidence": confidence,
            "reason": reasons,
            "signals": checks,
            "buy_weight": buy_weight,
            "sell_weight": sell_weight,
            "ta_details": {
                "rsi": round(float(rsi), 2),
                "macd": round(float(macd), 6),
                "ema_fast": round(float(ema_fast), 2),
                "ema_slow": round(float(ema_slow), 2),
                "adx": round(float(adx), 2) if not pd.isna(adx) else 0,
                "price": round(float(close), 2),
            },
        }
    elif sell_weight >= min_weight and sell_weight > buy_weight:
        confidence = "high" if sell_weight >= 6 else "medium" if sell_weight >= 4 else "low"
        reasons = "; ".join(r for _, _, r in sell_signals)
        return {
            "action": "sell",
            "confidence": confidence,
            "reason": reasons,
            "signals": checks,
            "buy_weight": buy_weight,
            "sell_weight": sell_weight,
            "ta_details": {
                "rsi": round(float(rsi), 2),
                "macd": round(float(macd), 6),
                "ema_fast": round(float(ema_fast), 2),
                "ema_slow": round(float(ema_slow), 2),
                "adx": round(float(adx), 2) if not pd.isna(adx) else 0,
                "price": round(float(close), 2),
            },
        }
    else:
        return {
            "action": "hold",
            "confidence": "low",
            "reason": f"No signal (buy_w={buy_weight}, sell_w={sell_weight}, min={min_weight})",
            "signals": checks,
            "buy_weight": buy_weight,
            "sell_weight": sell_weight,
            "ta_details": {
                "rsi": round(float(rsi), 2),
                "macd": round(float(macd), 6),
                "price": round(float(close), 2),
            },
        }
