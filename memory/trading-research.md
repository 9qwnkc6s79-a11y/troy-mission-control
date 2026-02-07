# AI/Bot Trading Research — Alpaca API
*Compiled: January 30, 2026*

---

## Table of Contents
1. [Best Asset Class for Bot Trading via Alpaca](#1-best-asset-class-for-bot-trading-via-alpaca)
2. [X/Twitter Sentiment-Driven Trading](#2-xtwitter-sentiment-driven-trading)
3. [What Other People's Trading Bots Have Done](#3-what-other-peoples-trading-bots-have-done)
4. [Recommended Strategy for Our Setup](#4-recommended-strategy-for-our-setup)
5. [Practical Alpaca API Setup](#5-practical-alpaca-api-setup)
6. [Strategy Rankings](#6-strategy-rankings)
7. [Risk Warnings](#7-risk-warnings)

---

## 1. Best Asset Class for Bot Trading via Alpaca

### What Alpaca Actually Supports

| Asset Class | Supported | Commission | Key Constraints |
|---|---|---|---|
| **US Stocks** | ✅ Full support | Commission-free | PDT rule (<$25k = max 3 day trades/5 days) |
| **ETFs** | ✅ Full support | Commission-free | Same as stocks (they ARE stocks) |
| **Crypto** | ✅ 20+ assets, 56 pairs | Fee-based (15-25 bps) | 24/7 trading, no margin, no shorting |
| **Options** | ✅ Levels 0-3 | Per-contract fees | Day TIF only, no extended hours, whole lots only |
| **Fractional Shares** | ✅ 2,000+ equities | Commission-free | Market orders only for fractions (limit/stop now supported too) |

### Detailed Breakdown

#### Stocks/ETFs
- **Pros:** Commission-free, fractional trading ($1 minimum), margin available (2x overnight, 4x intraday for PDT accounts), full extended hours (4am-8pm ET), overnight trading (8pm-4am via Blue Ocean ATS), short selling available
- **Cons:** PDT rule is the killer — with <$25k equity, you're limited to 3 day trades per 5 business days. This severely limits high-frequency strategies
- **Minimum Capital:** $0 to start, but $2,000 for margin access, $25,000 to avoid PDT restrictions
- **For us ($500-2000):** PDT rule means only 3 day trades per week for stocks. This is a hard constraint

#### Crypto
- **Pros:** 24/7/365 trading, NO PDT rule, fractional orders, no minimum capital, real-time websocket data
- **Cons:** Fees (0.15% maker / 0.25% taker at lowest tier), no margin, no shorting, limited to ~20 assets, higher volatility/risk
- **Supported pairs:** BTC/USD, ETH/USD, plus ~54 other pairs (BTC, USDT, USDC base pairs)
- **Order types:** Market, Limit, Stop Limit (GTC and IOC time-in-force)
- **For us ($500-2000):** **Best option.** No PDT rule means unlimited trades. 24/7 means our bot can work around the clock. Fees are manageable for larger moves

#### Options
- **Pros:** Leverage without margin (1 contract = 100 shares), defined risk with spreads, high reward potential
- **Cons:** Complex, whole contracts only (no fractional), day TIF only, Levels 1-3 required for different strategies, options buying power needed, assignment risk
- **Levels available:**
  - Level 0: Disabled
  - Level 1: Covered calls, cash-secured puts
  - Level 2: Level 1 + buy calls/puts
  - Level 3: Level 2 + spreads
- **For us ($500-2000):** Risky with small capital. Single option contracts on expensive stocks can be $200-500+. Limited diversification. But buying cheap calls/puts on volatile events could be explosive. Paper trading has options enabled by default

### Verdict: Asset Class Ranking for Our Setup

1. **🥇 Crypto** — No PDT, 24/7, unlimited trades, sentiment-driven, volatile = more opportunities
2. **🥈 Stocks (swing trades only)** — Commission-free, but PDT limits day trading to 3/week
3. **🥉 Options** — High risk/reward but requires more capital and expertise. Could be a Phase 2 play
4. **ETFs** — Same as stocks but less volatile. Better for conservative approaches

---

## 2. X/Twitter Sentiment-Driven Trading

### How Institutional Players Use Social Signals

**Hedge Funds Using Twitter/Social Data:**
- **Two Sigma, Renaissance Technologies, DE Shaw** — All known to incorporate alternative data including social sentiment
- **JP Morgan** developed a "Volfefe Index" (2019) specifically tracking how Trump's tweets affected Treasury bond volatility
- **Bloomberg** has built-in social sentiment feeds from Twitter
- **DataMinr** — Sells real-time Twitter signal detection to institutional traders (millions $/year)

**Academic Evidence:**
- Bollen et al. (2011) — Landmark study: Twitter mood (specifically "calm" sentiment) predicted DJIA movements with 87.6% accuracy over short periods
- Several studies show aggregate Twitter sentiment correlates with next-day stock returns, particularly for high-attention stocks
- The effect is strongest in the first 15-60 minutes after a sentiment shift

### What Types of X Signals Actually Predict Market Moves

**Tier 1 — Highest Alpha (Act in seconds-minutes):**
- **Executive/Company official tweets** — CEO statements, product announcements, regulatory updates
- **Political/Regulatory tweets** — Presidential tweets about tariffs, Fed policy hints, SEC actions
- **Breaking news from journalists** — Pre-publication hints, breaking stories from @DeItaone, @LiveSquawk, @zaborhedge, @FirstSquawk
- **Elon Musk tweets** — Historically moved TSLA, DOGE, BTC, and any company he mentions

**Tier 2 — Moderate Alpha (Act in minutes-hours):**
- **Aggregate sentiment shifts** — Bulk change in positive/negative sentiment for a ticker
- **Volume spike in mentions** — Sudden increase in ticker mentions often precedes moves
- **Earnings reaction consensus** — Real-time crowd reaction to earnings beats/misses

**Tier 3 — Low/No Alpha for Small Traders:**
- **General market sentiment** — Too slow, already priced in by the time you see it
- **Reddit/WSB crowd plays** — Usually too late by the time it trends
- **Crypto influencer shills** — Obvious pump-and-dump, you're exit liquidity

### Market Reaction Speed to Tweets

- **Sub-second to 5 seconds:** Automated systems (hedge funds, HFT firms) react to keywords
- **5-30 seconds:** Fast retail traders with alerts, API-connected bots
- **30 seconds - 5 minutes:** Most human traders reading Twitter
- **5-15 minutes:** Price typically stabilizes, first move is largely done
- **15-60 minutes:** Mean reversion may occur if initial reaction was overblown

**Critical insight:** By the time we can process a tweet, NLP-analyze it, and execute a trade, institutional players have already moved the price. Our edge is NOT speed — it's **pattern recognition across many signals** and **trading assets where institutions have less presence (small caps, crypto).**

### Specific Accounts/Keywords That Move Markets

**Must-Monitor Accounts:**
- `@elikinosian` (Reuters)
- `@DeItaone` (Walter Bloomberg — fastest news account)
- `@zaborhedge` (Zerohedge)
- `@FirstSquawk` (financial news)
- `@LiveSquawk` (market-moving headlines)
- `@unusual_whales` (options flow)
- `@realDonaldTrump` / political leaders
- `@elonmusk` (moves TSLA, crypto, meme stocks)
- Official company accounts for stocks you're trading
- Fed officials' accounts

**High-Signal Keywords:**
- `$TICKER` + "announces", "acquisition", "merger", "FDA", "approved", "recall"
- "Breaking:", "JUST IN:", "DEVELOPING:"
- Crypto: "hack", "exploit", "listing", "delisting", "whale", "SEC", "regulation"
- "Tariff", "sanctions", "ban", "executive order"

### Examples of Successful Twitter-Based Trades

1. **Trump tariff tweets (2018-2019):** JP Morgan's Volfefe Index showed Trump tweets caused measurable bond market moves. Traders who shorted on "tariff" tweets consistently profited
2. **Elon Musk + Dogecoin (2021):** Each Musk tweet about Doge caused 10-30% spikes within minutes. Bots monitoring his account profited enormously
3. **GameStop/AMC (2021):** Social media sentiment on Reddit/Twitter preceded the massive short squeeze. Early sentiment detectors made 10-100x
4. **FDA approvals tweeted:** Biotech stocks regularly jump 20-100% on FDA approval news first broken on Twitter
5. **Crypto exchange listings:** When Coinbase/Binance announces new token listings, the token often pumps 20-50% within minutes

---

## 3. What Other People's Trading Bots Have Done

### Realistic Returns — What's Actually Achievable

**The honest truth:**
- **Most retail algo traders lose money** — Studies suggest 70-80% of day traders lose money overall
- **Consistent 1-3% monthly** (12-36% annual) is considered excellent for a retail algo
- **5-10% monthly** is possible but rare and usually involves significant risk
- **100%+ returns** happen but are outliers, usually involving high leverage or a single lucky trade

**What the community reports (r/algotrading, forums):**
- Many report break-even after fees for the first 6-12 months
- Successful traders often report 15-50% annual returns after optimization
- Crypto bots in bull markets have reported 100%+ but give most back in bear markets
- The survivorship bias is massive — you hear from winners, not the 80% who quit

### Common Strategy Types

#### Momentum / Trend Following
- **How:** Buy assets showing upward price/volume momentum, sell when momentum fades
- **Indicators:** RSI, MACD, moving average crossovers, volume breakouts
- **Returns:** 10-30% annually in trending markets, loses in choppy/sideways markets
- **Best for:** Crypto (strong trends), growth stocks
- **Complexity:** Low-Medium

#### Mean Reversion
- **How:** Buy oversold assets, sell overbought ones, betting they return to average
- **Indicators:** Bollinger Bands, RSI extremes, Z-score from moving average
- **Returns:** 10-25% annually, more consistent than momentum
- **Best for:** ETFs, large-cap stocks, stable crypto pairs
- **Complexity:** Medium

#### Event-Driven / News-Based
- **How:** Trade on breaking news, earnings, FDA approvals, political events
- **Signals:** Twitter monitoring, news APIs, earnings calendars
- **Returns:** Highly variable — some events produce 5-20% moves in minutes
- **Best for:** Biotech, meme stocks, crypto (exchange listings, regulatory news)
- **Complexity:** High (NLP, latency requirements)

#### Sentiment Analysis
- **How:** Aggregate social media/news sentiment, trade when sentiment shifts
- **Signals:** Twitter, Reddit, StockTwits, news headlines
- **Returns:** Academic studies show 1-3% edge over random, translating to 15-40% annual with leverage
- **Best for:** Meme stocks, crypto, any high-attention asset
- **Complexity:** High (requires NLP pipeline)

#### Pairs Trading / Statistical Arbitrage
- **How:** Find correlated assets, go long the underperformer, short the outperformer
- **Returns:** 8-15% annually, very consistent
- **Best for:** ETFs, sector stocks
- **Complexity:** Medium-High
- **Problem for us:** Requires short selling, which needs $2k+ margin account

### Common Failures and Mistakes

1. **Overfitting** — Strategy works perfectly in backtest, fails live. #1 killer of algo traders
2. **Ignoring transaction costs** — Looks profitable until you add spreads, fees, slippage
3. **No risk management** — One bad trade wipes out months of gains
4. **Curve fitting to recent data** — Strategy only works in the exact market condition you tested
5. **Emotional override** — Turning off the bot during drawdowns, then missing the recovery
6. **Ignoring PDT rules** — Getting account restricted kills momentum-based strategies
7. **Not accounting for slippage** — Paper trading fills at mid-price, live trading doesn't
8. **Over-leveraging** — Margin amplifies losses as much as gains
9. **Running in production without enough paper trading** — Bugs cost real money
10. **Survivorship bias in strategy selection** — Copying "successful" strategies that were just lucky

### Open Source Frameworks Worth Studying

| Framework | Focus | Stars | Best For |
|---|---|---|---|
| **[Freqtrade](https://github.com/freqtrade/freqtrade)** | Crypto | 35k+ | Full-featured crypto bot with backtesting, ML optimization, Telegram control |
| **[Jesse](https://github.com/jesse-ai/jesse)** | Crypto | 6k+ | Clean Python strategy syntax, backtesting, live trading |
| **[Lumibot](https://github.com/Lumiwealth/lumibot)** | Multi-asset | 2k+ | **Has direct Alpaca integration**, stocks/options/crypto/forex |
| **[Zipline](https://github.com/quantopian/zipline)** | Stocks | 17k+ | Backtesting engine (Quantopian's legacy), educational |
| **[LiuAlgoTrader](https://github.com/amor71/LiuAlgoTrader)** | Stocks | 800+ | Built specifically for Alpaca API |
| **[alpaca-py](https://github.com/alpacahq/alpaca-py)** | Multi-asset | Official SDK | Alpaca's own Python SDK — must use |
| **[cira](https://github.com/AxelGard/cira)** | Stocks | Facade lib | Simplified wrapper around alpaca-py |

**Recommendation:** Start with `alpaca-py` (official SDK) directly. Use Lumibot if you want a higher-level framework with built-in backtesting. Study Freqtrade's architecture for strategy patterns even though it's crypto-exchange focused.

---

## 4. Recommended Strategy for Our Setup

### Our Advantages
- ✅ Alpaca API access (stocks, crypto, options)
- ✅ X/Twitter monitoring capability (Clawdbot)
- ✅ 24/7 uptime (server always on)
- ✅ Real-time news processing (AI-powered analysis)
- ✅ Fast decision-making (Claude can analyze in seconds)
- ✅ No emotional trading

### Our Constraints
- ❌ $500-2000 starting capital
- ❌ PDT rule blocks frequent stock day trading
- ❌ No HFT-level latency
- ❌ No historical edge (we're starting fresh)
- ❌ Transaction fees on crypto

### Proposed Strategy: "Sentiment Momentum Crypto Scalper"

**Why Crypto as Primary:**
- No PDT rule = unlimited trades
- 24/7 trading = our 24/7 uptime is fully utilized
- Sentiment-driven = perfect for our X monitoring capability
- High volatility = more opportunities for quick gains
- Low minimum = $1 minimum trade

**Core Strategy — Three Layers:**

#### Layer 1: Sentiment-Triggered Trades (Primary)
**Entry Rules:**
- Monitor X for breaking crypto news (exchange listings, regulatory, whale movements, Elon tweets)
- Score sentiment in real-time using NLP (positive/negative/neutral + magnitude)
- **BUY signal:** Sudden positive sentiment spike for a specific crypto (>2 standard deviations from baseline mention volume + positive sentiment)
- **SELL/SHORT signal:** Sudden negative sentiment (hack, exploit, regulatory crackdown)
- Enter within 60 seconds of signal detection

**Exit Rules:**
- Take profit: +2% to +5% from entry (scale based on volatility)
- Stop loss: -1.5% from entry (always set immediately)
- Time stop: Exit after 30 minutes if neither TP nor SL hit
- Trailing stop: If up >3%, move stop to +1%

**Position Sizing:**
- Maximum 20% of portfolio per trade
- Scale position by confidence level:
  - High confidence (clear news catalyst): 20%
  - Medium confidence (sentiment shift): 10%
  - Low confidence (ambiguous signal): 5%

#### Layer 2: Momentum Following (Secondary)
**Entry Rules:**
- Monitor BTC/USD and ETH/USD on 5-minute and 15-minute timeframes
- Use RSI (14-period) + Volume:
  - Buy when RSI crosses above 30 (oversold bounce) with above-average volume
  - Sell when RSI crosses below 70 (overbought reversal) with above-average volume
- Confirm with 20-period EMA direction

**Exit Rules:**
- Take profit: +1.5% to +3%
- Stop loss: -1% hard stop
- Exit on opposite signal

**Position Sizing:**
- Maximum 15% of portfolio per trade
- Only trade during high-volume periods (US market hours for BTC correlation)

#### Layer 3: Stock Event Trades (Opportunistic, Limited by PDT)
**Entry Rules:**
- Save day trades for HIGH-CONVICTION plays only (max 3/week)
- Triggers: Major earnings surprise, FDA approval, M&A announcement
- Only enter stocks with >5% expected move
- Use fractional shares to manage position size

**Exit Rules:**
- Same day exit (it's a day trade, use it wisely)
- Take profit: 3-10% depending on catalyst
- Stop loss: -2%

**Position Sizing:**
- Maximum 25% of portfolio (these should be high conviction)

### Risk Management Framework

| Rule | Value |
|---|---|
| Max portfolio risk per trade | 2% of total capital |
| Max daily loss | 5% of total capital |
| Max concurrent positions | 3 |
| Max crypto allocation | 80% of portfolio |
| Always use stop losses | YES — no exceptions |
| Daily loss limit circuit breaker | Bot stops trading for 24h after -5% day |
| Weekly review | Manual review of all trades every Sunday |

### Expected Returns (Honest Assessment)

| Scenario | Monthly Return | Annual Return | Probability |
|---|---|---|---|
| **Best case** | +8-15% | +100-200% | 10% |
| **Good case** | +3-5% | +36-60% | 25% |
| **Realistic case** | +1-2% | +12-24% | 30% |
| **Break even** | 0% | 0% | 20% |
| **Loss** | -2-5%/mo | Lose 20-50% | 15% |

**With $1,000 starting capital, realistic range after 6 months: $800 - $1,500**

The goal isn't to get rich quick — it's to build a system that can scale once proven.

---

## 5. Practical Alpaca API Setup

### Paper Trading vs Live

**Paper Trading:**
- Free for all Alpaca users (just email signup)
- Starts with $100k virtual balance (configurable on reset)
- Uses real-time market data
- Same API endpoints, just different base URL
- Base URL: `https://paper-api.alpaca.markets`
- **Simulates PDT rules** — test with realistic balance
- Does NOT simulate: slippage, market impact, dividends, borrow fees
- **Recommendation:** Run paper for minimum 2-4 weeks before going live

**Live Trading:**
- Requires full account onboarding (KYC/identity verification)
- Real money, real consequences
- $0 minimum to start
- $2,000 minimum for margin trading
- $25,000 minimum to avoid PDT restrictions
- Base URL: `https://api.alpaca.markets`

### API Rate Limits

Alpaca doesn't publish hard rate limits in their current docs, but from community experience:
- **REST API:** ~200 requests/minute (varies by endpoint)
- **Websocket streaming:** No explicit limit on receiving data
- **Order submission:** Reasonable limits, not explicitly capped for normal use
- **Market data:** Real-time via websocket (recommended), REST for historical
- **Best practice:** Use websockets for real-time data, REST for order management
- **Free tier data:** IEX exchange data only (paper accounts). Full SIP data requires paid subscription

### Options Trading Requirements

- Paper: Options enabled by default (all levels)
- Live: Must apply for options trading approval
- Level 1: Covered calls, cash-secured puts
- Level 2: Buy calls/puts (most useful for us)
- Level 3: Spreads
- Options orders: day TIF only, no extended hours, whole contracts only
- No fractional options contracts

### Best Python Libraries

#### Must-Have
```
pip install alpaca-py          # Official Alpaca SDK (trading + data)
pip install pandas             # Data manipulation
pip install numpy              # Numerical computing
pip install websockets         # Real-time data streaming
```

#### For Strategy Development
```
pip install ta                 # Technical analysis indicators
pip install scikit-learn       # ML for sentiment/pattern recognition
pip install nltk               # NLP for sentiment analysis
pip install vaderSentiment     # Quick sentiment scoring
pip install textblob           # Alternative sentiment analysis
```

#### For Backtesting
```
pip install lumibot            # Backtesting framework with Alpaca integration
pip install vectorbt           # Fast vectorized backtesting
pip install backtrader         # Popular backtesting framework
```

#### For Data & Monitoring
```
pip install schedule           # Task scheduling
pip install loguru             # Better logging
pip install python-dotenv      # Environment variable management
pip install tweepy             # Twitter/X API access
pip install aiohttp            # Async HTTP for performance
```

### Quick Start Code Structure

```python
# Basic Alpaca trading bot skeleton
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce
from alpaca.data.live import CryptoDataStream

# Initialize
trading_client = TradingClient('API_KEY', 'SECRET_KEY', paper=True)

# Check account
account = trading_client.get_account()
print(f"Buying Power: ${account.buying_power}")
print(f"Portfolio Value: ${account.portfolio_value}")

# Submit a crypto order
order = MarketOrderRequest(
    symbol="BTC/USD",
    qty=0.001,
    side=OrderSide.BUY,
    time_in_force=TimeInForce.GTC
)
result = trading_client.submit_order(order)

# Stream real-time crypto data
stream = CryptoDataStream('API_KEY', 'SECRET_KEY')

async def on_bar(bar):
    print(f"{bar.symbol}: ${bar.close} | Volume: {bar.volume}")

stream.subscribe_bars(on_bar, "BTC/USD", "ETH/USD")
stream.run()
```

### Environment Setup

```bash
# .env file
ALPACA_API_KEY=your_key_here
ALPACA_SECRET_KEY=your_secret_here
ALPACA_BASE_URL=https://paper-api.alpaca.markets  # Switch to live when ready
```

---

## 6. Strategy Rankings — By Viability for Our Setup

### Ranked from "Do This First" to "Maybe Later"

| Rank | Strategy | Asset | Capital Needed | Complexity | Expected Edge |
|---|---|---|---|---|---|
| **#1** | Crypto Sentiment Scalper | Crypto | $500+ | High | High if X signals are good |
| **#2** | Crypto Momentum (RSI/EMA) | Crypto | $500+ | Medium | Medium, well-documented |
| **#3** | News-Driven Stock Swing | Stocks | $500+ | Medium | Medium, limited by PDT |
| **#4** | Earnings Event Plays | Stocks | $1000+ | Medium | Medium, 4x/year per stock |
| **#5** | Options Event Trades | Options | $1000+ | High | High risk/reward |
| **#6** | Crypto Mean Reversion | Crypto | $500+ | Medium | Medium in range-bound markets |
| **#7** | Pairs Trading | Stocks | $2000+ | High | Low-Medium, needs margin |

### Phase Plan

**Phase 1 (Weeks 1-2): Paper Trading Foundation**
- Set up Alpaca paper account
- Build basic crypto momentum bot (Layer 2)
- Monitor performance, fix bugs
- Start X sentiment pipeline in parallel

**Phase 2 (Weeks 3-4): Add Sentiment Layer**
- Connect X monitoring to trading signals
- Implement Layer 1 (sentiment-triggered trades)
- Paper trade both layers simultaneously
- Tune thresholds based on results

**Phase 3 (Week 5+): Go Live with Crypto**
- Start with $500 live capital
- Run crypto strategies only (no PDT worry)
- Keep paper trading stocks/options in parallel
- Scale up capital as system proves profitable

**Phase 4 (Month 2+): Expand**
- Add stock event trades (Layer 3) if crypto is working
- Consider options plays for high-conviction events
- Increase capital allocation to proven strategies

---

## 7. Risk Warnings

### Things That Will Probably Go Wrong

1. **The bot will lose money at first.** Every algo trader's first bot loses money. Plan for it.
2. **Sentiment signals are noisy.** Most tweets are noise, not signal. Filtering is the hard part.
3. **Crypto volatility cuts both ways.** The same volatility that creates opportunity can wipe you out.
4. **Market conditions change.** A strategy that works in January may fail in March.
5. **Fees eat into profits.** 0.25% per trade means you need >0.5% round-trip just to break even.
6. **Paper trading results won't match live.** Slippage, emotion, and execution differences are real.

### Non-Negotiable Rules

- ❗ **NEVER trade money you can't afford to lose**
- ❗ **ALWAYS use stop losses** — no exceptions
- ❗ **Start with paper trading** — minimum 2 weeks
- ❗ **Start live with minimum capital** — prove the system first
- ❗ **Review every trade** — learn from wins AND losses
- ❗ **Kill switch** — have a way to shut everything down instantly
- ❗ **Daily loss limit** — if down 5% in a day, stop trading for 24 hours

### The Realistic Pitch

With $1,000 and a well-built sentiment + momentum crypto bot:
- **Best realistic outcome (6 months):** +30-50% ($1,300-1,500)
- **Most likely outcome (6 months):** +5-15% ($1,050-1,150)
- **Worst realistic outcome (6 months):** -20-40% ($600-800)

The real value isn't the first $500 in profit — it's building a system that can scale to $10k, $50k, $100k+ once proven.

---

*Document will be updated as we build and test.*
