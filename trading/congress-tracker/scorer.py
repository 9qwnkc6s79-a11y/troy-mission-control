"""
Trade Scorer
Scores congressional trades for "surprise factor" to determine position sizing.
"""

import logging
from typing import Dict

import config

logger = logging.getLogger("congress_bot.scorer")


def score_trade(trade: Dict) -> Dict:
    """
    Score a trade for surprise factor.
    Returns the trade dict with added 'score' and 'score_breakdown' fields.
    
    Scoring:
    - Trade size: 0-30 points
    - High alpha politician: 0-25 points
    - Committee-sector alignment: 0-20 points
    - Reporting speed: 0-15 points (faster = more interesting)
    - Freshness: 0-10 points
    """
    score = 0
    breakdown = {}
    
    # 1. Trade Size Score (0-30 points)
    value = trade.get("value", 0)
    if value >= 5000000:      # $5M+
        size_score = 30
    elif value >= 1000000:    # $1M+
        size_score = 25
    elif value >= 500000:     # $500k+
        size_score = 22
    elif value >= 250000:     # $250k+
        size_score = 20
    elif value >= 100000:     # $100k+
        size_score = 15
    elif value >= 50000:      # $50k+
        size_score = 10
    elif value >= 15000:      # $15k+
        size_score = 5
    else:
        size_score = 2
    breakdown["size"] = size_score
    score += size_score
    
    # 2. High Alpha Politician (0-25 points)
    politician_name = trade.get("politician_name", "").lower()
    is_high_alpha = any(
        ha in politician_name 
        for ha in config.HIGH_ALPHA_POLITICIANS
    )
    if is_high_alpha:
        alpha_score = 25
        trade["is_high_alpha"] = True
    else:
        alpha_score = 0
        trade["is_high_alpha"] = False
    breakdown["high_alpha"] = alpha_score
    score += alpha_score
    
    # 3. Committee-Sector Alignment (0-20 points)
    # We don't have committee data per trade, but we know some politicians' committees
    sector = trade.get("sector", "")
    committee_score = 0
    
    # Known committee-heavy traders in relevant sectors
    KNOWN_COMMITTEE_TRADES = {
        "nancy pelosi": ["information-technology", "financials"],
        "tommy tuberville": ["industrials", "financials"],
        "michael mccaul": ["information-technology", "industrials", "communication-services"],
        "mark green": ["industrials", "health-care"],
        "josh gottheimer": ["financials", "information-technology"],
        "dan crenshaw": ["energy", "industrials"],
        "ro khanna": ["information-technology", "industrials"],
    }
    
    for pol_key, sectors in KNOWN_COMMITTEE_TRADES.items():
        if pol_key in politician_name and sector in sectors:
            committee_score = 20
            break
    
    breakdown["committee_alignment"] = committee_score
    score += committee_score
    
    # 4. Reporting Speed (0-15 points) - faster reporting = more interesting
    gap = trade.get("reporting_gap_days", 999)
    if gap <= 3:
        speed_score = 15  # Very fast - they want people to know
    elif gap <= 7:
        speed_score = 12
    elif gap <= 14:
        speed_score = 8
    elif gap <= 30:
        speed_score = 5
    elif gap <= 45:
        speed_score = 2
    else:
        speed_score = 0   # Very old filing
    breakdown["reporting_speed"] = speed_score
    score += speed_score
    
    # 5. Buy vs Sell bonus (0-10 points)
    # Buys are generally more actionable signals
    if trade.get("tx_type") == "buy":
        action_score = 10
    else:
        action_score = 5
    breakdown["action_type"] = action_score
    score += action_score
    
    trade["score"] = score
    trade["score_breakdown"] = breakdown
    trade["max_score"] = 100
    
    return trade


def get_position_multiplier(trade: Dict) -> float:
    """
    Determine position size multiplier based on politician alpha status.
    """
    if trade.get("is_high_alpha", False):
        return config.HIGH_ALPHA_MULTIPLIER
    return config.REGULAR_MULTIPLIER


def calculate_position_size(trade: Dict, available_capital: float) -> float:
    """
    Calculate the dollar amount to allocate to this trade.
    
    Base allocation = (score / 100) * max_position * multiplier
    Capped at MAX_POSITION_SIZE and available capital.
    """
    score = trade.get("score", 0)
    multiplier = get_position_multiplier(trade)
    
    # Base position as percentage of max
    score_pct = min(score / 100, 1.0)
    
    # Calculate position
    base_position = score_pct * config.MAX_POSITION_SIZE * multiplier
    
    # Apply bounds
    position = max(config.MIN_POSITION_SIZE, base_position)
    position = min(position, config.MAX_POSITION_SIZE)
    position = min(position, available_capital * 0.15)  # Max 15% of remaining capital per trade
    
    return round(position, 2)


def should_trade(trade: Dict) -> bool:
    """
    Determine if a trade meets minimum criteria to mirror.
    """
    # Must have a score above threshold
    if trade.get("score", 0) < 15:
        return False
    
    # Must have value >= MIN_TRADE_VALUE
    if trade.get("value", 0) < config.MIN_TRADE_VALUE:
        return False
    
    # Must have a ticker
    if not trade.get("ticker"):
        return False
    
    return True


if __name__ == "__main__":
    # Test scoring
    test_trade = {
        "politician_name": "Nancy Pelosi",
        "tx_type": "buy",
        "value": 1000000,
        "ticker": "NVDA",
        "sector": "information-technology",
        "reporting_gap_days": 5,
    }
    
    scored = score_trade(test_trade)
    print(f"Score: {scored['score']}/100")
    print(f"Breakdown: {scored['score_breakdown']}")
    print(f"Should trade: {should_trade(scored)}")
    print(f"Position size: ${calculate_position_size(scored, 33000):,.2f}")
