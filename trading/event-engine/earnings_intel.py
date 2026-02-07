"""
Earnings Intelligence
Tracks upcoming earnings, analyzes post-earnings sentiment,
and identifies options mispricing opportunities.
"""

import json
import logging
import math
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional

import requests

import config as cfg

logger = logging.getLogger("event_engine.earnings")

ALPACA_HEADERS = {
    "APCA-API-KEY-ID": cfg.ALPACA_API_KEY,
    "APCA-API-SECRET-KEY": cfg.ALPACA_API_SECRET,
}


def fetch_upcoming_earnings(days_ahead: int = 7) -> List[Dict]:
    """
    Fetch upcoming earnings from Alpaca calendar API.
    Falls back to scraping Nasdaq earnings calendar.
    """
    start = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    end = (datetime.now(timezone.utc) + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
    
    # Try Alpaca corporate actions / calendar
    earnings = _fetch_from_alpaca_calendar(start, end)
    
    if not earnings:
        # Fallback: try Nasdaq earnings calendar
        earnings = _fetch_from_nasdaq_calendar(days_ahead)
    
    logger.info(f"Found {len(earnings)} upcoming earnings in next {days_ahead} days")
    return earnings


def _fetch_from_alpaca_calendar(start: str, end: str) -> List[Dict]:
    """Fetch earnings from Alpaca."""
    try:
        # Alpaca doesn't have a dedicated earnings calendar,
        # but we can use corporate actions endpoint
        url = f"{cfg.ALPACA_BASE_URL}/v2/corporate_actions/announcements"
        params = {
            "ca_types": "Dividend,Merger,Spinoff,Split",  # No direct earnings type
            "since": start,
            "until": end,
        }
        
        resp = requests.get(url, headers=ALPACA_HEADERS, params=params, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            return [{
                "ticker": item.get("symbol", ""),
                "event": item.get("ca_type", ""),
                "date": item.get("ex_date", ""),
                "description": item.get("description", ""),
            } for item in data if item.get("symbol")]
    except Exception as e:
        logger.debug(f"Alpaca calendar error: {e}")
    
    return []


def _fetch_from_nasdaq_calendar(days_ahead: int = 7) -> List[Dict]:
    """
    Fetch earnings calendar from Nasdaq.
    """
    earnings = []
    
    try:
        today = datetime.now(timezone.utc)
        date_str = today.strftime("%Y-%m-%d")
        
        url = f"https://api.nasdaq.com/api/calendar/earnings?date={date_str}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            "Accept": "application/json",
        }
        
        resp = requests.get(url, headers=headers, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            rows = data.get("data", {}).get("rows", [])
            
            for row in rows:
                earnings.append({
                    "ticker": row.get("symbol", ""),
                    "company_name": row.get("name", ""),
                    "date": date_str,
                    "time": row.get("time", ""),  # "time-pre-market" or "time-after-hours"
                    "eps_estimate": row.get("epsForecast", ""),
                    "market_cap": row.get("marketCap", ""),
                })
                
    except Exception as e:
        logger.debug(f"Nasdaq calendar error: {e}")
    
    return earnings


def analyze_post_earnings_news(ticker: str) -> Optional[Dict]:
    """
    After earnings release, check news for the ticker to gauge reaction.
    Uses the news_analyzer module.
    """
    try:
        from news_analyzer import fetch_news_for_ticker, analyze_headlines_with_openai, aggregate_ticker_sentiment
        
        articles = fetch_news_for_ticker(ticker, limit=10)
        if not articles:
            return None
        
        analyzed = analyze_headlines_with_openai(articles)
        sentiments = aggregate_ticker_sentiment(analyzed)
        
        return sentiments.get(ticker.upper())
        
    except Exception as e:
        logger.error(f"Error analyzing post-earnings news for {ticker}: {e}")
        return None


def estimate_implied_move(ticker: str) -> Optional[Dict]:
    """
    Estimate the implied move from options pricing.
    Uses the at-the-money straddle price around earnings date.
    
    For now, we use a simplified approach based on historical volatility
    from Alpaca bars data.
    """
    try:
        # Get recent bars to calculate historical volatility
        url = f"{cfg.ALPACA_DATA_URL}/v2/stocks/{ticker}/bars"
        params = {
            "timeframe": "1Day",
            "limit": 60,  # ~3 months of trading days
        }
        
        resp = requests.get(url, headers=ALPACA_HEADERS, params=params, timeout=15)
        if resp.status_code != 200:
            return None
        
        data = resp.json()
        bars = data.get("bars", [])
        
        if len(bars) < 20:
            return None
        
        # Calculate daily returns
        closes = [bar["c"] for bar in bars]
        returns = []
        for i in range(1, len(closes)):
            if closes[i-1] > 0:
                returns.append(math.log(closes[i] / closes[i-1]))
        
        if not returns:
            return None
        
        # Historical daily volatility
        mean_return = sum(returns) / len(returns)
        variance = sum((r - mean_return) ** 2 for r in returns) / (len(returns) - 1)
        daily_vol = math.sqrt(variance)
        
        # Annualized volatility
        annual_vol = daily_vol * math.sqrt(252)
        
        # Implied 1-day move (simplified)
        # In reality, we'd use options chain, but this is a proxy
        implied_move_pct = daily_vol * 1.5  # Options typically price ~1.5x historical
        
        # Historical earnings moves (last 4 quarters if available)
        # We'll use the bars around known earnings dates
        earnings_moves = _calculate_historical_earnings_moves(bars)
        
        current_price = closes[-1]
        implied_move_dollars = current_price * implied_move_pct
        
        return {
            "ticker": ticker,
            "current_price": current_price,
            "daily_vol": round(daily_vol * 100, 2),
            "annual_vol": round(annual_vol * 100, 2),
            "implied_move_pct": round(implied_move_pct * 100, 2),
            "implied_move_dollars": round(implied_move_dollars, 2),
            "historical_earnings_moves": earnings_moves,
            "avg_historical_move": (
                round(sum(earnings_moves) / len(earnings_moves), 2)
                if earnings_moves else None
            ),
        }
        
    except Exception as e:
        logger.error(f"Error estimating implied move for {ticker}: {e}")
        return None


def _calculate_historical_earnings_moves(bars: List[Dict]) -> List[float]:
    """
    Identify large single-day moves that likely correspond to earnings.
    Returns list of absolute percent moves.
    """
    if len(bars) < 2:
        return []
    
    moves = []
    for i in range(1, len(bars)):
        prev_close = bars[i-1]["c"]
        if prev_close <= 0:
            continue
        open_price = bars[i]["o"]
        pct_gap = abs((open_price - prev_close) / prev_close) * 100
        
        # Large gaps (>3%) are likely earnings-related
        if pct_gap > 3.0:
            moves.append(round(pct_gap, 2))
    
    return moves[-4:] if moves else []  # Last 4 large moves


def generate_earnings_signals(days_ahead: int = 7) -> List[Dict]:
    """
    Main entry point: generate trading signals from earnings intelligence.
    """
    logger.info(f"Scanning for earnings signals (next {days_ahead} days)...")
    
    signals = []
    
    # Fetch upcoming earnings
    upcoming = fetch_upcoming_earnings(days_ahead=days_ahead)
    
    for earning in upcoming[:20]:  # Limit to top 20 to avoid rate limits
        ticker = earning.get("ticker", "")
        if not ticker:
            continue
        
        # Get implied move estimate
        move_data = estimate_implied_move(ticker)
        
        if move_data:
            avg_hist = move_data.get("avg_historical_move")
            implied = move_data.get("implied_move_pct", 0)
            
            # Signal: options mispricing
            if avg_hist and implied > 0:
                if avg_hist > implied * 1.3:
                    # Historical moves bigger than implied = options cheap
                    conviction = min(int((avg_hist / implied - 1) * 50 + 30), 80)
                    signals.append({
                        "ticker": ticker,
                        "signal_type": "earnings_options_cheap",
                        "direction": "neutral",  # Pre-earnings, direction unknown
                        "conviction": conviction,
                        "implied_move_pct": implied,
                        "avg_historical_move_pct": avg_hist,
                        "earnings_date": earning.get("date", ""),
                        "sources": ["Earnings Calendar", "Historical Volatility"],
                        "reasoning": (
                            f"{ticker} reports earnings on {earning.get('date', 'soon')}. "
                            f"Historical avg move: {avg_hist:.1f}% vs implied: {implied:.1f}%. "
                            f"Options may be underpricing the move."
                        ),
                    })
                elif implied > avg_hist * 1.5:
                    # Implied much larger than historical = options expensive
                    signals.append({
                        "ticker": ticker,
                        "signal_type": "earnings_options_expensive",
                        "direction": "neutral",
                        "conviction": min(int((implied / avg_hist - 1) * 40 + 20), 70),
                        "implied_move_pct": implied,
                        "avg_historical_move_pct": avg_hist,
                        "earnings_date": earning.get("date", ""),
                        "sources": ["Earnings Calendar", "Historical Volatility"],
                        "reasoning": (
                            f"{ticker} reports earnings on {earning.get('date', 'soon')}. "
                            f"Implied move: {implied:.1f}% vs historical avg: {avg_hist:.1f}%. "
                            f"Options may be overpricing the move."
                        ),
                    })
    
    # Check for recent post-earnings reactions
    # (articles about companies that just reported)
    try:
        from news_analyzer import fetch_alpaca_news, analyze_headlines_with_openai
        
        # Fetch recent news and look for earnings-related
        news = fetch_alpaca_news(limit=30)
        if news:
            analyzed = analyze_headlines_with_openai(news)
            
            for article in analyzed:
                if article.get("nlp_event_type") == "earnings":
                    tickers = article.get("nlp_tickers", [])
                    sentiment = article.get("nlp_sentiment", "neutral")
                    impact = article.get("nlp_impact", "low")
                    
                    if sentiment != "neutral" and impact in ("high", "medium"):
                        for ticker in tickers:
                            conviction = 50 if impact == "high" else 35
                            signals.append({
                                "ticker": ticker,
                                "signal_type": "post_earnings_reaction",
                                "direction": sentiment,
                                "conviction": conviction,
                                "sources": ["Alpaca News (earnings)"],
                                "reasoning": (
                                    f"Post-earnings reaction for {ticker}: {sentiment}. "
                                    f"{article.get('headline', '')}"
                                ),
                            })
    except Exception as e:
        logger.debug(f"Error checking post-earnings news: {e}")
    
    signals.sort(key=lambda x: x["conviction"], reverse=True)
    logger.info(f"Generated {len(signals)} earnings signals")
    
    return signals


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(name)s | %(message)s")
    signals = generate_earnings_signals(days_ahead=7)
    print(f"\n{'='*60}")
    print(f"Earnings Signals: {len(signals)}")
    print(f"{'='*60}")
    for s in signals[:10]:
        print(f"  {s['ticker']:6s} | {s['signal_type']:25s} | "
              f"Conviction: {s['conviction']:3d} | "
              f"Direction: {s.get('direction', 'n/a')}")
        print(f"    {s['reasoning']}")
