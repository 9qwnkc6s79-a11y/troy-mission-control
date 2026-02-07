"""
Sentiment Analysis Module — V2
Real sentiment analysis using:
  1. Crypto Fear & Greed Index (free API)
  2. Alpaca News API + OpenAI headline analysis
  3. CoinGecko trending coins
  4. BTC mempool congestion (on-chain)

Returns structured sentiment data with per-symbol scores.
"""

import json
import logging
import os
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

import requests

from config import (
    ALPACA_API_KEY, ALPACA_API_SECRET,
    OPENAI_API_KEY, OPENAI_MODEL,
    SENTIMENT_UPDATE_INTERVAL,
    FEAR_GREED_EXTREME_FEAR, FEAR_GREED_EXTREME_GREED,
    SENTIMENT_LOG_FILE,
)

logger = logging.getLogger("sentiment")

# ═══════════════════════════════════════════════════════════════
# SENTIMENT CACHE
# ═══════════════════════════════════════════════════════════════
_cache = {
    "last_fetch": 0,
    "data": None,
}


# ═══════════════════════════════════════════════════════════════
# 1. FEAR & GREED INDEX
# ═══════════════════════════════════════════════════════════════

def fetch_fear_greed() -> dict:
    """
    Fetch Crypto Fear & Greed Index.
    Returns: {"value": int 0-100, "classification": str, "score": float -1 to +1}
    """
    try:
        resp = requests.get("https://api.alternative.me/fng/?limit=1", timeout=10)
        resp.raise_for_status()
        data = resp.json()

        if "data" not in data or not data["data"]:
            return {"value": 50, "classification": "unavailable", "score": 0.0}

        value = int(data["data"][0]["value"])
        classification = data["data"][0].get("value_classification", "unknown")

        # Convert to sentiment score
        # Extreme Fear = contrarian bullish, Extreme Greed = contrarian bearish
        if value <= FEAR_GREED_EXTREME_FEAR:
            score = 0.3 + (FEAR_GREED_EXTREME_FEAR - value) / FEAR_GREED_EXTREME_FEAR * 0.4
        elif value <= 40:
            score = 0.1 + (40 - value) / 15 * 0.2
        elif value <= 60:
            score = 0.0
        elif value <= FEAR_GREED_EXTREME_GREED:
            score = -0.1 - (value - 60) / 15 * 0.2
        else:
            score = -0.3 - (value - FEAR_GREED_EXTREME_GREED) / 25 * 0.4

        return {"value": value, "classification": classification, "score": round(score, 3)}

    except Exception as e:
        logger.warning(f"Fear & Greed fetch failed: {e}")
        return {"value": 50, "classification": "error", "score": 0.0}


# ═══════════════════════════════════════════════════════════════
# 2. ALPACA NEWS + OPENAI HEADLINE ANALYSIS
# ═══════════════════════════════════════════════════════════════

def fetch_alpaca_news() -> List[dict]:
    """Fetch recent crypto news from Alpaca."""
    try:
        headers = {
            "APCA-API-KEY-ID": ALPACA_API_KEY,
            "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
        }
        resp = requests.get(
            "https://data.alpaca.markets/v1beta1/news",
            params={"symbols": "BTC,ETH,SOL", "limit": 20, "sort": "desc"},
            headers=headers,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        news = data.get("news", [])
        return [
            {
                "headline": n.get("headline", ""),
                "summary": n.get("summary", "")[:200],
                "symbols": n.get("symbols", []),
                "created_at": n.get("created_at", ""),
                "source": n.get("source", ""),
            }
            for n in news if n.get("headline")
        ]
    except Exception as e:
        logger.warning(f"Alpaca news fetch failed: {e}")
        return []


def analyze_headlines_with_llm(headlines: List[dict]) -> dict:
    """
    Use OpenAI to analyze news headlines for sentiment.
    Returns: {"global_score": float, "per_symbol": {sym: float}, "analysis": str}
    """
    if not headlines or not OPENAI_API_KEY:
        return {"global_score": 0.0, "per_symbol": {}, "analysis": "No headlines or API key"}

    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)

        # Format headlines for analysis
        headline_text = "\n".join(
            f"- [{h.get('source', '?')}] {h['headline']} (symbols: {', '.join(h.get('symbols', []))})"
            for h in headlines[:15]
        )

        prompt = f"""Analyze these crypto news headlines for trading sentiment.

Headlines:
{headline_text}

For each of BTC, ETH, SOL, provide a sentiment score from -1.0 (very bearish) to +1.0 (very bullish).
Also provide an overall crypto market sentiment score.

Consider:
- Regulatory news (positive regulation = bullish, bans/lawsuits = bearish)
- Adoption/partnership news = bullish
- Hacks/exploits/scams = bearish
- ETF/institutional news = bullish
- Macro factors mentioned
- Price action commentary (be careful not to just follow momentum)

Respond ONLY with valid JSON in this exact format:
{{"overall": 0.0, "BTC": 0.0, "ETH": 0.0, "SOL": 0.0, "reasoning": "brief explanation"}}
"""

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a crypto market sentiment analyst. Respond only with JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=300,
        )

        result_text = response.choices[0].message.content.strip()
        # Clean markdown code blocks if present
        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1] if "\n" in result_text else result_text
            result_text = result_text.rsplit("```", 1)[0].strip()

        result = json.loads(result_text)

        per_symbol = {}
        for sym_key, our_sym in [("BTC", "BTC/USD"), ("ETH", "ETH/USD"), ("SOL", "SOL/USD")]:
            val = result.get(sym_key, 0)
            per_symbol[our_sym] = max(-1.0, min(1.0, float(val)))

        return {
            "global_score": max(-1.0, min(1.0, float(result.get("overall", 0)))),
            "per_symbol": per_symbol,
            "analysis": result.get("reasoning", ""),
        }

    except json.JSONDecodeError as e:
        logger.warning(f"Failed to parse LLM sentiment response: {e}")
        return {"global_score": 0.0, "per_symbol": {}, "analysis": f"JSON parse error: {e}"}
    except Exception as e:
        logger.warning(f"LLM headline analysis failed: {e}")
        return {"global_score": 0.0, "per_symbol": {}, "analysis": f"Error: {e}"}


# ═══════════════════════════════════════════════════════════════
# 3. COINGECKO TRENDING
# ═══════════════════════════════════════════════════════════════

SYMBOL_MAP = {
    "bitcoin": "BTC/USD",
    "ethereum": "ETH/USD",
    "solana": "SOL/USD",
    "btc": "BTC/USD",
    "eth": "ETH/USD",
    "sol": "SOL/USD",
}


def fetch_trending_coins() -> dict:
    """
    Fetch trending coins from CoinGecko.
    Returns: {"trending_symbols": [str], "per_symbol_boost": {sym: float}}
    """
    try:
        resp = requests.get("https://api.coingecko.com/api/v3/search/trending", timeout=10)
        resp.raise_for_status()
        data = resp.json()

        trending_symbols = []
        per_symbol_boost = {}

        for i, coin_wrapper in enumerate(data.get("coins", [])[:10]):
            coin = coin_wrapper.get("item", {})
            coin_id = coin.get("id", "").lower()
            coin_symbol = coin.get("symbol", "").lower()
            coin_name = coin.get("name", "unknown")

            matched = SYMBOL_MAP.get(coin_id) or SYMBOL_MAP.get(coin_symbol)
            if matched:
                boost = 0.15 - (i * 0.01)
                per_symbol_boost[matched] = max(boost, 0.05)
                trending_symbols.append(f"{coin_name} (#{i+1})")

        return {
            "trending_symbols": trending_symbols,
            "per_symbol_boost": per_symbol_boost,
        }

    except Exception as e:
        logger.warning(f"CoinGecko trending fetch failed: {e}")
        return {"trending_symbols": [], "per_symbol_boost": {}}


# ═══════════════════════════════════════════════════════════════
# 4. BTC MEMPOOL (ON-CHAIN SIGNAL)
# ═══════════════════════════════════════════════════════════════

def fetch_mempool_info() -> dict:
    """
    Fetch BTC mempool congestion from blockchain.info.
    High pending tx count = high network activity = potential volatility signal.
    """
    try:
        resp = requests.get("https://api.blockchain.info/mempool/info", timeout=10)
        resp.raise_for_status()
        data = resp.json()

        pending_count = data.get("count", 0)
        size_bytes = data.get("size", 0)

        # Classify activity level
        if pending_count > 100000:
            activity = "very_high"
            note = "Very high mempool congestion — expect volatility"
        elif pending_count > 50000:
            activity = "high"
            note = "High mempool activity"
        elif pending_count > 10000:
            activity = "normal"
            note = "Normal mempool"
        else:
            activity = "low"
            note = "Low mempool activity"

        return {
            "pending_count": pending_count,
            "size_mb": round(size_bytes / 1_000_000, 2),
            "activity": activity,
            "note": note,
        }

    except Exception as e:
        logger.warning(f"Mempool fetch failed: {e}")
        return {"pending_count": 0, "size_mb": 0, "activity": "unknown", "note": f"Error: {e}"}


# ═══════════════════════════════════════════════════════════════
# AGGREGATE SENTIMENT
# ═══════════════════════════════════════════════════════════════

def get_sentiment(force_refresh: bool = False) -> dict:
    """
    Get comprehensive sentiment analysis from all sources.
    Cached for SENTIMENT_UPDATE_INTERVAL seconds.

    Returns: {
        "global_score": float (-1 to +1),
        "per_symbol": {symbol: float},
        "fear_greed": dict,
        "news_analysis": str,
        "trending": list,
        "mempool": dict,
        "headlines": list,
        "timestamp": str,
        "cached": bool,
    }
    """
    now = time.time()

    if not force_refresh and _cache["data"] and (now - _cache["last_fetch"]) < SENTIMENT_UPDATE_INTERVAL:
        result = _cache["data"].copy()
        result["age_seconds"] = int(now - _cache["last_fetch"])
        result["cached"] = True
        return result

    logger.info("📊 Fetching fresh sentiment data from all sources...")

    # 1. Fear & Greed
    fg = fetch_fear_greed()
    logger.info(f"  Fear & Greed: {fg['value']} ({fg['classification']}) → score={fg['score']:+.3f}")

    # 2. News headlines + LLM analysis
    headlines = fetch_alpaca_news()
    news_result = analyze_headlines_with_llm(headlines)
    logger.info(f"  News LLM: global={news_result['global_score']:+.3f} | {news_result.get('analysis', '')[:100]}")

    # 3. Trending coins
    trending = fetch_trending_coins()
    logger.info(f"  Trending: {', '.join(trending['trending_symbols']) or 'None of our coins trending'}")

    # 4. Mempool
    mempool = fetch_mempool_info()
    logger.info(f"  Mempool: {mempool['pending_count']} pending ({mempool['activity']})")

    # Aggregate global score
    # Weight: Fear/Greed=30%, News LLM=50%, Trending=10%, Mempool=10%
    global_score = (
        fg["score"] * 0.3 +
        news_result["global_score"] * 0.5 +
        (0.1 if trending["trending_symbols"] else 0.0) * 0.1 +
        0.0  # mempool doesn't directly affect direction
    )
    global_score = max(-1.0, min(1.0, round(global_score, 3)))

    # Aggregate per-symbol scores
    per_symbol = {}
    for sym in ["BTC/USD", "ETH/USD", "SOL/USD"]:
        sym_score = global_score
        sym_score += news_result.get("per_symbol", {}).get(sym, 0) * 0.4
        sym_score += trending.get("per_symbol_boost", {}).get(sym, 0) * 0.2
        per_symbol[sym] = max(-1.0, min(1.0, round(sym_score, 3)))

    result = {
        "global_score": global_score,
        "per_symbol": per_symbol,
        "fear_greed": fg,
        "news_analysis": news_result.get("analysis", ""),
        "news_global_score": news_result.get("global_score", 0),
        "news_per_symbol": news_result.get("per_symbol", {}),
        "trending": trending["trending_symbols"],
        "trending_boosts": trending.get("per_symbol_boost", {}),
        "mempool": mempool,
        "headlines": [h["headline"] for h in headlines[:10]],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "age_seconds": 0,
        "cached": False,
    }

    _cache["data"] = result
    _cache["last_fetch"] = now

    # Log to file
    _log_sentiment(result)

    return result


def get_symbol_sentiment(symbol: str, sentiment_data: dict = None) -> float:
    """Get sentiment score for a specific symbol."""
    if sentiment_data is None:
        sentiment_data = get_sentiment()
    return sentiment_data.get("per_symbol", {}).get(symbol, sentiment_data.get("global_score", 0.0))


def get_sentiment_summary(sentiment_data: dict) -> str:
    """Get a human-readable summary of sentiment."""
    fg = sentiment_data.get("fear_greed", {})
    lines = [
        f"  F&G Index: {fg.get('value', '?')} ({fg.get('classification', '?')})",
        f"  Global Score: {sentiment_data.get('global_score', 0):+.3f}",
        f"  News: {sentiment_data.get('news_analysis', 'N/A')[:80]}",
        f"  Trending: {', '.join(sentiment_data.get('trending', [])) or 'None'}",
        f"  Mempool: {sentiment_data.get('mempool', {}).get('note', 'N/A')}",
    ]
    for sym in ["BTC/USD", "ETH/USD", "SOL/USD"]:
        score = sentiment_data.get("per_symbol", {}).get(sym, 0)
        direction = "🟢 BULLISH" if score > 0.15 else "🔴 BEARISH" if score < -0.15 else "⚪ NEUTRAL"
        lines.append(f"  {sym}: {score:+.3f} {direction}")
    return "\n".join(lines)


def _log_sentiment(data: dict):
    """Log sentiment to file."""
    os.makedirs(os.path.dirname(SENTIMENT_LOG_FILE), exist_ok=True)
    try:
        with open(SENTIMENT_LOG_FILE, "a") as f:
            f.write(f"\n{'='*60}\n")
            f.write(f"Sentiment Update: {data['timestamp']}\n")
            f.write(get_sentiment_summary(data))
            f.write(f"\n{'─'*60}\n")
    except Exception as e:
        logger.warning(f"Failed to write sentiment log: {e}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    result = get_sentiment(force_refresh=True)
    print(json.dumps(result, indent=2, default=str))
