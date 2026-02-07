"""
Signal Aggregator
Combines signals from SEC filings, news, and earnings into unified trade recommendations.
"""

import json
import logging
import os
import sys
from collections import defaultdict
from datetime import datetime, timezone
from typing import Dict, List, Optional

# Ensure the event-engine directory is in the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config as cfg

logger = logging.getLogger("event_engine.aggregator")


def collect_all_signals() -> Dict[str, List[Dict]]:
    """
    Collect signals from all sources.
    Returns dict of source_name -> list of signals.
    """
    all_signals = {}
    
    # 1. SEC Insider Activity
    logger.info("=" * 60)
    logger.info("PHASE 1: SEC Insider Activity Scanner")
    logger.info("=" * 60)
    try:
        from sec_scanner import scan_insider_activity
        sec_signals = scan_insider_activity(days_back=5)
        all_signals["sec"] = sec_signals
        logger.info(f"  SEC signals: {len(sec_signals)}")
    except Exception as e:
        logger.error(f"  SEC scanner error: {e}")
        all_signals["sec"] = []
    
    # 2. News Sentiment
    logger.info("=" * 60)
    logger.info("PHASE 2: News Sentiment Analysis")
    logger.info("=" * 60)
    try:
        from news_analyzer import generate_news_signals
        news_signals = generate_news_signals(limit=50)
        all_signals["news"] = news_signals
        logger.info(f"  News signals: {len(news_signals)}")
    except Exception as e:
        logger.error(f"  News analyzer error: {e}")
        all_signals["news"] = []
    
    # 3. Earnings Intelligence
    logger.info("=" * 60)
    logger.info("PHASE 3: Earnings Intelligence")
    logger.info("=" * 60)
    try:
        from earnings_intel import generate_earnings_signals
        earnings_signals = generate_earnings_signals(days_ahead=7)
        all_signals["earnings"] = earnings_signals
        logger.info(f"  Earnings signals: {len(earnings_signals)}")
    except Exception as e:
        logger.error(f"  Earnings intel error: {e}")
        all_signals["earnings"] = []
    
    return all_signals


def score_signal(signal: Dict, source: str) -> float:
    """
    Score a signal 0-100 based on source reliability, strength, and timeliness.
    """
    base_conviction = signal.get("conviction", 0)
    
    # Source reliability multiplier
    source_weights = {
        "sec": 1.2,        # SEC filings are most reliable
        "congress": 1.1,   # Congressional trades have proven alpha
        "earnings": 1.0,   # Earnings are reliable but expected
        "news": 0.85,      # News can be noisy
    }
    weight = source_weights.get(source, 0.8)
    
    # Signal type bonuses
    signal_type = signal.get("signal_type", "")
    type_bonus = 0
    if signal_type == "insider_cluster_buy":
        type_bonus = 15  # Clusters are very strong
    elif signal_type == "insider_large_buy":
        type_bonus = 10
    elif signal_type == "post_earnings_reaction":
        type_bonus = 5
    elif signal_type == "earnings_options_cheap":
        type_bonus = 5
    
    # Calculate final score
    score = (base_conviction * weight) + type_bonus
    
    return min(max(round(score), 0), 100)


def aggregate_signals(all_signals: Dict[str, List[Dict]]) -> List[Dict]:
    """
    Combine signals from all sources into unified trade recommendations.
    Signals for the same ticker from multiple sources get confirmation bonuses.
    """
    # Group all signals by ticker
    ticker_signals = defaultdict(list)
    
    for source, signals in all_signals.items():
        for signal in signals:
            ticker = signal.get("ticker", "").upper()
            if not ticker:
                continue
            
            scored_signal = {
                **signal,
                "source_type": source,
                "aggregated_score": score_signal(signal, source),
            }
            ticker_signals[ticker].append(scored_signal)
    
    # Build unified recommendations
    recommendations = []
    
    for ticker, signals in ticker_signals.items():
        # Determine consensus direction
        bullish_score = 0
        bearish_score = 0
        neutral_score = 0
        
        for s in signals:
            score = s["aggregated_score"]
            direction = s.get("direction", "neutral")
            
            if direction == "bullish":
                bullish_score += score
            elif direction == "bearish":
                bearish_score += score
            else:
                neutral_score += score
        
        # Determine direction
        if bullish_score > bearish_score and bullish_score > neutral_score:
            direction = "bullish"
            base_score = bullish_score
        elif bearish_score > bullish_score and bearish_score > neutral_score:
            direction = "bearish"
            base_score = bearish_score
        else:
            direction = "neutral"
            base_score = neutral_score
        
        # Multi-source confirmation bonus
        unique_sources = set(s["source_type"] for s in signals)
        confirmation_bonus = (len(unique_sources) - 1) * 10  # +10 per additional source
        
        # Number of signals bonus
        signal_count_bonus = min(len(signals) * 3, 15)
        
        # Final conviction score
        # Use the average of top signals + bonuses
        top_scores = sorted([s["aggregated_score"] for s in signals], reverse=True)[:3]
        avg_top = sum(top_scores) / len(top_scores) if top_scores else 0
        
        conviction = min(int(avg_top + confirmation_bonus + signal_count_bonus), 100)
        
        # Collect all sources and reasoning
        sources = []
        reasoning_parts = []
        for s in signals:
            sources.extend(s.get("sources", []))
            if s.get("reasoning"):
                reasoning_parts.append(s["reasoning"])
        
        sources = list(set(sources))
        
        recommendation = {
            "ticker": ticker,
            "direction": direction,
            "conviction": conviction,
            "num_signals": len(signals),
            "num_sources": len(unique_sources),
            "source_types": list(unique_sources),
            "sources": sources,
            "reasoning": " | ".join(reasoning_parts[:3]),
            "signals": signals,
            "bullish_score": bullish_score,
            "bearish_score": bearish_score,
            "confirmation_bonus": confirmation_bonus,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        
        recommendations.append(recommendation)
    
    # Sort by conviction
    recommendations.sort(key=lambda x: x["conviction"], reverse=True)
    
    return recommendations


def get_high_conviction_signals(min_score: int = None) -> List[Dict]:
    """
    Main entry point: collect all signals and return high-conviction recommendations.
    """
    min_score = min_score or cfg.MIN_SIGNAL_SCORE
    
    logger.info("=" * 70)
    logger.info("EVENT-DRIVEN NLP TRADING ENGINE — Signal Scan")
    logger.info(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")
    logger.info("=" * 70)
    
    # Collect from all sources
    all_signals = collect_all_signals()
    
    # Count totals
    total = sum(len(s) for s in all_signals.values())
    logger.info(f"\nTotal raw signals collected: {total}")
    
    # Aggregate
    recommendations = aggregate_signals(all_signals)
    
    # Filter by minimum score
    filtered = [r for r in recommendations if r["conviction"] >= min_score]
    
    logger.info(f"Aggregated into {len(recommendations)} ticker recommendations")
    logger.info(f"High conviction (>={min_score}): {len(filtered)}")
    
    # Save results to cache
    try:
        cache_file = os.path.join(cfg.CACHE_DIR, "latest_signals.json")
        with open(cache_file, "w") as f:
            # Remove non-serializable items
            serializable = []
            for r in recommendations:
                rec = {k: v for k, v in r.items() if k != "signals"}
                rec["signal_count"] = len(r.get("signals", []))
                serializable.append(rec)
            json.dump({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "total_raw_signals": total,
                "recommendations": serializable,
            }, f, indent=2)
        logger.info(f"Cached results to {cache_file}")
    except Exception as e:
        logger.debug(f"Cache write error: {e}")
    
    return filtered


def check_ticker_signals(ticker: str) -> Optional[Dict]:
    """
    Check all signal sources for a specific ticker.
    Useful for confirming a congressional trade.
    """
    ticker = ticker.upper()
    logger.info(f"Checking signals for {ticker}...")
    
    signals = []
    
    # Check news
    try:
        from news_analyzer import fetch_news_for_ticker, analyze_headlines_with_openai, aggregate_ticker_sentiment
        articles = fetch_news_for_ticker(ticker, limit=10)
        if articles:
            analyzed = analyze_headlines_with_openai(articles)
            sentiments = aggregate_ticker_sentiment(analyzed)
            ticker_data = sentiments.get(ticker)
            if ticker_data:
                signals.append({
                    "source": "news",
                    "direction": ticker_data["direction"],
                    "conviction": ticker_data["conviction"],
                    "detail": f"{ticker_data['article_count']} articles, sentiment: {ticker_data['net_sentiment']:.0f}",
                })
    except Exception as e:
        logger.debug(f"News check error for {ticker}: {e}")
    
    # Check implied volatility / earnings
    try:
        from earnings_intel import estimate_implied_move
        move_data = estimate_implied_move(ticker)
        if move_data:
            signals.append({
                "source": "volatility",
                "direction": "neutral",
                "conviction": 0,
                "detail": (
                    f"Price: ${move_data['current_price']:.2f}, "
                    f"Daily vol: {move_data['daily_vol']:.1f}%, "
                    f"Annual vol: {move_data['annual_vol']:.1f}%"
                ),
            })
    except Exception as e:
        logger.debug(f"Volatility check error for {ticker}: {e}")
    
    if not signals:
        return None
    
    return {
        "ticker": ticker,
        "signals": signals,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }


def print_report(recommendations: List[Dict]):
    """Pretty-print the signal report."""
    print(f"\n{'='*70}")
    print(f"  EVENT ENGINE — Signal Report")
    print(f"  {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f"{'='*70}")
    
    if not recommendations:
        print("  No actionable signals found.")
        print(f"{'='*70}")
        return
    
    # High conviction
    high = [r for r in recommendations if r["conviction"] >= cfg.HIGH_CONVICTION_SCORE]
    medium = [r for r in recommendations if cfg.MIN_SIGNAL_SCORE <= r["conviction"] < cfg.HIGH_CONVICTION_SCORE]
    
    if high:
        print(f"\n🔥 HIGH CONVICTION SIGNALS ({len(high)}):")
        print("-" * 70)
        for r in high:
            emoji = "📈" if r["direction"] == "bullish" else "📉" if r["direction"] == "bearish" else "➡️"
            print(f"  {emoji} {r['ticker']:6s} | {r['direction']:7s} | "
                  f"Score: {r['conviction']:3d}/100 | "
                  f"Sources: {r['num_sources']} ({', '.join(r['source_types'])})")
            print(f"    {r['reasoning'][:120]}")
            print()
    
    if medium:
        print(f"\n📊 MEDIUM CONVICTION SIGNALS ({len(medium)}):")
        print("-" * 70)
        for r in medium:
            emoji = "📈" if r["direction"] == "bullish" else "📉" if r["direction"] == "bearish" else "➡️"
            print(f"  {emoji} {r['ticker']:6s} | {r['direction']:7s} | "
                  f"Score: {r['conviction']:3d}/100 | "
                  f"Sources: {r['num_sources']} ({', '.join(r['source_types'])})")
            print(f"    {r['reasoning'][:120]}")
    
    print(f"\n{'='*70}")
    print(f"  Total recommendations: {len(recommendations)}")
    print(f"  High conviction: {len(high)}")
    print(f"  Medium conviction: {len(medium)}")
    print(f"{'='*70}")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    )
    
    print("Event-Driven NLP Trading Engine")
    print("Scanning all signal sources...\n")
    
    recommendations = get_high_conviction_signals(min_score=20)
    print_report(recommendations)
