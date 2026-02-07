# Crypto Trading Bot 🤖📈

A momentum and mean reversion trading bot for **BTC/USD** and **ETH/USD** on Alpaca paper trading.

## Strategy

### Layer 1: Momentum (RSI + EMA)
- **Buy** when RSI(14) crosses above 30 (oversold bounce) with above-average volume, confirmed by 20-period EMA direction
- **Sell** when RSI(14) crosses below 70 (overbought) with above-average volume

### Layer 2: Mean Reversion (Bollinger Bands)
- **Buy** when price touches lower Bollinger Band (20, 2) and RSI < 35
- **Sell** when price touches upper Bollinger Band and RSI > 65

## Risk Management

| Parameter | Value |
|-----------|-------|
| Max per trade | 20% of portfolio |
| Stop loss | -1.5% from entry |
| Take profit | +2% to +3% |
| Trailing stop | Triggers at +3%, trails to +1% |
| Max concurrent positions | 3 |
| Daily loss circuit breaker | 5% (stops trading for 24h) |

### Position Sizing
- **High confidence** signals: 15% of portfolio
- **Medium confidence**: 10%
- **Low confidence**: 5%

## Quick Start

### Start the bot
```bash
cd /Users/danielkeene/clawd/trading-bot
./start.sh
```

### Check status
```bash
python3 status.py
```

### Watch live logs
```bash
tail -f logs/bot.log
```

### Stop the bot
```bash
./stop.sh
```

## Files

| File | Description |
|------|-------------|
| `bot.py` | Main trading bot (entry point) |
| `config.py` | All configuration and parameters |
| `indicators.py` | Technical analysis (RSI, EMA, Bollinger Bands) |
| `risk_manager.py` | Position sizing, stops, circuit breaker |
| `status.py` | Status display script |
| `start.sh` | Start bot in background |
| `stop.sh` | Stop the bot |
| `logs/bot.log` | Full bot log |
| `logs/trades.json` | Trade history |
| `logs/status.json` | Current status (machine-readable) |
| `logs/bot.pid` | PID file for process management |

## How It Works

1. **Polling loop** runs every 5 seconds
2. Fetches 5-minute bars for BTC/USD and ETH/USD
3. Computes RSI, EMA, and Bollinger Bands
4. Generates buy/sell/hold signals based on strategy layers
5. Checks risk management rules before executing
6. Places market orders via Alpaca API
7. Monitors open positions for stop loss, take profit, and trailing stop
8. Syncs positions with Alpaca every ~1 minute
9. Saves status and trade log continuously

## Circuit Breaker

If the account loses more than 5% in a single day, the bot automatically:
- Stops all new trading
- Waits 24 hours before resuming
- Logs the event

## Phase 2 (Coming Later)
- Sentiment analysis / Twitter monitoring
- Additional crypto pairs
- More sophisticated entry/exit strategies
- Discord/Telegram notifications
