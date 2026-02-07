"""
LLM Trade Analyzer — V2
Uses OpenAI (gpt-4o-mini) to evaluate trade conviction before execution.
Acts as final gatekeeper: only trades with conviction >= 7 pass through.
"""

import json
import logging
import os
from typing import Optional

from config import OPENAI_API_KEY, OPENAI_MODEL, LLM_MIN_CONVICTION, LLM_ENABLED

logger = logging.getLogger("llm_analyzer")


def analyze_trade(
    symbol: str,
    action: str,
    confidence: str,
    price: float,
    regime_description: str,
    sentiment_score: float,
    fear_greed_value: int,
    recent_headlines: list,
    ta_details: dict,
    ta_reason: str,
) -> dict:
    """
    Ask the LLM whether we should take this trade.

    Returns: {
        "approved": bool,
        "conviction": int (1-10),
        "reasoning": str,
        "suggested_adjustments": str,
    }
    """
    if not LLM_ENABLED:
        logger.info("LLM analysis disabled, auto-approving")
        return {
            "approved": True,
            "conviction": 7,
            "reasoning": "LLM analysis disabled",
            "suggested_adjustments": "",
        }

    if not OPENAI_API_KEY:
        logger.warning("No OpenAI API key, auto-approving trade")
        return {
            "approved": True,
            "conviction": 5,
            "reasoning": "No API key available",
            "suggested_adjustments": "",
        }

    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)

        headlines_text = "\n".join(f"  - {h}" for h in recent_headlines[:8]) if recent_headlines else "  None available"

        prompt = f"""You are a crypto trading risk analyst. Evaluate this potential trade.

PROPOSED TRADE:
  Action: {action.upper()} {symbol}
  Current Price: ${price:,.2f}
  Signal Confidence: {confidence}
  TA Reason: {ta_reason}

MARKET REGIME:
  {regime_description}

TECHNICAL DETAILS:
  RSI: {ta_details.get('rsi', 'N/A')}
  MACD: {ta_details.get('macd', 'N/A')}
  EMA Fast: {ta_details.get('ema_fast', 'N/A')}
  EMA Slow: {ta_details.get('ema_slow', 'N/A')}
  ADX: {ta_details.get('adx', 'N/A')}

SENTIMENT:
  Overall Score: {sentiment_score:+.3f} (-1 bearish to +1 bullish)
  Fear & Greed Index: {fear_greed_value}

RECENT HEADLINES:
{headlines_text}

EVALUATE:
1. Does the regime support this trade?
2. Does sentiment align with the direction?
3. Are the technicals compelling or marginal?
4. What's the risk/reward outlook?
5. Rate your conviction 1-10 (10 = highly convicted, take the trade)

Respond ONLY with valid JSON:
{{"conviction": 7, "reasoning": "brief explanation", "risk_factors": "key risks", "suggested_adjustments": "any position size or stop adjustments"}}
"""

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a disciplined crypto trading analyst. Be skeptical of marginal trades. Only give conviction >= 7 when multiple factors truly align. Respond only with JSON.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=400,
        )

        result_text = response.choices[0].message.content.strip()
        # Clean markdown code blocks
        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1] if "\n" in result_text else result_text
            result_text = result_text.rsplit("```", 1)[0].strip()

        result = json.loads(result_text)
        conviction = int(result.get("conviction", 5))
        conviction = max(1, min(10, conviction))

        approved = conviction >= LLM_MIN_CONVICTION

        analysis = {
            "approved": approved,
            "conviction": conviction,
            "reasoning": result.get("reasoning", "No reasoning provided"),
            "risk_factors": result.get("risk_factors", ""),
            "suggested_adjustments": result.get("suggested_adjustments", ""),
        }

        emoji = "✅" if approved else "❌"
        logger.info(f"{emoji} LLM Analysis for {action.upper()} {symbol}: conviction={conviction}/10 — {analysis['reasoning'][:120]}")

        return analysis

    except json.JSONDecodeError as e:
        logger.warning(f"Failed to parse LLM response: {e}")
        return {
            "approved": False,
            "conviction": 0,
            "reasoning": f"JSON parse error: {e}",
            "suggested_adjustments": "",
        }
    except Exception as e:
        logger.warning(f"LLM analysis failed: {e}")
        # On error, default to NOT approving (conservative)
        return {
            "approved": False,
            "conviction": 0,
            "reasoning": f"Error: {e}",
            "suggested_adjustments": "",
        }


def get_market_overview(
    regimes: dict,
    sentiment: dict,
    positions: dict,
    equity: float,
    daily_pnl: float,
) -> str:
    """
    Get a brief LLM-generated market overview for logging.
    Uses a cheaper/faster call.
    """
    if not LLM_ENABLED or not OPENAI_API_KEY:
        return "LLM overview disabled"

    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)

        prompt = f"""Brief crypto market overview (2-3 sentences):
- Fear & Greed: {sentiment.get('fear_greed', {}).get('value', '?')} ({sentiment.get('fear_greed', {}).get('classification', '?')})
- BTC sentiment: {sentiment.get('per_symbol', {}).get('BTC/USD', 0):+.2f}
- ETH sentiment: {sentiment.get('per_symbol', {}).get('ETH/USD', 0):+.2f}
- SOL sentiment: {sentiment.get('per_symbol', {}).get('SOL/USD', 0):+.2f}
- Open positions: {len(positions)}
- Account equity: ${equity:,.0f}
- Today P&L: ${daily_pnl:+,.2f}
- Headlines: {'; '.join(sentiment.get('headlines', [])[:5])}

Give a 2-3 sentence market outlook. Be concise."""

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=150,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Overview unavailable: {e}"
