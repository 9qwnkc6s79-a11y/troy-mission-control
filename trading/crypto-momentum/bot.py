#!/usr/bin/env python3
"""
Crypto Trading Bot V2 — Sentiment + Regime-Aware
AI-driven trading with multi-layer signal confirmation.

Architecture:
  Layer 1: Regime Detection (ADX/ATR on 1H/4H)
  Layer 2: Sentiment Analysis (Fear/Greed, News LLM, Trending, Mempool)
  Layer 3: Technical Analysis (RSI, MACD, EMA, BB — adapted to regime)
  Layer 4: Risk Management (3% stops, 6% TP, trailing, anti-churn)
  Layer 5: LLM Trade Conviction (gpt-4o-mini gatekeeper)
"""

import json
import logging
import os
import signal
import sys
import time
from datetime import datetime, timezone, timedelta

import pandas as pd
import numpy as np

from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce
from alpaca.data.historical.crypto import CryptoHistoricalDataClient
from alpaca.data.requests import CryptoBarsRequest
from alpaca.data.timeframe import TimeFrame, TimeFrameUnit

from config import (
    ALPACA_API_KEY, ALPACA_API_SECRET,
    SYMBOLS, BARS_LOOKBACK,
    BOT_LOG_FILE, LOG_DIR,
    MAX_CONCURRENT_POSITIONS,
    REGIME_UPDATE_INTERVAL,
    SENTIMENT_UPDATE_INTERVAL,
    MAIN_LOOP_INTERVAL,
    LLM_MIN_CONVICTION,
)
from indicators import compute_indicators, get_ta_signal
from regime import RegimeTracker, RegimeState
from sentiment import get_sentiment, get_symbol_sentiment, get_sentiment_summary
from strategy import generate_signal
from risk_manager import RiskManager
from llm_analyzer import analyze_trade, get_market_overview

# ═══════════════════════════════════════════════════════════════
# LOGGING
# ═══════════════════════════════════════════════════════════════
os.makedirs(LOG_DIR, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(BOT_LOG_FILE),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════
# SYMBOL MAPPING
# ═══════════════════════════════════════════════════════════════
SYMBOL_TO_ALPACA = {
    "BTC/USD": "BTCUSD",
    "ETH/USD": "ETHUSD",
    "SOL/USD": "SOLUSD",
}
ALPACA_TO_SYMBOL = {v: k for k, v in SYMBOL_TO_ALPACA.items()}


class TradingBotV2:
    def __init__(self):
        self.trading_client = TradingClient(ALPACA_API_KEY, ALPACA_API_SECRET, paper=True)
        self.data_client = CryptoHistoricalDataClient()
        self.risk_manager = RiskManager()
        self.regime_tracker = RegimeTracker()
        self.running = True
        self.loop_count = 0
        self.sentiment_data = None
        self.last_regime_update = 0
        self.last_sentiment_update = 0

        signal.signal(signal.SIGTERM, self._shutdown)
        signal.signal(signal.SIGINT, self._shutdown)

    def _shutdown(self, signum, frame):
        logger.info(f"Received signal {signum}, shutting down gracefully...")
        self.running = False

    # ─── API HELPERS ──────────────────────────────────────────

    def test_connection(self) -> bool:
        """Test API connection and log account info."""
        try:
            account = self.trading_client.get_account()
            logger.info("=" * 65)
            logger.info("🧠 CRYPTO BOT V2 — Sentiment + Regime-Aware")
            logger.info("=" * 65)
            logger.info(f"  Account: {account.id}")
            logger.info(f"  Status: {account.status}")
            logger.info(f"  Equity: ${float(account.equity):,.2f}")
            logger.info(f"  Cash: ${float(account.cash):,.2f}")
            logger.info(f"  Symbols: {', '.join(SYMBOLS)}")
            logger.info(f"  Max Positions: {MAX_CONCURRENT_POSITIONS}")
            logger.info(f"  Stop Loss: 3% | Take Profit: 6% | Trailing: 4%→2%")
            logger.info(f"  Loop Interval: {MAIN_LOOP_INTERVAL}s")
            logger.info(f"  LLM Gatekeeper: conviction >= {LLM_MIN_CONVICTION}")
            logger.info("=" * 65)
            self.risk_manager.set_starting_equity(float(account.equity))
            return True
        except Exception as e:
            logger.error(f"API connection failed: {e}")
            return False

    def get_account_equity(self) -> float:
        try:
            return float(self.trading_client.get_account().equity)
        except Exception as e:
            logger.error(f"Failed to get equity: {e}")
            return 0.0

    def get_account_cash(self) -> float:
        try:
            return float(self.trading_client.get_account().cash)
        except Exception as e:
            logger.error(f"Failed to get cash: {e}")
            return 0.0

    def fetch_bars(self, symbol: str, timeframe: TimeFrame, limit: int = None) -> pd.DataFrame:
        """Fetch historical bars for a crypto symbol."""
        try:
            limit = limit or BARS_LOOKBACK
            end = datetime.now(timezone.utc)

            if timeframe.unit == TimeFrameUnit.Minute:
                start = end - timedelta(minutes=limit * timeframe.amount + 60)
            elif timeframe.unit == TimeFrameUnit.Hour:
                start = end - timedelta(hours=limit * timeframe.amount + 4)
            else:
                start = end - timedelta(days=limit + 2)

            request = CryptoBarsRequest(
                symbol_or_symbols=symbol,
                timeframe=timeframe,
                start=start,
                end=end,
                limit=limit,
            )
            bars = self.data_client.get_crypto_bars(request)

            if not bars or not hasattr(bars, 'data') or symbol not in bars.data:
                return pd.DataFrame()

            data = [{
                "timestamp": bar.timestamp,
                "open": float(bar.open),
                "high": float(bar.high),
                "low": float(bar.low),
                "close": float(bar.close),
                "volume": float(bar.volume),
            } for bar in bars.data[symbol]]

            df = pd.DataFrame(data)
            if not df.empty:
                df = df.sort_values("timestamp").reset_index(drop=True)
            return df

        except Exception as e:
            logger.error(f"Failed to fetch bars for {symbol}: {e}")
            return pd.DataFrame()

    def place_order(self, symbol: str, qty: float, side: str) -> bool:
        """Place a market order."""
        try:
            alpaca_symbol = SYMBOL_TO_ALPACA.get(symbol, symbol.replace("/", ""))

            # Round qty by asset
            if "BTC" in symbol:
                qty = round(qty, 6)
            elif "ETH" in symbol:
                qty = round(qty, 4)
            elif "SOL" in symbol:
                qty = round(qty, 3)
            else:
                qty = round(qty, 4)

            if qty <= 0:
                logger.warning(f"Qty is 0 for {symbol}, skipping")
                return False

            order = self.trading_client.submit_order(MarketOrderRequest(
                symbol=alpaca_symbol,
                qty=qty,
                side=OrderSide.BUY if side == "buy" else OrderSide.SELL,
                time_in_force=TimeInForce.GTC,
            ))
            logger.info(f"✅ Order: {side.upper()} {qty} {symbol} (order_id={order.id})")
            return True

        except Exception as e:
            logger.error(f"❌ Order failed {symbol}: {e}")
            return False

    def close_alpaca_position(self, symbol: str) -> bool:
        """Close a position on Alpaca."""
        try:
            alpaca_symbol = SYMBOL_TO_ALPACA.get(symbol, symbol.replace("/", ""))
            self.trading_client.close_position(alpaca_symbol)
            logger.info(f"✅ Closed: {symbol}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to close {symbol}: {e}")
            return False

    def sync_positions(self):
        """Sync tracked positions with Alpaca."""
        try:
            alpaca_positions = self.trading_client.get_all_positions()
            alpaca_symbols = set()

            for pos in alpaca_positions:
                sym = ALPACA_TO_SYMBOL.get(pos.symbol, pos.symbol)
                alpaca_symbols.add(sym)

                if sym not in self.risk_manager.positions:
                    entry = float(pos.avg_entry_price)
                    qty = abs(float(pos.qty))
                    side = "buy" if float(pos.qty) > 0 else "sell"
                    logger.info(f"Syncing: {sym} {side} {qty} @ ${entry:,.2f}")
                    self.risk_manager.open_position(sym, entry, qty, side, "medium", "synced")

            for sym in list(self.risk_manager.positions.keys()):
                if sym not in alpaca_symbols:
                    logger.info(f"Removing stale position: {sym}")
                    del self.risk_manager.positions[sym]

        except Exception as e:
            logger.error(f"Position sync failed: {e}")

    # ─── LAYER UPDATES ────────────────────────────────────────

    def update_regimes(self):
        """Update regime detection for all symbols using 1H and 4H bars."""
        logger.info("🔄 Updating market regimes...")

        for symbol in SYMBOLS:
            try:
                df_1h = self.fetch_bars(symbol, TimeFrame(1, TimeFrameUnit.Hour), BARS_LOOKBACK)
                df_4h = self.fetch_bars(symbol, TimeFrame(4, TimeFrameUnit.Hour), 50)

                if df_1h.empty:
                    logger.warning(f"  [{symbol}] No 1H data for regime")
                    continue

                regime = self.regime_tracker.update(
                    symbol,
                    df_1h,
                    df_4h if not df_4h.empty else None,
                )
                logger.info(f"  [{symbol}] {regime.description}")

            except Exception as e:
                logger.error(f"  [{symbol}] Regime update failed: {e}")

        self.last_regime_update = time.time()

    def update_sentiment(self):
        """Update sentiment from all sources."""
        try:
            self.sentiment_data = get_sentiment(force_refresh=True)
            logger.info("📊 SENTIMENT UPDATE:")
            logger.info(get_sentiment_summary(self.sentiment_data))
            self.last_sentiment_update = time.time()
        except Exception as e:
            logger.warning(f"Sentiment update failed: {e}")
            self.sentiment_data = self.sentiment_data or {
                "global_score": 0, "per_symbol": {}, "fear_greed": {"value": 50},
                "headlines": [],
            }

    # ─── MAIN TRADING LOGIC ──────────────────────────────────

    def evaluate_symbol(self, symbol: str):
        """
        Full multi-layer evaluation for one symbol.
        Regime → Sentiment → TA → Strategy → LLM → Execute
        """
        # Get current regime
        regime = self.regime_tracker.get(symbol)

        # Check existing positions first
        if symbol in self.risk_manager.positions:
            self._manage_existing_position(symbol)
            return

        # Get regime's preferred strategy
        if not regime.tradeable:
            if self.loop_count % 5 == 0:
                logger.info(f"[{symbol}] 🚫 {regime.description}")
            return

        # Fetch 15-min bars for TA
        df_15m = self.fetch_bars(symbol, TimeFrame(15, TimeFrameUnit.Minute), BARS_LOOKBACK)
        if df_15m.empty:
            return

        # Compute indicators
        df_15m = compute_indicators(df_15m)
        if df_15m.empty:
            return

        current_price = df_15m.iloc[-1]["close"]

        # Get TA signal adapted to regime
        ta_signal = get_ta_signal(df_15m, regime.preferred_strategy)

        # Get sentiment score
        sym_sentiment = get_symbol_sentiment(symbol, self.sentiment_data) if self.sentiment_data else 0.0
        fg_value = self.sentiment_data.get("fear_greed", {}).get("value", 50) if self.sentiment_data else 50

        # Generate multi-layer signal
        trade_signal = generate_signal(
            symbol=symbol,
            regime=regime,
            sentiment_score=sym_sentiment,
            fear_greed_value=fg_value,
            ta_signal=ta_signal,
        )

        # Log analysis every few loops or on signal
        if self.loop_count % 5 == 0 or trade_signal.action != "hold":
            logger.info(f"[{symbol}] @ ${current_price:,.2f} | Regime: {regime.state.value} | "
                       f"Sentiment: {sym_sentiment:+.3f} | TA: {ta_signal['action']} | "
                       f"Signal: {trade_signal.action} ({trade_signal.confidence}) | "
                       f"Layers: {trade_signal.layers_agreeing}/3")

        if trade_signal.action == "hold" or not trade_signal.tradeable:
            return

        # ── RISK CHECK ──
        can_trade, block_reason = self.risk_manager.can_open_position(symbol)
        if not can_trade:
            logger.info(f"[{symbol}] ⛔ Blocked: {block_reason}")
            return

        # ── LLM GATEKEEPER (Layer 5) ──
        logger.info(f"[{symbol}] 🤖 Requesting LLM trade analysis...")
        llm_result = analyze_trade(
            symbol=symbol,
            action=trade_signal.action,
            confidence=trade_signal.confidence,
            price=current_price,
            regime_description=regime.description,
            sentiment_score=sym_sentiment,
            fear_greed_value=fg_value,
            recent_headlines=self.sentiment_data.get("headlines", []) if self.sentiment_data else [],
            ta_details=ta_signal.get("ta_details", {}),
            ta_reason=ta_signal.get("reason", ""),
        )

        if not llm_result["approved"]:
            logger.info(f"[{symbol}] ❌ LLM REJECTED (conviction={llm_result['conviction']}/10): {llm_result['reasoning'][:100]}")
            return

        logger.info(f"[{symbol}] ✅ LLM APPROVED (conviction={llm_result['conviction']}/10): {llm_result['reasoning'][:100]}")

        # ── EXECUTE TRADE ──
        equity = self.get_account_equity()
        qty = self.risk_manager.calculate_position_size(equity, trade_signal.confidence, current_price)

        if qty <= 0:
            logger.warning(f"[{symbol}] Position size is 0, skipping")
            return

        dollar_value = qty * current_price
        logger.info(f"[{symbol}] 📊 Size: {qty} units = ${dollar_value:,.2f} ({trade_signal.confidence})")

        if trade_signal.action == "buy":
            if self.place_order(symbol, qty, "buy"):
                reason = f"V2: {trade_signal.reason} | LLM={llm_result['conviction']}/10"
                self.risk_manager.open_position(
                    symbol, current_price, qty, "buy",
                    trade_signal.confidence, reason, llm_result["conviction"],
                )
                pos = self.risk_manager.positions[symbol]
                logger.info(f"[{symbol}] 🟢 OPENED LONG: {qty} @ ${current_price:,.2f}")
                logger.info(f"  SL: ${pos['stop_loss']:,.2f} | TP: ${pos['take_profit']:,.2f}")
                logger.info(f"  Positions: {len(self.risk_manager.positions)}/{MAX_CONCURRENT_POSITIONS}")

        elif trade_signal.action == "sell":
            # For crypto on Alpaca, "sell" means close existing long
            if symbol in self.risk_manager.positions:
                if self.close_alpaca_position(symbol):
                    pnl = self.risk_manager.close_position(symbol, current_price, trade_signal.reason)
                    emoji = "💰" if pnl >= 0 else "💸"
                    logger.info(f"[{symbol}] {emoji} Closed. P&L: ${pnl:,.2f}")

    def _manage_existing_position(self, symbol: str):
        """Manage stop loss, take profit, trailing stop for existing position."""
        # Get current price from 15-min bars
        df = self.fetch_bars(symbol, TimeFrame(15, TimeFrameUnit.Minute), 5)
        if df.empty:
            return

        current_price = float(df.iloc[-1]["close"])
        result = self.risk_manager.update_trailing_stop(symbol, current_price)

        if result["action"] in ("stop_hit", "take_profit"):
            logger.info(f"[{symbol}] 🎯 {result['reason']}")
            if self.close_alpaca_position(symbol):
                pnl = self.risk_manager.close_position(symbol, current_price, result["reason"])
                emoji = "💰" if pnl >= 0 else "💸"
                logger.info(f"[{symbol}] {emoji} Closed. P&L: ${pnl:,.2f}")
        elif result["action"] == "update":
            logger.info(f"[{symbol}] 📈 {result['reason']}")

    # ─── MAIN LOOP ────────────────────────────────────────────

    def run(self):
        """Main trading loop."""
        logger.info("🧠 Starting V2 trading loop...")
        logger.info(f"  Symbols: {', '.join(SYMBOLS)}")
        logger.info(f"  Loop interval: {MAIN_LOOP_INTERVAL}s")
        logger.info(f"  Regime update: every {REGIME_UPDATE_INTERVAL}s")
        logger.info(f"  Sentiment update: every {SENTIMENT_UPDATE_INTERVAL}s")

        # Initial updates
        self.update_sentiment()
        self.update_regimes()

        while self.running:
            try:
                self.loop_count += 1
                now = time.time()

                # Update regime every 15 min
                if (now - self.last_regime_update) >= REGIME_UPDATE_INTERVAL:
                    self.update_regimes()

                # Update sentiment every 15 min
                if (now - self.last_sentiment_update) >= SENTIMENT_UPDATE_INTERVAL:
                    self.update_sentiment()

                # Check circuit breaker
                equity = self.get_account_equity()
                cash = self.get_account_cash()

                if self.risk_manager.check_circuit_breaker(equity):
                    logger.warning("⚠️ CIRCUIT BREAKER! Daily loss exceeded 3%")
                    logger.warning(f"Trading paused until {self.risk_manager.circuit_breaker_until}")

                if self.risk_manager.is_circuit_breaker_active():
                    if self.loop_count % 10 == 0:
                        logger.info("⏸️ Circuit breaker active, waiting...")
                    self.risk_manager.save_status(equity, cash)
                    time.sleep(MAIN_LOOP_INTERVAL)
                    continue

                # Sync positions every 5 loops (~5 min)
                if self.loop_count % 5 == 0:
                    self.sync_positions()

                # Evaluate each symbol
                for symbol in SYMBOLS:
                    if not self.running:
                        break
                    try:
                        self.evaluate_symbol(symbol)
                    except Exception as e:
                        logger.error(f"Error evaluating {symbol}: {e}", exc_info=True)

                # Save status
                self.risk_manager.save_status(equity, cash)

                # Periodic status log
                if self.loop_count % 15 == 0:
                    logger.info(f"📊 STATUS | Equity: ${equity:,.2f} | Cash: ${cash:,.2f} | "
                              f"Positions: {len(self.risk_manager.positions)}/{MAX_CONCURRENT_POSITIONS} | "
                              f"Daily P&L: ${self.risk_manager.daily_pnl:,.2f} | "
                              f"Trades today: {self.risk_manager.daily_trade_count}")
                    logger.info(f"  Regimes:\n{self.regime_tracker.summary()}")

                time.sleep(MAIN_LOOP_INTERVAL)

            except KeyboardInterrupt:
                logger.info("Keyboard interrupt")
                self.running = False
            except Exception as e:
                logger.error(f"Main loop error: {e}", exc_info=True)
                time.sleep(30)

        logger.info("Bot stopped.")
        self.risk_manager.save_trade_log()


def main():
    logger.info("=" * 65)
    logger.info("🧠 CRYPTO BOT V2 — Sentiment + Regime + LLM Gatekeeper")
    logger.info(f"  Time: {datetime.now(timezone.utc).isoformat()}")
    logger.info(f"  Symbols: {', '.join(SYMBOLS)}")
    logger.info(f"  Architecture: Regime → Sentiment → TA → Strategy → LLM → Execute")
    logger.info(f"  Risk: 3% SL, 6% TP, 4%→2% trailing, 3% daily limit")
    logger.info(f"  Anti-churn: 30min cooldown, max 10 trades/day")
    logger.info("=" * 65)

    bot = TradingBotV2()

    if not bot.test_connection():
        logger.error("Failed to connect. Exiting.")
        sys.exit(1)

    bot.sync_positions()

    with open("logs/bot.pid", "w") as f:
        f.write(str(os.getpid()))

    bot.run()


if __name__ == "__main__":
    main()
