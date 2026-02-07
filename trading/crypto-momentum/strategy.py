"""
Strategy Module — V2: Multi-Layer Signal Generation
Combines Regime + Sentiment + TA into a single trade decision.

Signal Rules:
  - Trending + Bullish sentiment + TA confirms → BUY (high confidence)
  - Trending + Neutral sentiment + TA confirms → BUY (medium confidence)
  - Ranging → only extreme fear/greed reversals with tight stops
  - High vol + no trend → NO TRADE
  - Never trade on TA alone
"""

import logging
from dataclasses import dataclass
from typing import Optional

from regime import RegimeState, RegimeInfo
from config import FEAR_GREED_EXTREME_FEAR, FEAR_GREED_EXTREME_GREED

logger = logging.getLogger("strategy")


@dataclass
class TradeSignal:
    action: str           # "buy", "sell", "hold"
    confidence: str       # "high", "medium", "low"
    reason: str
    regime: str
    sentiment_score: float
    ta_action: str
    layers_agreeing: int  # how many layers agree (0-3)
    tradeable: bool       # final decision: should we even consider this trade?


def generate_signal(
    symbol: str,
    regime: RegimeInfo,
    sentiment_score: float,
    fear_greed_value: int,
    ta_signal: dict,
) -> TradeSignal:
    """
    Multi-layer signal generation.

    Layer 1: Regime must allow trading
    Layer 2: Sentiment direction
    Layer 3: TA confirmation

    Only generates actionable signals when multiple layers agree.
    """
    ta_action = ta_signal.get("action", "hold")
    ta_confidence = ta_signal.get("confidence", "low")
    ta_reason = ta_signal.get("reason", "")
    reasons = []

    # ═══════════════════════════════════════════════════════════════
    # LAYER 1: REGIME GATE
    # ═══════════════════════════════════════════════════════════════

    if not regime.tradeable:
        return TradeSignal(
            action="hold",
            confidence="low",
            reason=f"REGIME BLOCKED: {regime.description}",
            regime=regime.state.value,
            sentiment_score=sentiment_score,
            ta_action=ta_action,
            layers_agreeing=0,
            tradeable=False,
        )

    if regime.state == RegimeState.HIGH_VOL_NO_TREND:
        return TradeSignal(
            action="hold",
            confidence="low",
            reason=f"HIGH VOL NO TREND — sitting out. ADX={regime.adx}",
            regime=regime.state.value,
            sentiment_score=sentiment_score,
            ta_action=ta_action,
            layers_agreeing=0,
            tradeable=False,
        )

    # ═══════════════════════════════════════════════════════════════
    # LAYER 2 + 3: REGIME-SPECIFIC SIGNAL LOGIC
    # ═══════════════════════════════════════════════════════════════

    # Sentiment classification
    sentiment_bullish = sentiment_score > 0.15
    sentiment_bearish = sentiment_score < -0.15
    sentiment_neutral = not sentiment_bullish and not sentiment_bearish

    # Count agreeing layers
    layers = 0

    # ─── TRENDING BULLISH ───
    if regime.state == RegimeState.TRENDING_BULLISH:
        reasons.append(f"Regime: TRENDING BULLISH (ADX={regime.adx})")

        if ta_action == "buy":
            layers += 2  # Regime + TA agree
            reasons.append(f"TA: BUY ({ta_confidence}) — {ta_reason}")

            if sentiment_bullish:
                layers += 1
                reasons.append(f"Sentiment: BULLISH ({sentiment_score:+.3f})")
                return TradeSignal(
                    action="buy",
                    confidence="high",
                    reason=" | ".join(reasons),
                    regime=regime.state.value,
                    sentiment_score=sentiment_score,
                    ta_action=ta_action,
                    layers_agreeing=3,
                    tradeable=True,
                )
            elif sentiment_neutral:
                reasons.append(f"Sentiment: NEUTRAL ({sentiment_score:+.3f})")
                return TradeSignal(
                    action="buy",
                    confidence="medium",
                    reason=" | ".join(reasons),
                    regime=regime.state.value,
                    sentiment_score=sentiment_score,
                    ta_action=ta_action,
                    layers_agreeing=2,
                    tradeable=True,
                )
            else:
                # Bearish sentiment in bullish trend — conflict, skip
                reasons.append(f"Sentiment: BEARISH ({sentiment_score:+.3f}) — CONFLICTING")
                return TradeSignal(
                    action="hold",
                    confidence="low",
                    reason=" | ".join(reasons),
                    regime=regime.state.value,
                    sentiment_score=sentiment_score,
                    ta_action=ta_action,
                    layers_agreeing=1,
                    tradeable=False,
                )

        elif ta_action == "sell":
            # Sell signal in bullish trend — only if sentiment agrees strongly
            if sentiment_bearish:
                reasons.append(f"TA: SELL in bullish trend + bearish sentiment ({sentiment_score:+.3f})")
                return TradeSignal(
                    action="sell",
                    confidence="low",
                    reason=" | ".join(reasons),
                    regime=regime.state.value,
                    sentiment_score=sentiment_score,
                    ta_action=ta_action,
                    layers_agreeing=1,
                    tradeable=True,
                )

        reasons.append(f"TA: {ta_action.upper()} — waiting for confirmation")

    # ─── TRENDING BEARISH ───
    elif regime.state == RegimeState.TRENDING_BEARISH:
        reasons.append(f"Regime: TRENDING BEARISH (ADX={regime.adx})")

        if ta_action == "sell" and symbol in ["BTC/USD", "ETH/USD", "SOL/USD"]:
            # Can't short crypto on most platforms, so this means "close longs" or "avoid buying"
            reasons.append("Bearish trend — avoiding new longs")

        # Only buy in bearish trend if extreme fear + strong TA reversal
        if ta_action == "buy" and sentiment_bullish and fear_greed_value < FEAR_GREED_EXTREME_FEAR:
            reasons.append(f"Contrarian: Extreme fear ({fear_greed_value}) + bullish sentiment + buy signal")
            return TradeSignal(
                action="buy",
                confidence="low",
                reason=" | ".join(reasons),
                regime=regime.state.value,
                sentiment_score=sentiment_score,
                ta_action=ta_action,
                layers_agreeing=2,
                tradeable=True,
            )

        reasons.append("Bearish trend — sitting out")

    # ─── RANGING ───
    elif regime.state == RegimeState.RANGING:
        reasons.append(f"Regime: RANGING (ADX={regime.adx})")

        # Only trade extreme fear/greed reversals
        if fear_greed_value < FEAR_GREED_EXTREME_FEAR and ta_action == "buy":
            reasons.append(f"Extreme Fear reversal ({fear_greed_value}) + TA buy")
            return TradeSignal(
                action="buy",
                confidence="medium" if sentiment_bullish else "low",
                reason=" | ".join(reasons),
                regime=regime.state.value,
                sentiment_score=sentiment_score,
                ta_action=ta_action,
                layers_agreeing=2,
                tradeable=True,
            )
        elif fear_greed_value > FEAR_GREED_EXTREME_GREED and ta_action == "sell":
            reasons.append(f"Extreme Greed reversal ({fear_greed_value}) + TA sell")
            return TradeSignal(
                action="sell",
                confidence="medium" if sentiment_bearish else "low",
                reason=" | ".join(reasons),
                regime=regime.state.value,
                sentiment_score=sentiment_score,
                ta_action=ta_action,
                layers_agreeing=2,
                tradeable=True,
            )

        # Mean reversion in ranging — need TA + sentiment alignment
        if ta_action == "buy" and sentiment_bullish:
            reasons.append(f"Mean reversion buy: TA + bullish sentiment in range")
            return TradeSignal(
                action="buy",
                confidence="low",
                reason=" | ".join(reasons),
                regime=regime.state.value,
                sentiment_score=sentiment_score,
                ta_action=ta_action,
                layers_agreeing=2,
                tradeable=True,
            )

        reasons.append("Ranging — no strong reversal signal")

    # ─── TRANSITIONAL ───
    elif regime.state == RegimeState.TRANSITIONAL:
        reasons.append(f"Regime: TRANSITIONAL (ADX={regime.adx})")

        # Extra cautious — need all layers to agree
        if ta_action == "buy" and sentiment_bullish and ta_confidence in ("high", "medium"):
            reasons.append(f"Cautious buy: strong TA ({ta_confidence}) + bullish sentiment")
            return TradeSignal(
                action="buy",
                confidence="low",
                reason=" | ".join(reasons),
                regime=regime.state.value,
                sentiment_score=sentiment_score,
                ta_action=ta_action,
                layers_agreeing=2,
                tradeable=True,
            )

        reasons.append("Transitional — insufficient confirmation")

    # Default: hold
    return TradeSignal(
        action="hold",
        confidence="low",
        reason=" | ".join(reasons) if reasons else "No actionable signal",
        regime=regime.state.value,
        sentiment_score=sentiment_score,
        ta_action=ta_action,
        layers_agreeing=layers,
        tradeable=False,
    )
