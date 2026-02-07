"""
Market Regime Awareness
VIX-based regime detection for strategy selection and risk management.
"""

import logging
from typing import Optional
from options_chain import get_vix, get_stock_history

import config

logger = logging.getLogger("options_bot.regime")


class MarketRegime:
    """Detects current market regime from VIX and adjusts strategy preferences."""

    def __init__(self):
        self.current_vix = None
        self.prev_vix = None
        self.regime = "normal"  # low_vol, normal, high_vol, vix_spike
        self.vix_trend = "stable"  # rising, falling, stable

    def update(self) -> dict:
        """
        Refresh VIX data and determine the current regime.
        Returns regime info dict.
        """
        vix = get_vix()
        if vix is None:
            logger.warning("Could not fetch VIX — using 'normal' regime")
            return self._build_info()

        self.prev_vix = self.current_vix
        self.current_vix = vix

        # Determine regime
        if vix > config.VIX_HIGH:
            self.regime = "high_vol"
        elif vix < config.VIX_LOW:
            self.regime = "low_vol"
        else:
            self.regime = "normal"

        # Check for VIX spike
        if self.prev_vix and self.prev_vix > 0:
            vix_change = (vix - self.prev_vix) / self.prev_vix
            if vix_change >= config.VIX_SPIKE_PCT:
                self.regime = "vix_spike"
                self.vix_trend = "spiking"
            elif vix_change > 0.05:
                self.vix_trend = "rising"
            elif vix_change < -0.05:
                self.vix_trend = "falling"
            else:
                self.vix_trend = "stable"

        # Also check VIX 5-day trend
        try:
            vix_hist = get_stock_history("^VIX", period="5d")
            if not vix_hist.empty and len(vix_hist) >= 2:
                vix_5d_change = (vix_hist["Close"].iloc[-1] - vix_hist["Close"].iloc[0]) / vix_hist["Close"].iloc[0]
                if vix_5d_change > 0.15:
                    self.vix_trend = "rising"
                elif vix_5d_change < -0.15:
                    self.vix_trend = "falling"
        except Exception:
            pass

        info = self._build_info()
        logger.info(f"📊 Regime: {self.regime} | VIX: {vix:.1f} | Trend: {self.vix_trend}")
        return info

    def _build_info(self) -> dict:
        return {
            "regime": self.regime,
            "vix": self.current_vix,
            "vix_trend": self.vix_trend,
            "favor_selling": self.regime in ("high_vol", "normal"),
            "favor_buying": self.regime == "low_vol",
            "should_wait": self.regime == "vix_spike",
        }

    def should_skip_entry(self) -> tuple:
        """
        Returns (should_skip: bool, reason: str).
        During VIX spikes, we wait for volatility to settle.
        """
        if self.regime == "vix_spike":
            return True, f"VIX spike detected ({self.current_vix:.1f}), waiting for settlement"
        return False, "OK"

    def adjust_strategy_score(self, signal: dict) -> dict:
        """
        Adjust signal score based on regime.
        - High VIX → boost premium-selling strategies (iron condors, credit spreads)
        - Low VIX → boost premium-buying strategies (straddles, debit spreads)
        """
        score_adj = 0
        strategy = signal.get("strategy", "")
        trade_type = signal.get("trade_type", "")

        if self.regime == "high_vol":
            # Favor selling premium
            if trade_type in ("iron_condor",) or "credit" in trade_type:
                score_adj = 15
                signal["regime_note"] = "High VIX favors premium selling"
            elif trade_type in ("long_strangle", "long_call", "long_put"):
                score_adj = -10
                signal["regime_note"] = "High VIX penalizes premium buying"
            elif trade_type in ("bull_call_spread", "bear_put_spread"):
                score_adj = 5  # Spreads are OK in high vol
                signal["regime_note"] = "Spreads OK in high VIX"
        
        elif self.regime == "low_vol":
            # Favor buying premium
            if trade_type in ("long_strangle", "long_call", "long_put"):
                score_adj = 10
                signal["regime_note"] = "Low VIX favors premium buying"
            elif trade_type in ("iron_condor",) or "credit" in trade_type:
                score_adj = -10
                signal["regime_note"] = "Low VIX penalizes premium selling (less to collect)"
            elif trade_type in ("bull_call_spread", "bear_put_spread"):
                score_adj = 5
                signal["regime_note"] = "Spreads cheap in low VIX"

        # Stock trades are regime-neutral (small bonus in normal)
        if trade_type == "stock_trade":
            if self.regime == "normal":
                score_adj = 5

        signal["score"] = signal.get("score", 0) + score_adj
        signal["regime_adjustment"] = score_adj
        return signal

    def get_position_size_multiplier(self) -> float:
        """
        Reduce position size during elevated volatility.
        """
        if self.regime == "vix_spike":
            return 0.25  # Quarter size
        elif self.regime == "high_vol":
            return 0.6   # 60% size
        elif self.regime == "low_vol":
            return 1.0   # Full size
        return 0.8  # Normal = 80%
