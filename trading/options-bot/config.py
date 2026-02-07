"""
Options Trading Bot Configuration — v2
AI-driven options + stock strategies with LLM earnings analysis & regime awareness.
"""
import os

# ─── Alpaca Paper Trading Credentials ────────────────────────────────────────
ALPACA_API_KEY = "PKLCDAJFD4REQAIPBTIQUGPD7X"
ALPACA_API_SECRET = "GWdBsYCnPZbdhAXckdqyFTYoUGARG158HBTRCER4Pfzz"
ALPACA_BASE_URL = "https://paper-api.alpaca.markets"
ALPACA_DATA_URL = "https://data.alpaca.markets"

# ─── OpenAI / LLM ────────────────────────────────────────────────────────────
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL = "gpt-4o-mini"
LLM_EARNINGS_ENABLED = True
LLM_MIN_CONVICTION = 7  # Only trade earnings plays with LLM conviction >= 7

# ─── Capital Allocation ──────────────────────────────────────────────────────
TOTAL_ALLOCATION = 33000  # $33k of the $100k paper account
MAX_RISK_PER_TRADE = 990  # 3% of allocation
MAX_CONCURRENT_POSITIONS = 8  # Increased from 5 to allow more trades
STOCK_POSITION_MAX = 5000  # Max $ per stock position

# ─── Risk Management ─────────────────────────────────────────────────────────
MAX_NET_DELTA = 100         # Increased from 50 for more flexibility
TARGET_POSITIVE_THETA = True
MAX_LOSS_LONG_PCT = 0.50
MAX_LOSS_SHORT_MULT = 2.0
PROFIT_TARGET_PCT = 0.50
MIN_DTE_CLOSE = 21
NEVER_HOLD_THROUGH_EXPIRY = True

# ─── Watchlist (expanded with high-IV names) ─────────────────────────────────
WATCHLIST = [
    "SPY", "QQQ", "AAPL", "MSFT", "NVDA", "TSLA",
    "AMZN", "META", "GOOGL", "AMD", "JPM", "BAC", "XOM", "GS",
    # High-IV additions
    "NFLX", "CRM", "SNOW", "PLTR", "COIN", "MARA",
]

# ─── Strategy Parameters (LOOSENED for actual trade generation) ───────────────

# Strategy 1: IV Crush (Earnings)
IV_CRUSH_ENABLED = True
IV_CRUSH_PERCENTILE_THRESHOLD = 65   # Was 80 — most stocks sit 50-70
IV_CRUSH_EARNINGS_WINDOW_DAYS = 10   # Slightly wider window
IV_CRUSH_IRON_CONDOR_WING_WIDTH = 5
IV_CRUSH_DTE_MIN = 7
IV_CRUSH_DTE_MAX = 45

# Strategy 2: Mean Reversion Spreads
MEAN_REVERSION_ENABLED = True
MEAN_REVERSION_DROP_THRESHOLD = -0.02    # Was -0.03 → now -2%
MEAN_REVERSION_RALLY_THRESHOLD = 0.02    # Was  0.03 → now +2%
MEAN_REVERSION_VOLUME_RATIO_MIN = 1.2    # Was 1.5 (bull) / 0.8 (bear) — made configurable
MEAN_REVERSION_DTE_MIN = 30
MEAN_REVERSION_DTE_MAX = 45
MEAN_REVERSION_SPREAD_WIDTH = 5

# Strategy 3: Volatility Arbitrage
VOL_ARB_ENABLED = True
VOL_ARB_IV_HV_THRESHOLD = 1.0    # Was 1.5 → now 1.0 std deviations
VOL_ARB_HV_LOOKBACK = 30
VOL_ARB_DTE_MIN = 30
VOL_ARB_DTE_MAX = 60

# Strategy 4: Momentum Options
MOMENTUM_ENABLED = True
MOMENTUM_RSI_OVERSOLD = 35       # Was 30
MOMENTUM_RSI_OVERBOUGHT = 65     # Was 70
MOMENTUM_TARGET_DELTA = 0.65
MOMENTUM_DTE_MIN = 14
MOMENTUM_DTE_MAX = 30
MOMENTUM_STOP_LOSS_PCT = 0.30
MOMENTUM_PROFIT_TARGET_PCT = 0.75

# Strategy 5: Stock trades (directional execution when options analysis says go)
STOCK_TRADES_ENABLED = True
STOCK_STOP_LOSS_PCT = 0.03   # 3% stop loss on stock trades
STOCK_TAKE_PROFIT_PCT = 0.06 # 6% take profit

# ─── Regime Awareness (VIX-based) ────────────────────────────────────────────
REGIME_ENABLED = True
VIX_HIGH = 25        # High VIX: favor selling premium
VIX_LOW = 15         # Low VIX: favor buying premium
VIX_SPIKE_PCT = 0.20 # 20% daily VIX increase = spike, wait to settle

# ─── Scanning Schedule ────────────────────────────────────────────────────────
SCAN_INTERVAL_SECONDS = 600   # 10 minutes (was 15)
EARNINGS_CHECK_HOUR = 8
MARKET_OPEN_HOUR = 9
MARKET_OPEN_MINUTE = 30
MARKET_CLOSE_HOUR = 16

# ─── Paths (all relative to BOT_DIR — FIXED) ─────────────────────────────────
BOT_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_DIR = os.path.join(BOT_DIR, "logs")
LOG_FILE = os.path.join(LOG_DIR, "options_bot.log")
STATE_FILE = os.path.join(BOT_DIR, "state.json")
STATUS_FILE = os.path.join(BOT_DIR, "status.json")
TRADES_DB = os.path.join(BOT_DIR, "trades_db.json")
PID_FILE = os.path.join(BOT_DIR, "bot.pid")

# ─── Data Source URLs ─────────────────────────────────────────────────────────
YAHOO_OPTIONS_URL = "https://query1.finance.yahoo.com/v7/finance/options/{ticker}"
YAHOO_QUOTE_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
EARNINGS_CALENDAR_URL = "https://api.nasdaq.com/api/calendar/earnings"
VIX_TICKER = "^VIX"
