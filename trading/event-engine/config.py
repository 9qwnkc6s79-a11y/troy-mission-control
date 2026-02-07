"""
Event Engine Configuration
"""
import os

# Alpaca Credentials
ALPACA_API_KEY = "PKLCDAJFD4REQAIPBTIQUGPD7X"
ALPACA_API_SECRET = "GWdBsYCnPZbdhAXckdqyFTYoUGARG158HBTRCER4Pfzz"
ALPACA_BASE_URL = "https://paper-api.alpaca.markets"
ALPACA_DATA_URL = "https://data.alpaca.markets"

# OpenAI
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL = "gpt-4o-mini"

# SEC EDGAR
SEC_EDGAR_SEARCH_URL = "https://efts.sec.gov/LATEST/search-index"
SEC_EDGAR_FULLTEXT_URL = "https://efts.sec.gov/LATEST/search-index"
SEC_EDGAR_FILING_URL = "https://www.sec.gov/cgi-bin/browse-edgar"
SEC_FULL_TEXT_SEARCH = "https://efts.sec.gov/LATEST/search-index"
# Better: use the full-text search API
SEC_SEARCH_API = "https://efts.sec.gov/LATEST/search-index"

# Use the working EDGAR full-text search endpoint
EDGAR_FULL_TEXT_SEARCH = "https://efts.sec.gov/LATEST/search-index"
EDGAR_SUBMISSIONS_URL = "https://data.sec.gov/submissions"
EDGAR_FILINGS_URL = "https://www.sec.gov/cgi-bin/browse-edgar"

# Alpaca News API
ALPACA_NEWS_URL = "https://data.alpaca.markets/v1beta1/news"

# Signal weights
WEIGHT_SEC = 0.40       # SEC filings are highest quality
WEIGHT_NEWS = 0.30      # News sentiment
WEIGHT_EARNINGS = 0.20  # Earnings intelligence
WEIGHT_CONGRESS = 0.10  # Congressional trades (handled separately)

# Insider cluster thresholds
INSIDER_CLUSTER_MIN = 2      # Minimum insiders buying = cluster
INSIDER_CLUSTER_DAYS = 14    # Within this many days

# Signal score thresholds
MIN_SIGNAL_SCORE = 30        # Minimum to surface as a recommendation
HIGH_CONVICTION_SCORE = 70   # High conviction threshold

# Cache
CACHE_DIR = os.path.join(os.path.dirname(__file__), ".cache")
os.makedirs(CACHE_DIR, exist_ok=True)
