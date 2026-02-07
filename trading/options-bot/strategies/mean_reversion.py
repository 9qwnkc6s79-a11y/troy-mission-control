"""
Strategy 2: Mean Reversion Spreads + Stock Trades
Buy bull call spreads on big drops, bear put spreads on big rallies.
Also generates stock trade signals for simpler execution.
"""

import logging
from datetime import datetime
from typing import Optional

import config
from options_chain import (
    get_all_expirations_chain, get_stock_price, get_daily_change, get_stock_history
)
from greeks import analyze_iv_skew, calculate_rsi

logger = logging.getLogger("options_bot.mean_reversion")


class MeanReversionStrategy:
    """
    Mean reversion: buy spreads or stock when a stock has a big move.
    - Drop ≥2% on high volume → bull call spread or buy shares (30-45 DTE)
    - Rally ≥2% on low volume → bear put spread (30-45 DTE)
    
    Also checks multi-day moves (3-day cumulative) for less binary triggers.
    """

    def __init__(self):
        self.name = "Mean Reversion Spreads"
        self.enabled = config.MEAN_REVERSION_ENABLED

    def scan(self, ticker: str) -> list:
        """Scan a ticker for mean reversion opportunities."""
        if not self.enabled:
            return []

        signals = []
        daily = get_daily_change(ticker)
        change_pct = daily["change_pct"]
        volume_ratio = daily["volume_ratio"]
        price = daily["price"]

        if price <= 0:
            return []

        logger.info(f"🔍 Mean Reversion scan: {ticker} change={change_pct:.2%} "
                    f"vol_ratio={volume_ratio:.1f}x")

        # Also check multi-day cumulative move
        hist = get_stock_history(ticker, period="1mo")
        cumulative_3d = 0
        rsi = None
        if not hist.empty and len(hist) >= 5:
            recent = hist["Close"].tail(4)
            if len(recent) >= 2:
                cumulative_3d = (recent.iloc[-1] - recent.iloc[0]) / recent.iloc[0]
            rsi = calculate_rsi(hist["Close"])

        # ─── Bullish signals (oversold / big drop) ───────────────────────
        bullish = False
        bull_reason = ""

        # Single day big drop on elevated volume
        if change_pct <= config.MEAN_REVERSION_DROP_THRESHOLD and volume_ratio >= config.MEAN_REVERSION_VOLUME_RATIO_MIN:
            bullish = True
            bull_reason = f"1-day drop {change_pct:.1%} on {volume_ratio:.1f}x volume"

        # Multi-day cumulative oversold (3-day drop of 3%+)
        elif cumulative_3d <= -0.03 and volume_ratio >= 1.0:
            bullish = True
            bull_reason = f"3-day drop {cumulative_3d:.1%}"

        # RSI oversold + any red day
        elif rsi and rsi <= 35 and change_pct < 0:
            bullish = True
            bull_reason = f"RSI={rsi:.0f} oversold + down {change_pct:.1%}"

        if bullish:
            # Try options spread first
            spread_signal = self._build_bull_call_spread(ticker, price, change_pct, volume_ratio)
            if spread_signal:
                spread_signal["reason"] = f"Mean Rev Bull (options): {bull_reason}"
                signals.append(spread_signal)

            # Also generate stock trade signal
            if config.STOCK_TRADES_ENABLED:
                stock_signal = self._build_stock_trade(
                    ticker, price, "bullish", change_pct, volume_ratio, bull_reason, rsi
                )
                if stock_signal:
                    signals.append(stock_signal)

        # ─── Bearish signals (overbought / big rally on weak volume) ─────
        bearish = False
        bear_reason = ""

        # Big rally on LOW volume (weak, likely to fade)
        if change_pct >= config.MEAN_REVERSION_RALLY_THRESHOLD and volume_ratio < 0.8:
            bearish = True
            bear_reason = f"Rally {change_pct:.1%} on weak {volume_ratio:.1f}x volume"

        # Multi-day overbought
        elif cumulative_3d >= 0.04 and volume_ratio < 1.0:
            bearish = True
            bear_reason = f"3-day rally {cumulative_3d:.1%} on declining volume"

        # RSI overbought + any green day
        elif rsi and rsi >= 70 and change_pct > 0:
            bearish = True
            bear_reason = f"RSI={rsi:.0f} overbought + up {change_pct:.1%}"

        if bearish:
            spread_signal = self._build_bear_put_spread(ticker, price, change_pct, volume_ratio)
            if spread_signal:
                spread_signal["reason"] = f"Mean Rev Bear (options): {bear_reason}"
                signals.append(spread_signal)

            if config.STOCK_TRADES_ENABLED:
                stock_signal = self._build_stock_trade(
                    ticker, price, "bearish", change_pct, volume_ratio, bear_reason, rsi
                )
                if stock_signal:
                    signals.append(stock_signal)

        return signals

    def _build_stock_trade(self, ticker: str, price: float, direction: str,
                           change_pct: float, volume_ratio: float,
                           reason: str, rsi: float = None) -> Optional[dict]:
        """Build a stock trade signal for mean reversion."""
        try:
            stop_pct = config.STOCK_STOP_LOSS_PCT
            tp_pct = config.STOCK_TAKE_PROFIT_PCT

            if direction == "bullish":
                stop_loss = round(price * (1 - stop_pct), 2)
                take_profit = round(price * (1 + tp_pct), 2)
            else:
                stop_loss = round(price * (1 + stop_pct), 2)
                take_profit = round(price * (1 - tp_pct), 2)

            risk_per_share = price * stop_pct
            qty = max(1, int(config.MAX_RISK_PER_TRADE / risk_per_share))
            qty = min(qty, int(config.STOCK_POSITION_MAX / price))

            signal = {
                "strategy": "mean_reversion",
                "ticker": ticker,
                "trade_type": "stock_trade",
                "direction": direction,
                "expiration": "N/A",
                "dte": 0,
                "stock_price": price,
                "daily_change": change_pct,
                "volume_ratio": volume_ratio,
                "rsi": rsi,
                "legs": [],
                "num_contracts": 0,
                "stock_qty": qty,
                "stop_loss": stop_loss,
                "take_profit": take_profit,
                "max_risk": risk_per_share * qty,
                "profit_target": (tp_pct * price) * qty,
                "reason": f"Mean Rev Stock {direction.upper()}: {reason}",
            }

            logger.info(f"  🎯 Mean Rev STOCK {direction}: {ticker} qty={qty} "
                       f"SL=${stop_loss} TP=${take_profit}")
            return signal

        except Exception as e:
            logger.error(f"Error building stock trade for {ticker}: {e}")
            return None

    def _build_bull_call_spread(self, ticker: str, price: float,
                                 change_pct: float, volume_ratio: float) -> Optional[dict]:
        """Build a bull call spread after a big drop."""
        try:
            chains = get_all_expirations_chain(
                ticker,
                dte_min=config.MEAN_REVERSION_DTE_MIN,
                dte_max=config.MEAN_REVERSION_DTE_MAX
            )
            if not chains:
                return None

            chain = chains[len(chains) // 2] if len(chains) > 1 else chains[0]
            calls = chain["calls"]
            expiration = chain["expiration_used"]
            dte = chain.get("dte", 30)

            if calls.empty:
                return None

            calls = calls.copy()
            calls["dist"] = abs(calls["strike"] - price)
            atm_idx = calls["dist"].idxmin()
            buy_call = calls.loc[atm_idx]

            sell_strike = float(buy_call["strike"]) + config.MEAN_REVERSION_SPREAD_WIDTH
            sell_candidates = calls[abs(calls["strike"] - sell_strike) <= 2.5]
            if sell_candidates.empty:
                return None
            sell_call = sell_candidates.loc[abs(sell_candidates["strike"] - sell_strike).idxmin()]

            buy_mid = (buy_call.get("bid", 0) + buy_call.get("ask", 0)) / 2
            sell_mid = (sell_call.get("bid", 0) + sell_call.get("ask", 0)) / 2
            net_debit = buy_mid - sell_mid

            if net_debit <= 0:
                return None

            max_risk = net_debit * 100
            max_profit = (float(sell_call["strike"]) - float(buy_call["strike"]) - net_debit) * 100

            if max_risk > config.MAX_RISK_PER_TRADE:
                num_contracts = 1
            else:
                num_contracts = max(1, int(config.MAX_RISK_PER_TRADE / max_risk))

            signal = {
                "strategy": "mean_reversion",
                "ticker": ticker,
                "trade_type": "bull_call_spread",
                "direction": "bullish",
                "expiration": expiration,
                "dte": dte,
                "stock_price": price,
                "daily_change": change_pct,
                "volume_ratio": volume_ratio,
                "legs": [
                    {"action": "buy", "type": "call", "strike": float(buy_call["strike"]),
                     "mid_price": buy_mid},
                    {"action": "sell", "type": "call", "strike": float(sell_call["strike"]),
                     "mid_price": sell_mid},
                ],
                "net_debit": net_debit,
                "net_debit_total": net_debit * 100 * num_contracts,
                "max_risk": max_risk * num_contracts,
                "max_profit": max_profit * num_contracts,
                "num_contracts": num_contracts,
                "profit_target": max_profit * num_contracts * 0.5,
                "reason": (f"Mean Rev Bull Call Spread: {ticker} {buy_call['strike']}/{sell_call['strike']} "
                          f"for ${net_debit:.2f}")
            }

            logger.info(f"  🎯 Bull Call Spread: {ticker} {buy_call['strike']}/{sell_call['strike']} "
                       f"exp {expiration} debit ${net_debit:.2f}")
            return signal

        except Exception as e:
            logger.error(f"Error building bull call spread for {ticker}: {e}")
            return None

    def _build_bear_put_spread(self, ticker: str, price: float,
                                change_pct: float, volume_ratio: float) -> Optional[dict]:
        """Build a bear put spread after a weak rally."""
        try:
            chains = get_all_expirations_chain(
                ticker,
                dte_min=config.MEAN_REVERSION_DTE_MIN,
                dte_max=config.MEAN_REVERSION_DTE_MAX
            )
            if not chains:
                return None

            chain = chains[len(chains) // 2] if len(chains) > 1 else chains[0]
            puts = chain["puts"]
            expiration = chain["expiration_used"]
            dte = chain.get("dte", 30)

            if puts.empty:
                return None

            puts = puts.copy()
            puts["dist"] = abs(puts["strike"] - price)
            atm_idx = puts["dist"].idxmin()
            buy_put = puts.loc[atm_idx]

            sell_strike = float(buy_put["strike"]) - config.MEAN_REVERSION_SPREAD_WIDTH
            sell_candidates = puts[abs(puts["strike"] - sell_strike) <= 2.5]
            if sell_candidates.empty:
                return None
            sell_put = sell_candidates.loc[abs(sell_candidates["strike"] - sell_strike).idxmin()]

            buy_mid = (buy_put.get("bid", 0) + buy_put.get("ask", 0)) / 2
            sell_mid = (sell_put.get("bid", 0) + sell_put.get("ask", 0)) / 2
            net_debit = buy_mid - sell_mid

            if net_debit <= 0:
                return None

            max_risk = net_debit * 100
            max_profit = (float(buy_put["strike"]) - float(sell_put["strike"]) - net_debit) * 100

            if max_risk > config.MAX_RISK_PER_TRADE:
                num_contracts = 1
            else:
                num_contracts = max(1, int(config.MAX_RISK_PER_TRADE / max_risk))

            signal = {
                "strategy": "mean_reversion",
                "ticker": ticker,
                "trade_type": "bear_put_spread",
                "direction": "bearish",
                "expiration": expiration,
                "dte": dte,
                "stock_price": price,
                "daily_change": change_pct,
                "volume_ratio": volume_ratio,
                "legs": [
                    {"action": "buy", "type": "put", "strike": float(buy_put["strike"]),
                     "mid_price": buy_mid},
                    {"action": "sell", "type": "put", "strike": float(sell_put["strike"]),
                     "mid_price": sell_mid},
                ],
                "net_debit": net_debit,
                "net_debit_total": net_debit * 100 * num_contracts,
                "max_risk": max_risk * num_contracts,
                "max_profit": max_profit * num_contracts,
                "num_contracts": num_contracts,
                "profit_target": max_profit * num_contracts * 0.5,
                "reason": (f"Mean Rev Bear Put Spread: {ticker} {buy_put['strike']}/{sell_put['strike']} "
                          f"for ${net_debit:.2f}")
            }

            logger.info(f"  🎯 Bear Put Spread: {ticker} {buy_put['strike']}/{sell_put['strike']} "
                       f"exp {expiration} debit ${net_debit:.2f}")
            return signal

        except Exception as e:
            logger.error(f"Error building bear put spread for {ticker}: {e}")
            return None
