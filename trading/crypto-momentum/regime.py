"""
Regime Detection Module — V2
Classifies market state using ADX (trend strength) and ATR (volatility).
Uses 1-hour and 4-hour timeframes to avoid noise.

Regime States:
  - TRENDING_BULLISH: ADX > 25 + price above EMA → momentum/trend entries
  - TRENDING_BEARISH: ADX > 25 + price below EMA → short/avoid longs
  - RANGING: ADX < 20 → mean reversion or sit out
  - HIGH_VOL_NO_TREND: High ATR + low ADX → DO NOT TRADE
  - TRANSITIONAL: ADX between 20-25 → cautious, reduced size
"""

import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Dict

import pandas as pd
import numpy as np

from config import (
    ADX_PERIOD, ADX_TRENDING_THRESHOLD, ADX_RANGING_THRESHOLD,
    ATR_PERIOD, ATR_HIGH_VOL_MULTIPLIER, EMA_TREND,
)

logger = logging.getLogger("regime")


class RegimeState(Enum):
    TRENDING_BULLISH = "trending_bullish"
    TRENDING_BEARISH = "trending_bearish"
    RANGING = "ranging"
    HIGH_VOL_NO_TREND = "high_vol_no_trend"
    TRANSITIONAL = "transitional"
    UNKNOWN = "unknown"


@dataclass
class RegimeInfo:
    state: RegimeState
    adx: float = 0.0
    atr: float = 0.0
    atr_avg: float = 0.0
    volatility: str = "normal"    # low, normal, high
    trend_direction: str = "none"  # bullish, bearish, none
    confidence: float = 0.0       # 0-1 confidence in regime classification
    description: str = ""
    tradeable: bool = True
    preferred_strategy: str = "none"  # trend_follow, mean_revert, none


def compute_adx(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """Compute Average Directional Index (ADX)."""
    high = df['high'].astype(float)
    low = df['low'].astype(float)
    close = df['close'].astype(float)

    # True Range
    tr1 = high - low
    tr2 = (high - close.shift(1)).abs()
    tr3 = (low - close.shift(1)).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)

    # Directional Movement
    up_move = high - high.shift(1)
    down_move = low.shift(1) - low

    plus_dm = pd.Series(np.where((up_move > down_move) & (up_move > 0), up_move, 0), index=df.index)
    minus_dm = pd.Series(np.where((down_move > up_move) & (down_move > 0), down_move, 0), index=df.index)

    # Smoothed averages (Wilder's smoothing)
    atr_smooth = tr.ewm(alpha=1/period, min_periods=period).mean()
    plus_dm_smooth = plus_dm.ewm(alpha=1/period, min_periods=period).mean()
    minus_dm_smooth = minus_dm.ewm(alpha=1/period, min_periods=period).mean()

    # Directional Indicators
    plus_di = 100 * plus_dm_smooth / atr_smooth
    minus_di = 100 * minus_dm_smooth / atr_smooth

    # ADX
    dx = 100 * (plus_di - minus_di).abs() / (plus_di + minus_di)
    adx = dx.ewm(alpha=1/period, min_periods=period).mean()

    return adx


def compute_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """Compute Average True Range (ATR)."""
    high = df['high'].astype(float)
    low = df['low'].astype(float)
    close = df['close'].astype(float)

    tr1 = high - low
    tr2 = (high - close.shift(1)).abs()
    tr3 = (low - close.shift(1)).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)

    atr = tr.ewm(alpha=1/period, min_periods=period).mean()
    return atr


def classify_regime(df_1h: pd.DataFrame, df_4h: Optional[pd.DataFrame] = None) -> RegimeInfo:
    """
    Classify the current market regime based on 1-hour (and optionally 4-hour) bars.

    Args:
        df_1h: 1-hour OHLCV DataFrame
        df_4h: 4-hour OHLCV DataFrame (optional, for confirmation)

    Returns:
        RegimeInfo with classification and metadata
    """
    if df_1h is None or len(df_1h) < ADX_PERIOD + 10:
        return RegimeInfo(
            state=RegimeState.UNKNOWN,
            description="Insufficient data for regime detection",
            tradeable=False,
            preferred_strategy="none",
        )

    # Compute ADX on 1-hour
    adx_series = compute_adx(df_1h, ADX_PERIOD)
    atr_series = compute_atr(df_1h, ATR_PERIOD)

    adx_now = adx_series.iloc[-1]
    atr_now = atr_series.iloc[-1]
    atr_avg = atr_series.rolling(50).mean().iloc[-1] if len(atr_series) >= 50 else atr_series.mean()

    # EMA for trend direction
    close = df_1h['close'].astype(float)
    ema_trend = close.ewm(span=EMA_TREND, adjust=False).mean()
    price_now = close.iloc[-1]
    ema_now = ema_trend.iloc[-1]

    # 4H confirmation (if available)
    adx_4h = None
    if df_4h is not None and len(df_4h) >= ADX_PERIOD + 10:
        adx_4h_series = compute_adx(df_4h, ADX_PERIOD)
        adx_4h = adx_4h_series.iloc[-1]

    # Volatility classification
    vol_ratio = atr_now / atr_avg if atr_avg > 0 else 1.0
    if vol_ratio > ATR_HIGH_VOL_MULTIPLIER:
        volatility = "high"
    elif vol_ratio < 0.7:
        volatility = "low"
    else:
        volatility = "normal"

    # Trend direction
    trend_direction = "bullish" if price_now > ema_now else "bearish"

    # Classify regime
    if pd.isna(adx_now):
        return RegimeInfo(
            state=RegimeState.UNKNOWN,
            description="ADX calculation returned NaN",
            tradeable=False,
            preferred_strategy="none",
        )

    # HIGH VOLATILITY + NO TREND = DANGER ZONE
    if volatility == "high" and adx_now < ADX_TRENDING_THRESHOLD:
        return RegimeInfo(
            state=RegimeState.HIGH_VOL_NO_TREND,
            adx=round(adx_now, 2),
            atr=round(atr_now, 4),
            atr_avg=round(atr_avg, 4),
            volatility=volatility,
            trend_direction=trend_direction,
            confidence=0.8,
            description=f"⚠️ HIGH VOL + NO TREND — ADX={adx_now:.1f}, ATR={atr_now:.4f} ({vol_ratio:.1f}x avg). DO NOT TRADE.",
            tradeable=False,
            preferred_strategy="none",
        )

    # TRENDING MARKET
    if adx_now >= ADX_TRENDING_THRESHOLD:
        confidence = min((adx_now - ADX_TRENDING_THRESHOLD) / 15, 1.0) * 0.8
        # Boost confidence if 4H agrees
        if adx_4h is not None and adx_4h >= ADX_TRENDING_THRESHOLD:
            confidence = min(confidence + 0.2, 1.0)

        if trend_direction == "bullish":
            return RegimeInfo(
                state=RegimeState.TRENDING_BULLISH,
                adx=round(adx_now, 2),
                atr=round(atr_now, 4),
                atr_avg=round(atr_avg, 4),
                volatility=volatility,
                trend_direction="bullish",
                confidence=round(confidence, 2),
                description=f"🟢 TRENDING BULLISH — ADX={adx_now:.1f}, price > EMA{EMA_TREND}. Use momentum entries.",
                tradeable=True,
                preferred_strategy="trend_follow",
            )
        else:
            return RegimeInfo(
                state=RegimeState.TRENDING_BEARISH,
                adx=round(adx_now, 2),
                atr=round(atr_now, 4),
                atr_avg=round(atr_avg, 4),
                volatility=volatility,
                trend_direction="bearish",
                confidence=round(confidence, 2),
                description=f"🔴 TRENDING BEARISH — ADX={adx_now:.1f}, price < EMA{EMA_TREND}. Avoid longs.",
                tradeable=True,
                preferred_strategy="trend_follow",
            )

    # RANGING MARKET
    if adx_now < ADX_RANGING_THRESHOLD:
        return RegimeInfo(
            state=RegimeState.RANGING,
            adx=round(adx_now, 2),
            atr=round(atr_now, 4),
            atr_avg=round(atr_avg, 4),
            volatility=volatility,
            trend_direction="none",
            confidence=round(min((ADX_RANGING_THRESHOLD - adx_now) / 10, 1.0) * 0.7, 2),
            description=f"⚪ RANGING — ADX={adx_now:.1f}. Mean reversion only, or sit out.",
            tradeable=True,
            preferred_strategy="mean_revert",
        )

    # TRANSITIONAL (ADX between 20-25)
    return RegimeInfo(
        state=RegimeState.TRANSITIONAL,
        adx=round(adx_now, 2),
        atr=round(atr_now, 4),
        atr_avg=round(atr_avg, 4),
        volatility=volatility,
        trend_direction=trend_direction,
        confidence=0.4,
        description=f"🟡 TRANSITIONAL — ADX={adx_now:.1f}. Cautious, reduced size.",
        tradeable=True,
        preferred_strategy="cautious",
    )


class RegimeTracker:
    """Tracks regime per symbol with caching."""

    def __init__(self):
        self.regimes: Dict[str, RegimeInfo] = {}
        self.last_update: Dict[str, float] = {}

    def update(self, symbol: str, df_1h: pd.DataFrame, df_4h: Optional[pd.DataFrame] = None):
        """Update regime for a symbol."""
        regime = classify_regime(df_1h, df_4h)
        self.regimes[symbol] = regime
        self.last_update[symbol] = time.time()
        return regime

    def get(self, symbol: str) -> RegimeInfo:
        """Get current regime for a symbol."""
        return self.regimes.get(symbol, RegimeInfo(
            state=RegimeState.UNKNOWN,
            description="No regime data yet",
            tradeable=False,
        ))

    def is_stale(self, symbol: str, max_age: float = 900) -> bool:
        """Check if regime data is stale."""
        last = self.last_update.get(symbol, 0)
        return (time.time() - last) > max_age

    def summary(self) -> str:
        """Get a summary of all regimes."""
        lines = []
        for sym, regime in self.regimes.items():
            lines.append(f"  {sym}: {regime.state.value} (ADX={regime.adx}, ATR={regime.atr}) — {'✅ tradeable' if regime.tradeable else '🚫 no-trade'}")
        return "\n".join(lines) if lines else "  No regime data yet"
