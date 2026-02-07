"""
News Analyzer
Fetches news from Alpaca API and uses OpenAI to classify sentiment.
"""

import json
import logging
import os
import time
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional

import requests

import config as cfg

logger = logging.getLogger("event_engine.news")

# Try to import openai
try:
    from openai import OpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False
    logger.warning("openai package not installed — NLP analysis disabled")


def fetch_alpaca_news(limit: int = 50, symbols: Optional[List[str]] = None,
                       start: Optional[str] = None, end: Optional[str] = None) -> List[Dict]:
    """
    Fetch news articles from Alpaca News API.
    """
    headers = {
        "APCA-API-KEY-ID": cfg.ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": cfg.ALPACA_API_SECRET,
    }
    
    params = {"limit": min(limit, 50)}
    
    if symbols:
        params["symbols"] = ",".join(symbols)
    if start:
        params["start"] = start
    if end:
        params["end"] = end
    
    try:
        resp = requests.get(cfg.ALPACA_NEWS_URL, headers=headers, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        articles = data.get("news", [])
        logger.info(f"Fetched {len(articles)} news articles from Alpaca")
        return articles
        
    except Exception as e:
        logger.error(f"Error fetching Alpaca news: {e}")
        return []


def fetch_news_for_ticker(ticker: str, limit: int = 10) -> List[Dict]:
    """Fetch recent news for a specific ticker."""
    return fetch_alpaca_news(limit=limit, symbols=[ticker])


def analyze_headlines_with_openai(articles: List[Dict]) -> List[Dict]:
    """
    Use OpenAI gpt-4o-mini to classify news headlines for sentiment.
    Batches headlines for cost efficiency.
    """
    if not HAS_OPENAI:
        logger.warning("OpenAI not available, using rule-based analysis")
        return [_rule_based_analysis(a) for a in articles]
    
    api_key = cfg.OPENAI_API_KEY
    if not api_key:
        logger.warning("No OpenAI API key, using rule-based analysis")
        return [_rule_based_analysis(a) for a in articles]
    
    client = OpenAI(api_key=api_key)
    
    # Batch headlines (max ~20 per batch to keep context manageable)
    batch_size = 20
    all_results = []
    
    for i in range(0, len(articles), batch_size):
        batch = articles[i:i + batch_size]
        batch_results = _analyze_batch(client, batch)
        all_results.extend(batch_results)
    
    return all_results


def _analyze_batch(client, articles: List[Dict]) -> List[Dict]:
    """Analyze a batch of articles with OpenAI."""
    # Build the prompt
    headlines = []
    for idx, article in enumerate(articles):
        headline = article.get("headline", "")
        summary = article.get("summary", "")[:200] if article.get("summary") else ""
        symbols = ", ".join(article.get("symbols", []))
        headlines.append(f"{idx+1}. [{symbols}] {headline}")
        if summary:
            headlines.append(f"   Summary: {summary}")
    
    headlines_text = "\n".join(headlines)
    
    prompt = f"""Analyze these financial news headlines. For each, provide:
1. sentiment: bullish, bearish, or neutral
2. tickers: list of affected stock tickers (use the ones in brackets if available)
3. impact: high, medium, or low
4. event_type: one of [earnings, FDA, merger, lawsuit, insider, macro, analyst, product, restructuring, other]
5. reasoning: one brief sentence

Return ONLY valid JSON array. Example:
[{{"id": 1, "sentiment": "bullish", "tickers": ["AAPL"], "impact": "high", "event_type": "earnings", "reasoning": "Beat estimates"}}]

Headlines:
{headlines_text}

Return JSON array:"""

    try:
        response = client.chat.completions.create(
            model=cfg.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a financial news analyst. Respond only with valid JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=2000,
        )
        
        content = response.choices[0].message.content.strip()
        
        # Clean up response — sometimes wrapped in markdown code blocks
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
        
        analyses = json.loads(content)
        
        # Merge analysis back into articles
        results = []
        analysis_by_id = {a["id"]: a for a in analyses if isinstance(a, dict)}
        
        for idx, article in enumerate(articles):
            analysis = analysis_by_id.get(idx + 1, {})
            results.append({
                **article,
                "nlp_sentiment": analysis.get("sentiment", "neutral"),
                "nlp_impact": analysis.get("impact", "low"),
                "nlp_event_type": analysis.get("event_type", "other"),
                "nlp_tickers": analysis.get("tickers", article.get("symbols", [])),
                "nlp_reasoning": analysis.get("reasoning", ""),
                "analyzed": True,
            })
        
        return results
        
    except json.JSONDecodeError as e:
        logger.warning(f"Failed to parse OpenAI response: {e}")
        return [_rule_based_analysis(a) for a in articles]
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        return [_rule_based_analysis(a) for a in articles]


def _rule_based_analysis(article: Dict) -> Dict:
    """
    Simple rule-based sentiment analysis as fallback.
    """
    headline = (article.get("headline", "") + " " + article.get("summary", "")).lower()
    
    bullish_words = [
        "beat", "surge", "soar", "upgrade", "buy", "outperform", "strong",
        "record", "growth", "profit", "bullish", "rally", "breakthrough",
        "approve", "FDA approval", "acquisition", "merger", "dividend",
        "raises guidance", "beats expectations", "exceeded", "positive",
    ]
    bearish_words = [
        "miss", "plunge", "crash", "downgrade", "sell", "underperform",
        "weak", "loss", "decline", "bearish", "warning", "lawsuit",
        "investigation", "recall", "bankruptcy", "cuts guidance", "layoff",
        "missed expectations", "negative", "concern", "risk",
    ]
    
    bull_count = sum(1 for w in bullish_words if w in headline)
    bear_count = sum(1 for w in bearish_words if w in headline)
    
    if bull_count > bear_count:
        sentiment = "bullish"
    elif bear_count > bull_count:
        sentiment = "bearish"
    else:
        sentiment = "neutral"
    
    # Determine event type
    event_type = "other"
    if any(w in headline for w in ["earnings", "revenue", "eps", "quarter"]):
        event_type = "earnings"
    elif any(w in headline for w in ["fda", "approval", "drug", "trial"]):
        event_type = "FDA"
    elif any(w in headline for w in ["merger", "acquisition", "acquire", "deal"]):
        event_type = "merger"
    elif any(w in headline for w in ["lawsuit", "sue", "investigation", "probe"]):
        event_type = "lawsuit"
    elif any(w in headline for w in ["insider", "executive", "ceo", "cfo"]):
        event_type = "insider"
    elif any(w in headline for w in ["fed", "interest rate", "inflation", "economy", "gdp"]):
        event_type = "macro"
    elif any(w in headline for w in ["analyst", "upgrade", "downgrade", "price target"]):
        event_type = "analyst"
    
    return {
        **article,
        "nlp_sentiment": sentiment,
        "nlp_impact": "medium" if bull_count + bear_count > 2 else "low",
        "nlp_event_type": event_type,
        "nlp_tickers": article.get("symbols", []),
        "nlp_reasoning": f"Rule-based: {bull_count} bullish, {bear_count} bearish keywords",
        "analyzed": True,
    }


def aggregate_ticker_sentiment(analyzed_articles: List[Dict]) -> Dict[str, Dict]:
    """
    Aggregate sentiment scores per ticker across all analyzed articles.
    Returns dict of ticker -> sentiment summary.
    """
    ticker_data = defaultdict(lambda: {
        "bullish_count": 0,
        "bearish_count": 0,
        "neutral_count": 0,
        "high_impact_count": 0,
        "articles": [],
        "event_types": [],
    })
    
    for article in analyzed_articles:
        tickers = article.get("nlp_tickers", [])
        sentiment = article.get("nlp_sentiment", "neutral")
        impact = article.get("nlp_impact", "low")
        event_type = article.get("nlp_event_type", "other")
        
        for ticker in tickers:
            ticker = ticker.upper()
            data = ticker_data[ticker]
            
            if sentiment == "bullish":
                data["bullish_count"] += 1
            elif sentiment == "bearish":
                data["bearish_count"] += 1
            else:
                data["neutral_count"] += 1
            
            if impact == "high":
                data["high_impact_count"] += 1
            
            data["articles"].append({
                "headline": article.get("headline", ""),
                "sentiment": sentiment,
                "impact": impact,
                "event_type": event_type,
                "reasoning": article.get("nlp_reasoning", ""),
                "created_at": article.get("created_at", ""),
            })
            data["event_types"].append(event_type)
    
    # Calculate aggregate scores
    results = {}
    for ticker, data in ticker_data.items():
        total = data["bullish_count"] + data["bearish_count"] + data["neutral_count"]
        if total == 0:
            continue
        
        # Net sentiment: -100 (all bearish) to +100 (all bullish)
        net_sentiment = ((data["bullish_count"] - data["bearish_count"]) / total) * 100
        
        # Determine direction
        if net_sentiment > 20:
            direction = "bullish"
        elif net_sentiment < -20:
            direction = "bearish"
        else:
            direction = "neutral"
        
        # Conviction based on volume and impact
        base_conviction = abs(net_sentiment) * 0.5
        impact_bonus = data["high_impact_count"] * 10
        volume_bonus = min(total * 5, 20)
        conviction = min(int(base_conviction + impact_bonus + volume_bonus), 100)
        
        results[ticker] = {
            "ticker": ticker,
            "direction": direction,
            "net_sentiment": round(net_sentiment, 1),
            "conviction": conviction,
            "article_count": total,
            "bullish_count": data["bullish_count"],
            "bearish_count": data["bearish_count"],
            "high_impact_count": data["high_impact_count"],
            "event_types": list(set(data["event_types"])),
            "articles": data["articles"][:5],  # Top 5 articles
        }
    
    return results


def generate_news_signals(limit: int = 50) -> List[Dict]:
    """
    Main entry point: fetch news, analyze, and return trading signals.
    """
    logger.info("Fetching and analyzing news...")
    
    # Fetch recent news
    articles = fetch_alpaca_news(limit=limit)
    if not articles:
        logger.info("No news articles found")
        return []
    
    # Analyze with OpenAI
    analyzed = analyze_headlines_with_openai(articles)
    logger.info(f"Analyzed {len(analyzed)} articles")
    
    # Aggregate per ticker
    ticker_sentiments = aggregate_ticker_sentiment(analyzed)
    
    # Convert to signals
    signals = []
    for ticker, data in ticker_sentiments.items():
        if data["direction"] == "neutral":
            continue
        if data["conviction"] < 20:
            continue
        
        signals.append({
            "ticker": ticker,
            "signal_type": "news_sentiment",
            "direction": data["direction"],
            "conviction": data["conviction"],
            "net_sentiment": data["net_sentiment"],
            "article_count": data["article_count"],
            "event_types": data["event_types"],
            "sources": [f"Alpaca News ({data['article_count']} articles)"],
            "reasoning": (
                f"News sentiment for {ticker}: {data['direction']} "
                f"(score: {data['net_sentiment']:.0f}, "
                f"{data['article_count']} articles, "
                f"{data['high_impact_count']} high-impact). "
                f"Events: {', '.join(data['event_types'][:3])}"
            ),
            "articles": data["articles"][:3],
        })
    
    signals.sort(key=lambda x: x["conviction"], reverse=True)
    logger.info(f"Generated {len(signals)} news signals")
    
    return signals


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(name)s | %(message)s")
    signals = generate_news_signals(limit=50)
    print(f"\n{'='*60}")
    print(f"News Signals: {len(signals)}")
    print(f"{'='*60}")
    for s in signals[:15]:
        print(f"  {s['ticker']:6s} | {s['direction']:7s} | "
              f"Conviction: {s['conviction']:3d} | "
              f"Sentiment: {s['net_sentiment']:+.0f} | "
              f"Articles: {s['article_count']}")
        print(f"    {s['reasoning']}")
