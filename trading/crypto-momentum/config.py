"""
Trading Bot Configuration V2 — Sentiment + Regime-Aware
Rebuilt to eliminate overtrading and use multi-layer signal confirmation.
"""

import os

# ═══════════════════════════════════════════════════════════════
# ALPACA CREDENTIALS
# ═══════════════════════════════════════════════════════════════
ALPACA_API_KEY = "PKLCDAJFD4REQAIPBTIQUGPD7X"
ALPACA_API_SECRET = "GWdBsYCnPZbdhAXckdqyFTYoUGARG158HBTRCER4Pfzz"
ALPACA_BASE_URL = "https://paper-api.alpaca.markets"
ALPACA_DATA_URL = "https://data.alpaca.markets"

# OpenAI for LLM trade analysis
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL = "gpt-4o-mini"  # Cost-efficient for trade analysis

# ═══════════════════════════════════════════════════════════════
# TRADING PAIRS — trimmed to quality only
# ═══════════════════════════════════════════════════════════════
SYMBOLS = ["BTC/USD", "ETH/USD", "SOL/USD"]

# ═══════════════════════════════════════════════════════════════
# TIMEFRAMES — longer timeframes to avoid noise
# ═══════════════════════════════════════════════════════════════
PRIMARY_TIMEFRAME = "15Min"      # Primary signal generation
SECONDARY_TIMEFRAME = "1Hour"    # Trend/regime confirmation
REGIME_TIMEFRAME = "1Hour"       # Regime detection (ADX, ATR)
REGIME_TIMEFRAME_HTF = "4Hour"   # Higher timeframe regime

# ═══════════════════════════════════════════════════════════════
# REGIME DETECTION PARAMETERS
# ═══════════════════════════════════════════════════════════════
ADX_PERIOD = 14
ADX_TRENDING_THRESHOLD = 25      # ADX > 25 = trending market
ADX_RANGING_THRESHOLD = 20       # ADX < 20 = ranging market
ATR_PERIOD = 14
ATR_HIGH_VOL_MULTIPLIER = 1.5   # ATR > 1.5x avg = high volatility
REGIME_UPDATE_INTERVAL = 900     # 15 minutes in seconds

# ═══════════════════════════════════════════════════════════════
# TECHNICAL INDICATOR PARAMETERS
# ═══════════════════════════════════════════════════════════════
RSI_PERIOD = 14
RSI_OVERSOLD = 30                # Oversold for mean reversion
RSI_OVERBOUGHT = 70              # Overbought for mean reversion
RSI_TREND_BUY = 45               # RSI below this + rising in trend = buy
RSI_TREND_SELL = 55              # RSI above this + falling in trend = sell

EMA_FAST = 9
EMA_SLOW = 21
EMA_TREND = 50                   # Longer-term trend EMA

MACD_FAST = 12
MACD_SLOW = 26
MACD_SIGNAL = 9

BB_PERIOD = 20
BB_STD = 2

# ═══════════════════════════════════════════════════════════════
# RISK MANAGEMENT — conservative, let winners run
# ═══════════════════════════════════════════════════════════════
MAX_CONCURRENT_POSITIONS = 3     # Down from 5
MAX_PORTFOLIO_PCT_PER_TRADE = 0.15  # 15% max per trade (was 25%)
STOP_LOSS_PCT = 0.03             # 3% stop loss (was 1.5%)
TAKE_PROFIT_PCT = 0.06           # 6% take profit (was 1.5%)
TRAILING_STOP_TRIGGER = 0.04     # +4% triggers trailing stop
TRAILING_STOP_TRAIL = 0.02       # Trail at 2% below peak
MAX_DAILY_LOSS_PCT = 0.03        # 3% daily loss limit (was 5%)
MAX_TRADES_PER_DAY = 10          # Hard cap on daily trades
MIN_TRADE_INTERVAL_SECONDS = 1800  # 30 min between trades on same symbol

# Position sizing by confidence level
POSITION_SIZE = {
    "high": 0.15,    # 15% of portfolio (was 25%)
    "medium": 0.10,  # 10% of portfolio (was 15%)
    "low": 0.05,     # 5% of portfolio (was 10%)
}

# ═══════════════════════════════════════════════════════════════
# SENTIMENT PARAMETERS
# ═══════════════════════════════════════════════════════════════
SENTIMENT_UPDATE_INTERVAL = 900   # 15 minutes
FEAR_GREED_EXTREME_FEAR = 25     # Below this = contrarian buy signal
FEAR_GREED_EXTREME_GREED = 75    # Above this = contrarian sell signal

# ═══════════════════════════════════════════════════════════════
# LLM TRADE ANALYSIS
# ═══════════════════════════════════════════════════════════════
LLM_MIN_CONVICTION = 7           # Only execute if LLM rates >= 7/10
LLM_ENABLED = True               # Can disable for testing

# ═══════════════════════════════════════════════════════════════
# DATA COLLECTION
# ═══════════════════════════════════════════════════════════════
BARS_LOOKBACK = 100              # Number of bars to fetch

# ═══════════════════════════════════════════════════════════════
# LOGGING
# ═══════════════════════════════════════════════════════════════
LOG_DIR = "logs"
TRADE_LOG_FILE = "logs/trades.json"
STATUS_FILE = "logs/status.json"
BOT_LOG_FILE = "logs/bot.log"
SENTIMENT_LOG_FILE = "logs/sentiment.log"
REGIME_LOG_FILE = "logs/regime.log"

# ═══════════════════════════════════════════════════════════════
# MAIN LOOP
# ═══════════════════════════════════════════════════════════════
MAIN_LOOP_INTERVAL = 60          # Check every 60 seconds (was 5!)
