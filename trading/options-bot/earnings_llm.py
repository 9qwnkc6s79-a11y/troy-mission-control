"""
LLM-Powered Earnings Analysis
Uses OpenAI gpt-4o-mini to evaluate earnings plays before executing.
"""

import json
import logging
import os
import requests
from typing import Optional

import config

logger = logging.getLogger("options_bot.earnings_llm")


def analyze_earnings_play(
    ticker: str,
    earnings_date: str,
    price_data: dict,
    implied_move_pct: float,
    hist_earnings_moves: list,
    iv_percentile: float,
    atm_iv: float,
    vix: float = None,
) -> dict:
    """
    Call OpenAI to analyze an earnings play.
    
    Returns dict with:
        - should_trade: bool
        - conviction: int (1-10)
        - recommended_strategy: str  
        - reasoning: str
        - direction: str (flat/up/down/big_move)
    """
    api_key = config.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        logger.warning("No OpenAI API key — skipping LLM earnings analysis")
        return {"should_trade": True, "conviction": 5, "recommended_strategy": "iron_condor",
                "reasoning": "No LLM available, defaulting to iron condor", "direction": "flat"}

    # Build context
    recent_changes = price_data.get("recent_daily_changes", [])
    recent_str = ", ".join([f"{c:+.1%}" for c in recent_changes[-5:]]) if recent_changes else "N/A"
    
    hist_moves_str = ", ".join([f"{m:+.1%}" for m in hist_earnings_moves[-6:]]) if hist_earnings_moves else "N/A"
    
    vix_str = f"{vix:.1f}" if vix else "Unknown"
    
    prompt = f"""Analyze {ticker} ahead of earnings on {earnings_date}.

Current price action (last 5 days): {recent_str}
Current IV: {atm_iv:.0%} (percentile: {iv_percentile:.0f}%)
Options implied move: {implied_move_pct:.1f}%
Historical earnings moves (last 6 quarters): {hist_moves_str}
VIX level: {vix_str}

Should we play this earnings? If yes, recommend one:
- iron_condor (expect stock stays flat, sell premium)
- bull_spread (expect stock goes up)
- bear_spread (expect stock goes down)
- straddle (expect big move either direction)
- skip (don't trade this one)

Rate your conviction 1-10 (10 = extremely confident).

Respond in JSON only:
{{"should_trade": true/false, "conviction": 1-10, "strategy": "iron_condor|bull_spread|bear_spread|straddle|skip", "direction": "flat|up|down|big_move", "reasoning": "brief explanation"}}"""

    try:
        resp = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": config.OPENAI_MODEL,
                "messages": [
                    {"role": "system", "content": "You are a quantitative options analyst. Respond only in valid JSON."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.3,
                "max_tokens": 300,
            },
            timeout=30,
        )
        resp.raise_for_status()
        
        content = resp.json()["choices"][0]["message"]["content"].strip()
        
        # Parse JSON (handle markdown code blocks)
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        result = json.loads(content)
        
        conviction = int(result.get("conviction", 5))
        should_trade = result.get("should_trade", False) and conviction >= config.LLM_MIN_CONVICTION
        strategy = result.get("strategy", "skip")
        direction = result.get("direction", "flat")
        reasoning = result.get("reasoning", "No reasoning provided")
        
        logger.info(f"🧠 LLM Earnings Analysis for {ticker}:")
        logger.info(f"   Conviction: {conviction}/10 | Strategy: {strategy} | Direction: {direction}")
        logger.info(f"   Should trade: {should_trade} | Reasoning: {reasoning[:120]}")
        
        return {
            "should_trade": should_trade,
            "conviction": conviction,
            "recommended_strategy": strategy,
            "direction": direction,
            "reasoning": reasoning,
        }

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM response for {ticker}: {e}")
        return {"should_trade": False, "conviction": 0, "recommended_strategy": "skip",
                "reasoning": f"JSON parse error: {e}", "direction": "flat"}
    except Exception as e:
        logger.error(f"LLM API error for {ticker}: {e}")
        # On API failure, allow trade with moderate conviction (don't block)
        return {"should_trade": True, "conviction": 6, "recommended_strategy": "iron_condor",
                "reasoning": f"LLM unavailable ({e}), proceeding with default", "direction": "flat"}


def get_historical_earnings_moves(ticker: str) -> list:
    """
    Get historical post-earnings price moves.
    Returns list of percentage moves (e.g., [0.05, -0.03, 0.02, ...])
    """
    try:
        import yfinance as yf
        stock = yf.Ticker(ticker)
        
        # Try to get earnings dates
        try:
            earnings = stock.earnings_dates
            if earnings is not None and not earnings.empty:
                moves = []
                hist = stock.history(period="2y")
                if hist.empty:
                    return []
                
                for date in earnings.index[:8]:  # Last 8 earnings
                    date = date.tz_localize(None) if date.tzinfo else date
                    # Find the closest trading day
                    mask = hist.index.tz_localize(None) if hist.index.tzinfo else hist.index
                    nearby = hist.iloc[abs((mask - date).days) <= 3]
                    if len(nearby) >= 2:
                        move = (nearby["Close"].iloc[-1] - nearby["Close"].iloc[0]) / nearby["Close"].iloc[0]
                        moves.append(float(move))
                
                return moves
        except Exception:
            pass
        
        return []
    except Exception as e:
        logger.error(f"Error getting historical earnings moves for {ticker}: {e}")
        return []
