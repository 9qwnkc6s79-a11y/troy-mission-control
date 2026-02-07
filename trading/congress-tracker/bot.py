"""
Congress Trading Bot - Main Loop
Monitors congressional stock trade disclosures and mirrors them on Alpaca.
"""

import json
import os
import sys
import time
import signal
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Set

import alpaca_trade_api as tradeapi
from alpaca_trade_api.rest import APIError

import config
from congress_scraper import get_recent_trades
from scorer import score_trade, calculate_position_size, should_trade
from risk_manager import RiskManager

# Import event engine for cross-signal confirmation
sys.path.insert(0, config.EVENT_ENGINE_DIR)
try:
    from aggregator import check_ticker_signals, get_high_conviction_signals
    from news_analyzer import fetch_news_for_ticker, analyze_headlines_with_openai, aggregate_ticker_sentiment
    from sec_scanner import scan_insider_activity
    EVENT_ENGINE_AVAILABLE = True
except ImportError as e:
    EVENT_ENGINE_AVAILABLE = False
    print(f"Warning: Event engine not available: {e}")

# Setup logging
os.makedirs(config.LOG_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(name)s | %(levelname)s | %(message)s',
    handlers=[
        logging.FileHandler(config.LOG_FILE),
        logging.StreamHandler(sys.stdout),
    ]
)
logger = logging.getLogger("congress_bot")

# Global flag for graceful shutdown
running = True


def signal_handler(signum, frame):
    global running
    logger.info(f"Received signal {signum}, shutting down gracefully...")
    running = False


signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)


class CongressBot:
    def __init__(self):
        logger.info("=" * 60)
        logger.info("CONGRESS TRADING BOT - Initializing")
        logger.info("=" * 60)
        
        # Initialize Alpaca
        self.api = tradeapi.REST(
            config.ALPACA_API_KEY,
            config.ALPACA_API_SECRET,
            config.ALPACA_BASE_URL,
            api_version='v2'
        )
        
        # Verify connection
        account = self.api.get_account()
        logger.info(f"Connected to Alpaca | Account: {account.id}")
        logger.info(f"Portfolio Value: ${float(account.portfolio_value):,.2f}")
        logger.info(f"Buying Power: ${float(account.buying_power):,.2f}")
        logger.info(f"Bot Allocation: ${config.TOTAL_ALLOCATION:,.2f}")
        
        # Initialize risk manager
        self.risk_manager = RiskManager(self.api)
        
        # Load seen transactions
        self.seen_tx_ids = self._load_state()
        
        self.first_run = len(self.seen_tx_ids) == 0
        if self.first_run:
            logger.info("*** FIRST RUN - Will scan all recent filings ***")
        
        # Event engine cache
        self._insider_signals = []
        self._last_insider_scan = None
    
    def _load_state(self) -> Set[str]:
        """Load previously seen transaction IDs."""
        if os.path.exists(config.STATE_FILE):
            try:
                with open(config.STATE_FILE, 'r') as f:
                    data = json.load(f)
                    return set(data.get("seen_tx_ids", []))
            except (json.JSONDecodeError, IOError):
                pass
        return set()
    
    def _save_state(self):
        """Save seen transaction IDs."""
        with open(config.STATE_FILE, 'w') as f:
            json.dump({
                "seen_tx_ids": list(self.seen_tx_ids),
                "last_updated": datetime.now(timezone.utc).isoformat(),
            }, f)
    
    def run(self):
        """Main bot loop."""
        global running
        
        logger.info("Starting main loop...")
        
        while running:
            try:
                self.cycle()
            except Exception as e:
                logger.error(f"Error in main cycle: {e}", exc_info=True)
            
            if running:
                logger.info(f"Sleeping {config.POLL_INTERVAL_SECONDS}s until next cycle...")
                # Sleep in small increments so we can catch shutdown signals
                for _ in range(config.POLL_INTERVAL_SECONDS):
                    if not running:
                        break
                    time.sleep(1)
        
        logger.info("Bot stopped.")
    
    def check_news_confirmation(self, ticker: str) -> Dict:
        """Check recent news for a ticker to confirm or deny a signal."""
        if not EVENT_ENGINE_AVAILABLE:
            return {"confirmed": False, "reason": "event engine unavailable"}
        
        try:
            articles = fetch_news_for_ticker(ticker, limit=10)
            if not articles:
                return {"confirmed": False, "reason": "no recent news", "sentiment": "neutral"}
            
            analyzed = analyze_headlines_with_openai(articles)
            sentiments = aggregate_ticker_sentiment(analyzed)
            ticker_data = sentiments.get(ticker.upper())
            
            if ticker_data:
                return {
                    "confirmed": ticker_data["direction"] != "bearish",
                    "sentiment": ticker_data["direction"],
                    "net_score": ticker_data["net_sentiment"],
                    "article_count": ticker_data["article_count"],
                    "reason": (
                        f"News sentiment: {ticker_data['direction']} "
                        f"(score: {ticker_data['net_sentiment']:.0f}, "
                        f"{ticker_data['article_count']} articles)"
                    ),
                }
            
            return {"confirmed": True, "reason": "no sentiment data", "sentiment": "neutral"}
            
        except Exception as e:
            logger.debug(f"News confirmation error for {ticker}: {e}")
            return {"confirmed": True, "reason": f"error: {e}", "sentiment": "unknown"}
    
    def check_insider_overlap(self, ticker: str) -> Dict:
        """
        Check if corporate insiders are also buying this stock.
        Congress + insider buying = very high conviction signal.
        """
        if not EVENT_ENGINE_AVAILABLE:
            return {"overlap": False, "reason": "event engine unavailable"}
        
        try:
            # Refresh insider signals every 2 hours
            now = datetime.now(timezone.utc)
            if (self._last_insider_scan is None or 
                (now - self._last_insider_scan).total_seconds() > 7200):
                logger.info("Refreshing SEC insider activity scan...")
                self._insider_signals = scan_insider_activity(days_back=14)
                self._last_insider_scan = now
            
            # Check if ticker matches any insider signals
            for signal in self._insider_signals:
                if signal.get("ticker", "").upper() == ticker.upper():
                    return {
                        "overlap": True,
                        "signal": signal,
                        "conviction_boost": 20,
                        "reason": (
                            f"INSIDER OVERLAP: {signal.get('num_insiders', 0)} corporate insiders "
                            f"also buying {ticker} (${signal.get('total_value', 0):,.0f})"
                        ),
                    }
            
            return {"overlap": False, "reason": "no insider overlap"}
            
        except Exception as e:
            logger.debug(f"Insider overlap check error for {ticker}: {e}")
            return {"overlap": False, "reason": f"error: {e}"}
    
    def cycle(self):
        """Single polling cycle: fetch, score, trade, manage."""
        logger.info("-" * 40)
        logger.info(f"Cycle starting at {datetime.now(timezone.utc).isoformat()}")
        
        # 1. Check market hours
        clock = self.api.get_clock()
        market_open = clock.is_open
        logger.info(f"Market is {'OPEN' if market_open else 'CLOSED'}")
        
        # 2. Fetch new trades
        pages = 5 if self.first_run else 2
        trades = get_recent_trades(pages=pages)
        logger.info(f"Fetched {len(trades)} trades from Capitol Trades")
        
        # 3. Filter to new trades only
        new_trades = []
        for trade in trades:
            tx_id = trade.get("tx_id", "")
            if tx_id and tx_id not in self.seen_tx_ids:
                new_trades.append(trade)
                self.seen_tx_ids.add(tx_id)
        
        logger.info(f"New unseen trades: {len(new_trades)}")
        
        # 4. Log ALL found trades on first run
        if self.first_run and trades:
            logger.info("=== FIRST RUN: All Recent Congressional Trades ===")
            for t in trades:
                logger.info(
                    f"  {t['politician_name']:20s} | {t['tx_type'].upper():4s} | "
                    f"{t['ticker']:6s} | ${t['value']:>10,} | {t['tx_date']} | "
                    f"pub: {t['pub_date'][:10] if t['pub_date'] else 'N/A'}"
                )
            logger.info("=" * 60)
        
        # 5. Score and filter trades (with event engine confirmation)
        actionable_trades = []
        for trade in new_trades:
            scored = score_trade(trade)
            
            logger.info(
                f"Scored: {scored['politician_name']:20s} | {scored['tx_type'].upper():4s} | "
                f"{scored['ticker']:6s} | ${scored['value']:>10,} | "
                f"Score: {scored['score']}/100 | "
                f"Trade: {'YES' if should_trade(scored) else 'NO'}"
            )
            
            if should_trade(scored):
                # On first run, only trade filings published in last N days
                if self.first_run:
                    pub_dt = scored.get("pub_datetime")
                    cutoff = datetime.now(timezone.utc) - timedelta(days=config.FIRST_RUN_LOOKBACK_DAYS)
                    if pub_dt and pub_dt < cutoff:
                        logger.info(f"  -> Skipping (too old for first run: {scored['pub_date'][:10]})")
                        continue
                
                # Event engine: check insider overlap (congress + insider = gold)
                if EVENT_ENGINE_AVAILABLE and scored['tx_type'] == 'buy':
                    insider_check = self.check_insider_overlap(scored['ticker'])
                    if insider_check.get("overlap"):
                        scored['score'] = min(scored['score'] + insider_check['conviction_boost'], 100)
                        scored['insider_overlap'] = True
                        logger.info(f"  🔥 {insider_check['reason']}")
                        logger.info(f"  -> Score boosted to {scored['score']}/100")
                    
                    # Check news confirmation
                    news_check = self.check_news_confirmation(scored['ticker'])
                    scored['news_sentiment'] = news_check.get('sentiment', 'unknown')
                    if news_check.get('confirmed') is False and news_check.get('sentiment') == 'bearish':
                        logger.info(f"  ⚠️ Bearish news for {scored['ticker']}: {news_check.get('reason')}")
                        scored['score'] = max(scored['score'] - 10, 0)
                    elif news_check.get('sentiment') == 'bullish':
                        scored['score'] = min(scored['score'] + 5, 100)
                        logger.info(f"  ✅ News confirms bullish: {news_check.get('reason')}")
                
                actionable_trades.append(scored)
        
        logger.info(f"Actionable trades: {len(actionable_trades)}")
        
        # 5b. Check event engine for standalone high-conviction signals
        if EVENT_ENGINE_AVAILABLE and not self.first_run:
            try:
                event_signals = get_high_conviction_signals(min_score=70)
                for sig in event_signals[:5]:  # Top 5 only
                    ticker = sig.get("ticker", "")
                    direction = sig.get("direction", "")
                    if direction == "bullish" and ticker:
                        # Check if we already have this from congress trades
                        already_in = any(t["ticker"] == ticker for t in actionable_trades)
                        if not already_in:
                            logger.info(
                                f"  📡 Event engine signal: {ticker} {direction} "
                                f"(score: {sig['conviction']}, sources: {sig.get('num_sources', 0)})"
                            )
                            # Add as a synthetic trade
                            actionable_trades.append({
                                "ticker": ticker,
                                "tx_type": "buy",
                                "tx_id": f"event_{ticker}_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M')}",
                                "politician_name": "EVENT ENGINE",
                                "value": 100000,
                                "score": sig["conviction"],
                                "is_high_alpha": False,
                                "event_engine_signal": True,
                                "source_types": sig.get("source_types", []),
                            })
            except Exception as e:
                logger.debug(f"Event engine signal check error: {e}")
        
        # 6. Execute trades
        if market_open and actionable_trades:
            for trade in actionable_trades:
                try:
                    self.execute_trade(trade)
                except Exception as e:
                    logger.error(f"Failed to execute trade for {trade['ticker']}: {e}")
        elif actionable_trades and not market_open:
            logger.info("Market closed - queuing trades for next open")
            for trade in actionable_trades:
                logger.info(f"  Queued: {trade['tx_type'].upper()} {trade['ticker']} (score: {trade['score']})")
        
        # 7. Check exit conditions for active positions
        if market_open:
            self.check_exits()
        
        # 8. Log portfolio status
        self.log_status()
        
        # 9. Save state
        self._save_state()
        
        if self.first_run:
            self.first_run = False
            logger.info("First run complete. Future cycles will only process new filings.")
    
    def execute_trade(self, trade: Dict):
        """Execute a trade on Alpaca."""
        ticker = trade["ticker"]
        tx_type = trade["tx_type"]
        tx_id = trade["tx_id"]
        
        # Check if we already have a position in this ticker
        existing = self.risk_manager.get_position_for_ticker(ticker)
        if existing:
            logger.info(f"Already have position in {ticker}, skipping")
            return
        
        # Calculate position size
        available = self.risk_manager.get_available_capital()
        if available < config.MIN_POSITION_SIZE:
            logger.warning(f"Insufficient capital: ${available:.2f} available")
            return
        
        position_dollars = calculate_position_size(trade, available)
        
        if position_dollars < config.MIN_POSITION_SIZE:
            logger.info(f"Position size too small: ${position_dollars:.2f}")
            return
        
        logger.info(
            f"Executing: {tx_type.upper()} ${position_dollars:,.2f} of {ticker} "
            f"(politician: {trade['politician_name']}, score: {trade['score']})"
        )
        
        try:
            if tx_type == "buy":
                order = self.api.submit_order(
                    symbol=ticker,
                    notional=str(round(position_dollars, 2)),
                    side="buy",
                    type="market",
                    time_in_force="day",
                )
            elif tx_type == "sell":
                # Check if we hold this stock
                try:
                    position = self.api.get_position(ticker)
                    # Sell what we have
                    qty = float(position.qty)
                    order = self.api.submit_order(
                        symbol=ticker,
                        qty=str(qty),
                        side="sell",
                        type="market",
                        time_in_force="day",
                    )
                except APIError:
                    logger.info(f"No position in {ticker} to sell, skipping sell signal")
                    return
            
            logger.info(f"Order submitted: {order.id} | {order.side} {order.symbol}")
            
            # Wait a moment and check fill
            time.sleep(2)
            filled_order = self.api.get_order(order.id)
            
            if filled_order.status == "filled":
                avg_price = float(filled_order.filled_avg_price)
                qty = float(filled_order.filled_qty)
                
                self.risk_manager.record_trade(
                    tx_id=tx_id,
                    ticker=ticker,
                    side=tx_type,
                    qty=qty,
                    avg_price=avg_price,
                    politician=trade["politician_name"],
                    score=trade["score"],
                    is_high_alpha=trade.get("is_high_alpha", False),
                )
                
                logger.info(
                    f"FILLED: {tx_type.upper()} {qty} {ticker} @ ${avg_price:.2f} "
                    f"(total: ${qty * avg_price:,.2f})"
                )
            else:
                logger.info(f"Order {order.id} status: {filled_order.status} (may fill later)")
                
                # Record with estimated values
                try:
                    quote = self.api.get_latest_quote(ticker)
                    est_price = (quote.ask_price + quote.bid_price) / 2 if quote.ask_price and quote.bid_price else quote.ask_price or 100
                    est_qty = position_dollars / est_price
                    
                    self.risk_manager.record_trade(
                        tx_id=tx_id,
                        ticker=ticker,
                        side=tx_type,
                        qty=est_qty,
                        avg_price=est_price,
                        politician=trade["politician_name"],
                        score=trade["score"],
                        is_high_alpha=trade.get("is_high_alpha", False),
                    )
                except Exception as e:
                    logger.error(f"Could not estimate fill for {ticker}: {e}")
                
        except APIError as e:
            logger.error(f"Alpaca API error for {ticker}: {e}")
        except Exception as e:
            logger.error(f"Error executing trade for {ticker}: {e}")
    
    def check_exits(self):
        """Check and execute any exit orders."""
        exits = self.risk_manager.check_exits()
        
        for exit_info in exits:
            try:
                ticker = exit_info["ticker"]
                logger.info(
                    f"EXIT SIGNAL: {ticker} | Reason: {exit_info['reason']} | "
                    f"P&L: ${exit_info['pnl']:.2f} ({exit_info['pnl_pct']:.1f}%)"
                )
                
                # Submit exit order
                try:
                    position = self.api.get_position(ticker)
                    qty = abs(float(position.qty))
                    side = "sell" if float(position.qty) > 0 else "buy"
                    
                    order = self.api.submit_order(
                        symbol=ticker,
                        qty=str(qty),
                        side=side,
                        type="market",
                        time_in_force="day",
                    )
                    
                    logger.info(f"Exit order submitted: {order.id}")
                    
                    # Record close
                    self.risk_manager.close_trade(
                        exit_info["tx_id"],
                        exit_info["exit_price"],
                        exit_info["reason"],
                    )
                    
                except APIError as e:
                    logger.error(f"Could not close position {ticker}: {e}")
                    # Still record the close in our DB
                    self.risk_manager.close_trade(
                        exit_info["tx_id"],
                        exit_info["exit_price"],
                        exit_info["reason"],
                    )
                    
            except Exception as e:
                logger.error(f"Error processing exit for {exit_info.get('ticker')}: {e}")
    
    def log_status(self):
        """Log current portfolio status."""
        deployed = self.risk_manager.get_deployed_capital()
        available = self.risk_manager.get_available_capital()
        active = self.risk_manager.get_active_positions()
        stats = self.risk_manager.get_stats()
        
        logger.info(f"--- Portfolio Status ---")
        logger.info(f"Allocation: ${config.TOTAL_ALLOCATION:,.2f}")
        logger.info(f"Deployed:   ${deployed:,.2f}")
        logger.info(f"Available:  ${available:,.2f}")
        logger.info(f"Active Positions: {len(active)}")
        
        for tx_id, pos in active.items():
            logger.info(
                f"  {pos['ticker']:6s} | {pos['side']:4s} | "
                f"qty: {pos['qty']:.2f} | entry: ${pos['entry_price']:.2f} | "
                f"pol: {pos['politician']}"
            )
        
        if stats:
            logger.info(f"--- Stats ---")
            logger.info(f"Total Closed: {stats.get('total_trades', 0)}")
            logger.info(f"Win Rate: {stats.get('win_rate', 0):.1f}%")
            logger.info(f"Total P&L: ${stats.get('total_pnl', 0):.2f}")


def main():
    """Entry point."""
    try:
        bot = CongressBot()
        bot.run()
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt, shutting down...")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
