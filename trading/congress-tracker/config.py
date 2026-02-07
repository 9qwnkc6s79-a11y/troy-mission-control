"""
Congress Trading Bot Configuration
Mirrors politician stock trades on Alpaca paper trading
"""

# Alpaca Paper Trading Credentials
ALPACA_API_KEY = "PKLCDAJFD4REQAIPBTIQUGPD7X"
ALPACA_API_SECRET = "GWdBsYCnPZbdhAXckdqyFTYoUGARG158HBTRCER4Pfzz"
ALPACA_BASE_URL = "https://paper-api.alpaca.markets"

# Capital Allocation
TOTAL_ALLOCATION = 33000  # $33k of the $100k paper account
MAX_POSITION_SIZE = 5000  # Max per single trade
MIN_POSITION_SIZE = 500   # Min per trade (don't bother with tiny positions)

# Polling
POLL_INTERVAL_SECONDS = 1800  # 30 minutes

# Data Sources
CAPITOL_TRADES_URL = "https://www.capitoltrades.com/trades"

# Trade Sizing Multipliers
HIGH_ALPHA_MULTIPLIER = 2.5
REGULAR_MULTIPLIER = 1.5

# Exit Strategy
HOLD_DAYS = 30           # Default hold period
STOP_LOSS_PCT = 0.05     # 5% stop loss
TAKE_PROFIT_PCT = 0.15   # 15% take profit
TRAILING_TRIGGER_PCT = 0.10  # Trailing stop activates after +10%
TRAILING_STOP_PCT = 0.05     # Lock in 5% after trailing trigger

# Minimum trade value from disclosure to consider (in dollars)
MIN_TRADE_VALUE = 15000  # Lowered from $50k to catch more signals

# First run: only trade filings from the last N days
FIRST_RUN_LOOKBACK_DAYS = 30  # Expanded from 7 to catch more signals

# High Alpha Politicians (known for strong returns)
HIGH_ALPHA_POLITICIANS = [
    "nancy pelosi",
    "paul pelosi",
    "tommy tuberville",
    "dan crenshaw",
    "mark green",
    "josh gottheimer",
    "michael mccaul",
    "ro khanna",
    # Additional notable traders
    "marjorie taylor greene",
    "daniel goldman",
    "scott franklin",
    "byron donalds",
]

# Committee-Sector Mapping (politicians on these committees get bonus for trading in related sectors)
COMMITTEE_SECTOR_BONUS = {
    "hsba": ["financials"],                    # House Financial Services
    "ssbk": ["financials"],                    # Senate Banking
    "hsif": ["energy", "health-care", "communication-services"],  # House Energy & Commerce
    "sseg": ["energy"],                        # Senate Energy
    "hsas": ["industrials"],                   # House Armed Services
    "ssas": ["industrials"],                   # Senate Armed Services
    "hssy": ["information-technology"],         # House Science & Tech
    "sscm": ["information-technology", "communication-services"],  # Senate Commerce
    "sshr": ["health-care"],                   # Senate Health
    "ssfi": ["financials"],                    # Senate Finance
    "hswm": ["financials"],                    # House Ways & Means
}

# Logging — fixed to use actual bot location
_BOT_DIR = "/Users/danielkeene/clawd/trading/congress-tracker"
LOG_DIR = f"{_BOT_DIR}/logs"
LOG_FILE = f"{LOG_DIR}/congress_bot.log"

# State file to track seen transactions
STATE_FILE = f"{_BOT_DIR}/state.json"
TRADES_DB = f"{_BOT_DIR}/trades_db.json"

# Event Engine integration
EVENT_ENGINE_DIR = "/Users/danielkeene/clawd/trading/event-engine"

# Alpaca data for news lookups
ALPACA_DATA_URL = "https://data.alpaca.markets"
ALPACA_NEWS_URL = "https://data.alpaca.markets/v1beta1/news"
