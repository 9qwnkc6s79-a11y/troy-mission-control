"""
Market Scanner
Scans all watchlist stocks across all strategies for opportunities.
"""

import logging
import time
from datetime import datetime

import config
from strategies import IVCrushStrategy, MeanReversionStrategy, VolArbStrategy, MomentumStrategy
from options_chain import get_vix

logger = logging.getLogger("options_bot.scanner")


class MarketScanner:
    """Scans the market for options trading opportunities across all strategies."""

    def __init__(self):
        self.strategies = []
        if config.IV_CRUSH_ENABLED:
            self.strategies.append(IVCrushStrategy())
        if config.MEAN_REVERSION_ENABLED:
            self.strategies.append(MeanReversionStrategy())
        if config.VOL_ARB_ENABLED:
            self.strategies.append(VolArbStrategy())
        if config.MOMENTUM_ENABLED:
            self.strategies.append(MomentumStrategy())

        logger.info(f"Scanner initialized with {len(self.strategies)} strategies: "
                    f"{[s.name for s in self.strategies]}")

    def full_scan(self) -> list:
        """
        Run full scan across all watchlist stocks and all strategies.
        Returns list of trade signals.
        """
        all_signals = []
        scan_start = time.time()

        # Get VIX for context
        vix = get_vix()
        if vix:
            logger.info(f"📊 VIX: {vix:.2f}")
        else:
            logger.warning("Could not fetch VIX")

        logger.info(f"═══════════════════════════════════════════════")
        logger.info(f"🔍 Starting full market scan at {datetime.now().strftime('%H:%M:%S')}")
        logger.info(f"   Watchlist: {config.WATCHLIST}")
        logger.info(f"   Strategies: {[s.name for s in self.strategies]}")
        logger.info(f"═══════════════════════════════════════════════")

        for ticker in config.WATCHLIST:
            logger.info(f"\n--- Scanning {ticker} ---")
            ticker_signals = []

            for strategy in self.strategies:
                try:
                    signals = strategy.scan(ticker)
                    if signals:
                        ticker_signals.extend(signals)
                        for sig in signals:
                            logger.info(f"  ✅ {strategy.name}: {sig.get('reason', 'signal found')}")
                except Exception as e:
                    logger.error(f"  ❌ Error in {strategy.name} for {ticker}: {e}")

            if not ticker_signals:
                logger.info(f"  No opportunities for {ticker}")

            all_signals.extend(ticker_signals)

            # Small delay between tickers to avoid rate limiting
            time.sleep(0.5)

        elapsed = time.time() - scan_start
        logger.info(f"\n═══════════════════════════════════════════════")
        logger.info(f"🔍 Scan complete in {elapsed:.1f}s")
        logger.info(f"   Total signals found: {len(all_signals)}")
        for sig in all_signals:
            logger.info(f"   📌 {sig['ticker']} - {sig['strategy']} - {sig['trade_type']}")
        logger.info(f"═══════════════════════════════════════════════\n")

        return all_signals

    def rank_signals(self, signals: list) -> list:
        """
        Rank signals by quality/conviction.
        Higher score = better opportunity.
        """
        scored = []
        for sig in signals:
            score = 0

            # Strategy weights
            strategy = sig.get("strategy", "")
            if strategy == "vol_arb":
                score += 30  # Highest confidence — pure math
                z = abs(sig.get("iv_hv_zscore", 0))
                score += min(z * 10, 30)  # Higher z-score = better
            elif strategy == "iv_crush":
                score += 25
                iv_pctile = sig.get("iv_percentile", 0)
                score += min((iv_pctile - 80) * 2, 20)
            elif strategy == "mean_reversion":
                score += 20
                vol_ratio = sig.get("volume_ratio", 1)
                score += min(vol_ratio * 5, 15)
            elif strategy == "momentum":
                score += 15
                vol_ratio = sig.get("volume_ratio", 1)
                score += min(vol_ratio * 3, 10)

            # Risk/reward bonus
            max_risk = sig.get("max_risk", float("inf"))
            if max_risk > 0:
                # Prefer trades with good risk/reward
                credit = sig.get("net_credit_total", 0)
                profit_target = sig.get("profit_target", 0)
                if credit > 0:
                    rr = credit / max_risk
                    score += min(rr * 20, 15)
                elif profit_target > 0:
                    rr = profit_target / max_risk
                    score += min(rr * 10, 15)

            sig["score"] = round(score, 1)
            scored.append(sig)

        # Sort by score descending
        scored.sort(key=lambda x: x.get("score", 0), reverse=True)
        return scored
