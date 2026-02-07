"""
Strategy 3: Volatility Arbitrage
Compare IV to HV. Sell premium when IV >> HV, buy when IV << HV.
The most "AI-native" strategy — requires fast computation across many underlyings.
"""

import logging
from datetime import datetime
from typing import Optional

import config
from options_chain import (
    get_all_expirations_chain, get_stock_price, find_atm_options
)
from greeks import (
    calculate_historical_volatility, iv_vs_hv_zscore,
    calculate_iv_percentile, analyze_iv_skew
)

logger = logging.getLogger("options_bot.vol_arb")


class VolArbStrategy:
    """
    Volatility Arbitrage: exploit mispricings between implied and realized volatility.
    - IV >> HV (z-score > 1.5): Sell premium (iron condor or short straddle)
    - IV << HV (z-score < -1.5): Buy premium (long straddle or strangle)
    """

    def __init__(self):
        self.name = "Volatility Arbitrage"
        self.enabled = config.VOL_ARB_ENABLED

    def scan(self, ticker: str) -> list:
        """Scan a ticker for vol arb opportunities."""
        if not self.enabled:
            return []

        signals = []
        price = get_stock_price(ticker)
        if not price:
            return []

        # Get options chain
        chains = get_all_expirations_chain(
            ticker,
            dte_min=config.VOL_ARB_DTE_MIN,
            dte_max=config.VOL_ARB_DTE_MAX
        )
        if not chains:
            return []

        chain = chains[len(chains) // 2] if len(chains) > 1 else chains[0]
        calls = chain["calls"]
        puts = chain["puts"]
        expiration = chain["expiration_used"]
        dte = chain.get("dte", 45)

        if calls.empty or puts.empty:
            return []

        # Get ATM IV
        skew = analyze_iv_skew(calls, puts, price)
        atm_iv = skew.get("atm_iv")
        if not atm_iv:
            logger.info(f"  {ticker} could not determine ATM IV")
            return []

        # Calculate HV
        hv = calculate_historical_volatility(ticker, config.VOL_ARB_HV_LOOKBACK)
        if not hv:
            logger.info(f"  {ticker} could not calculate HV")
            return []

        # Z-score
        z_score = iv_vs_hv_zscore(atm_iv, ticker, config.VOL_ARB_HV_LOOKBACK)
        if z_score is None:
            return []

        iv_pctile = calculate_iv_percentile(ticker, atm_iv)

        logger.info(f"🔍 Vol Arb scan: {ticker} IV={atm_iv:.2%} HV={hv:.2%} "
                    f"z-score={z_score:.2f} IV_pctile={iv_pctile:.0f}%")

        # IV >> HV: sell premium
        if z_score >= config.VOL_ARB_IV_HV_THRESHOLD:
            signal = self._build_sell_premium(
                ticker, price, calls, puts, expiration, dte,
                atm_iv, hv, z_score, iv_pctile
            )
            if signal:
                signals.append(signal)

        # IV << HV: buy premium
        elif z_score <= -config.VOL_ARB_IV_HV_THRESHOLD:
            signal = self._build_buy_premium(
                ticker, price, calls, puts, expiration, dte,
                atm_iv, hv, z_score, iv_pctile
            )
            if signal:
                signals.append(signal)

        return signals

    def _build_sell_premium(self, ticker, price, calls, puts, expiration, dte,
                             atm_iv, hv, z_score, iv_pctile) -> Optional[dict]:
        """
        Build iron condor to sell elevated IV.
        """
        try:
            # Build iron condor with wings at ~1.5 std dev
            std_dev = price * atm_iv * (dte / 365) ** 0.5
            wing_width = 5  # $5 wings

            short_call_strike = round((price + std_dev) / 0.5) * 0.5
            long_call_strike = short_call_strike + wing_width
            short_put_strike = round((price - std_dev) / 0.5) * 0.5
            long_put_strike = short_put_strike - wing_width

            def find_closest(df, target):
                if df.empty:
                    return None
                df = df.copy()
                df["dist"] = abs(df["strike"] - target)
                return df.loc[df["dist"].idxmin()]

            sp = find_closest(puts, short_put_strike)
            lp = find_closest(puts, long_put_strike)
            sc = find_closest(calls, short_call_strike)
            lc = find_closest(calls, long_call_strike)

            if any(x is None for x in [sp, lp, sc, lc]):
                return None

            sp_mid = (sp.get("bid", 0) + sp.get("ask", 0)) / 2
            lp_mid = (lp.get("bid", 0) + lp.get("ask", 0)) / 2
            sc_mid = (sc.get("bid", 0) + sc.get("ask", 0)) / 2
            lc_mid = (lc.get("bid", 0) + lc.get("ask", 0)) / 2

            net_credit = (sp_mid - lp_mid) + (sc_mid - lc_mid)
            if net_credit <= 0:
                return None

            max_risk = (wing_width - net_credit) * 100
            if max_risk <= 0:
                return None

            num_contracts = max(1, int(config.MAX_RISK_PER_TRADE / max_risk))

            signal = {
                "strategy": "vol_arb",
                "ticker": ticker,
                "trade_type": "iron_condor",
                "direction": "neutral_sell",
                "expiration": expiration,
                "dte": dte,
                "stock_price": price,
                "atm_iv": atm_iv,
                "historical_vol": hv,
                "iv_hv_zscore": z_score,
                "iv_percentile": iv_pctile,
                "legs": [
                    {"action": "buy", "type": "put", "strike": float(lp["strike"]),
                     "mid_price": lp_mid},
                    {"action": "sell", "type": "put", "strike": float(sp["strike"]),
                     "mid_price": sp_mid},
                    {"action": "sell", "type": "call", "strike": float(sc["strike"]),
                     "mid_price": sc_mid},
                    {"action": "buy", "type": "call", "strike": float(lc["strike"]),
                     "mid_price": lc_mid},
                ],
                "net_credit": net_credit,
                "net_credit_total": net_credit * 100 * num_contracts,
                "max_risk": max_risk * num_contracts,
                "num_contracts": num_contracts,
                "profit_target": net_credit * 0.5 * 100 * num_contracts,
                "reason": (f"Vol Arb SELL: {ticker} IV={atm_iv:.0%} >> HV={hv:.0%} "
                          f"(z={z_score:.1f}), selling iron condor for ${net_credit:.2f}/contract")
            }

            logger.info(f"  🎯 Vol Arb SELL Iron Condor: {ticker} credit ${net_credit:.2f}")
            return signal

        except Exception as e:
            logger.error(f"Error building vol arb sell for {ticker}: {e}")
            return None

    def _build_buy_premium(self, ticker, price, calls, puts, expiration, dte,
                            atm_iv, hv, z_score, iv_pctile) -> Optional[dict]:
        """
        Build long strangle to buy cheap IV.
        """
        try:
            # Buy OTM calls and puts ~5% OTM
            target_call_strike = round((price * 1.05) / 0.5) * 0.5
            target_put_strike = round((price * 0.95) / 0.5) * 0.5

            def find_closest(df, target):
                if df.empty:
                    return None
                df = df.copy()
                df["dist"] = abs(df["strike"] - target)
                return df.loc[df["dist"].idxmin()]

            buy_call = find_closest(calls, target_call_strike)
            buy_put = find_closest(puts, target_put_strike)

            if buy_call is None or buy_put is None:
                return None

            call_mid = (buy_call.get("bid", 0) + buy_call.get("ask", 0)) / 2
            put_mid = (buy_put.get("bid", 0) + buy_put.get("ask", 0)) / 2
            total_debit = call_mid + put_mid

            if total_debit <= 0:
                return None

            max_risk = total_debit * 100  # Per contract
            num_contracts = max(1, int(config.MAX_RISK_PER_TRADE / max_risk))

            signal = {
                "strategy": "vol_arb",
                "ticker": ticker,
                "trade_type": "long_strangle",
                "direction": "neutral_buy",
                "expiration": expiration,
                "dte": dte,
                "stock_price": price,
                "atm_iv": atm_iv,
                "historical_vol": hv,
                "iv_hv_zscore": z_score,
                "iv_percentile": iv_pctile,
                "legs": [
                    {"action": "buy", "type": "put", "strike": float(buy_put["strike"]),
                     "mid_price": put_mid},
                    {"action": "buy", "type": "call", "strike": float(buy_call["strike"]),
                     "mid_price": call_mid},
                ],
                "net_debit": total_debit,
                "net_debit_total": total_debit * 100 * num_contracts,
                "max_risk": max_risk * num_contracts,
                "num_contracts": num_contracts,
                "profit_target": total_debit * 100 * num_contracts * 0.75,
                "reason": (f"Vol Arb BUY: {ticker} IV={atm_iv:.0%} << HV={hv:.0%} "
                          f"(z={z_score:.1f}), buying strangle for ${total_debit:.2f}/contract")
            }

            logger.info(f"  🎯 Vol Arb BUY Strangle: {ticker} debit ${total_debit:.2f}")
            return signal

        except Exception as e:
            logger.error(f"Error building vol arb buy for {ticker}: {e}")
            return None
