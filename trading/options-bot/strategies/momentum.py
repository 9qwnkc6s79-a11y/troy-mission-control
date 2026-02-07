"""
Strategy 4: Momentum Options
Buy directional options when strong technical signals align.
MACD cross + RSI extreme + volume surge → buy slightly ITM options.
"""

import logging
from datetime import datetime
from typing import Optional

import config
from options_chain import (
    get_all_expirations_chain, get_stock_price, get_stock_history, get_daily_change
)
from greeks import calculate_rsi, calculate_macd

logger = logging.getLogger("options_bot.momentum")


class MomentumStrategy:
    """
    Momentum options: buy directional options on strong technical signals.
    - Bullish: RSI < 30 + MACD bullish cross + volume surge → buy ITM calls
    - Bearish: RSI > 70 + MACD bearish cross + volume surge → buy ITM puts
    """

    def __init__(self):
        self.name = "Momentum Options"
        self.enabled = config.MOMENTUM_ENABLED

    def scan(self, ticker: str) -> list:
        """Scan a ticker for momentum signals."""
        if not self.enabled:
            return []

        signals = []

        # Get historical data for technicals
        hist = get_stock_history(ticker, period="3mo")
        if hist.empty or len(hist) < 30:
            return []

        price = float(hist["Close"].iloc[-1])
        daily = get_daily_change(ticker)
        volume_ratio = daily.get("volume_ratio", 1.0)

        # Calculate technicals
        rsi = calculate_rsi(hist["Close"])
        macd_data = calculate_macd(hist["Close"])

        if rsi is None:
            return []

        macd_cross = macd_data.get("cross")
        macd_hist = macd_data.get("histogram", 0)

        logger.info(f"🔍 Momentum scan: {ticker} RSI={rsi:.1f} MACD_cross={macd_cross} "
                    f"vol_ratio={volume_ratio:.1f}x")

        # Bullish momentum: RSI oversold + MACD bullish cross + volume
        if (rsi <= config.MOMENTUM_RSI_OVERSOLD and
                macd_cross == "bullish" and
                volume_ratio > 1.3):
            signal = self._build_directional(
                ticker, price, "bullish", rsi, macd_data, volume_ratio
            )
            if signal:
                signals.append(signal)

        # Bearish momentum: RSI overbought + MACD bearish cross + volume
        elif (rsi >= config.MOMENTUM_RSI_OVERBOUGHT and
              macd_cross == "bearish" and
              volume_ratio > 1.3):
            signal = self._build_directional(
                ticker, price, "bearish", rsi, macd_data, volume_ratio
            )
            if signal:
                signals.append(signal)

        # Strong momentum without full signal confluence (relaxed criteria)
        elif abs(daily.get("change_pct", 0)) > 0.02 and volume_ratio > 2.0:
            if daily["change_pct"] > 0 and macd_cross == "bullish":
                signal = self._build_directional(
                    ticker, price, "bullish", rsi, macd_data, volume_ratio
                )
                if signal:
                    signals.append(signal)
            elif daily["change_pct"] < 0 and macd_cross == "bearish":
                signal = self._build_directional(
                    ticker, price, "bearish", rsi, macd_data, volume_ratio
                )
                if signal:
                    signals.append(signal)

        return signals

    def _build_directional(self, ticker: str, price: float, direction: str,
                            rsi: float, macd_data: dict,
                            volume_ratio: float) -> Optional[dict]:
        """
        Build a directional options trade.
        Buy slightly ITM call (bullish) or put (bearish) with 14-30 DTE.
        Target delta 0.6-0.7 for good directional exposure.
        """
        try:
            chains = get_all_expirations_chain(
                ticker,
                dte_min=config.MOMENTUM_DTE_MIN,
                dte_max=config.MOMENTUM_DTE_MAX
            )
            if not chains:
                return None

            chain = chains[0]  # Shortest DTE within range
            expiration = chain["expiration_used"]
            dte = chain.get("dte", 21)

            if direction == "bullish":
                df = chain["calls"]
                option_type = "call"
                # Slightly ITM = strike slightly below current price
                target_strike = round((price * 0.97) / 0.5) * 0.5
            else:
                df = chain["puts"]
                option_type = "put"
                # Slightly ITM = strike slightly above current price
                target_strike = round((price * 1.03) / 0.5) * 0.5

            if df.empty:
                return None

            df = df.copy()
            df["dist"] = abs(df["strike"] - target_strike)
            idx = df["dist"].idxmin()
            option = df.loc[idx]

            mid_price = (option.get("bid", 0) + option.get("ask", 0)) / 2
            if mid_price <= 0:
                return None

            max_risk = mid_price * 100  # Per contract
            num_contracts = max(1, int(config.MAX_RISK_PER_TRADE / max_risk))

            # Cap at reasonable number
            num_contracts = min(num_contracts, 10)

            stop_loss = mid_price * (1 - config.MOMENTUM_STOP_LOSS_PCT)
            profit_target = mid_price * (1 + config.MOMENTUM_PROFIT_TARGET_PCT)

            signal = {
                "strategy": "momentum",
                "ticker": ticker,
                "trade_type": f"long_{option_type}",
                "direction": direction,
                "expiration": expiration,
                "dte": dte,
                "stock_price": price,
                "rsi": rsi,
                "macd_cross": macd_data.get("cross"),
                "macd_histogram": macd_data.get("histogram"),
                "volume_ratio": volume_ratio,
                "legs": [
                    {"action": "buy", "type": option_type,
                     "strike": float(option["strike"]),
                     "mid_price": mid_price},
                ],
                "net_debit": mid_price,
                "net_debit_total": mid_price * 100 * num_contracts,
                "max_risk": max_risk * num_contracts,
                "num_contracts": num_contracts,
                "stop_loss_price": stop_loss,
                "profit_target_price": profit_target,
                "profit_target": (profit_target - mid_price) * 100 * num_contracts,
                "reason": (f"Momentum {direction.upper()}: {ticker} RSI={rsi:.0f} "
                          f"MACD={macd_data['cross']} vol={volume_ratio:.1f}x, "
                          f"buying {option['strike']} {option_type} for ${mid_price:.2f}")
            }

            logger.info(f"  🎯 Momentum {direction}: {ticker} {option['strike']} {option_type} "
                       f"exp {expiration} @ ${mid_price:.2f}")
            return signal

        except Exception as e:
            logger.error(f"Error building momentum trade for {ticker}: {e}")
            return None
