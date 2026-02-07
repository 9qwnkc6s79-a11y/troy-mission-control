"""
Strategy 1: IV Crush Play (Earnings)
Sell premium (iron condors) before earnings when IV is elevated.
Profit from IV crush after the announcement.
Now with LLM-powered analysis and stock trade fallback.
"""

import logging
import requests
from datetime import datetime, timedelta
from typing import Optional

import config
from options_chain import (
    get_options_chain_yf, get_all_expirations_chain,
    get_stock_price, get_stock_history, get_daily_change,
    find_atm_options, find_otm_options, match_yf_to_alpaca
)
from greeks import calculate_iv_percentile, analyze_iv_skew

logger = logging.getLogger("options_bot.iv_crush")


def get_upcoming_earnings(days_ahead: int = 10) -> dict:
    """
    Fetch upcoming earnings from NASDAQ calendar.
    Returns dict: {ticker: earnings_date}
    """
    earnings = {}
    today = datetime.now().date()

    for day_offset in range(0, days_ahead + 1):
        check_date = today + timedelta(days=day_offset)
        date_str = check_date.strftime("%Y-%m-%d")

        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                              "AppleWebKit/537.36 (KHTML, like Gecko) "
                              "Chrome/120.0.0.0 Safari/537.36"
            }
            resp = requests.get(
                config.EARNINGS_CALENDAR_URL,
                params={"date": date_str},
                headers=headers,
                timeout=10
            )
            if resp.status_code != 200:
                continue

            data = resp.json()
            rows = data.get("data", {}).get("rows", [])
            if not rows:
                continue

            for row in rows:
                symbol = row.get("symbol", "").strip().upper()
                if symbol in config.WATCHLIST:
                    earnings[symbol] = date_str
                    logger.info(f"📅 Earnings found: {symbol} on {date_str}")

        except Exception as e:
            logger.debug(f"Error fetching earnings for {date_str}: {e}")
            continue

    return earnings


class IVCrushStrategy:
    """
    IV Crush strategy: sell iron condors on stocks with elevated IV before earnings.
    Now also generates stock trade signals as alternative.
    """

    def __init__(self):
        self.name = "IV Crush (Earnings)"
        self.enabled = config.IV_CRUSH_ENABLED
        self._earnings_cache = {}
        self._earnings_cache_time = None

    def _refresh_earnings(self):
        """Refresh earnings cache (once per day)."""
        now = datetime.now()
        if (self._earnings_cache_time is None or
                (now - self._earnings_cache_time).total_seconds() > 86400):
            logger.info("Refreshing earnings calendar...")
            self._earnings_cache = get_upcoming_earnings(config.IV_CRUSH_EARNINGS_WINDOW_DAYS)
            self._earnings_cache_time = now
            logger.info(f"Earnings cache: {self._earnings_cache}")

    def scan(self, ticker: str) -> list:
        """
        Scan a ticker for IV crush opportunities.
        Returns list of trade signals (options iron condor or stock trade).
        """
        if not self.enabled:
            return []

        signals = []
        self._refresh_earnings()

        # Only look at stocks with upcoming earnings
        if ticker not in self._earnings_cache:
            return []

        earnings_date = self._earnings_cache[ticker]
        logger.info(f"🔍 IV Crush scan: {ticker} (earnings: {earnings_date})")

        # Get current stock price
        price = get_stock_price(ticker)
        if not price:
            logger.warning(f"Could not get price for {ticker}")
            return []

        # Get options chain with appropriate DTE
        chains = get_all_expirations_chain(
            ticker,
            dte_min=config.IV_CRUSH_DTE_MIN,
            dte_max=config.IV_CRUSH_DTE_MAX
        )

        if not chains:
            logger.warning(f"No options chains found for {ticker}")
            return []

        # Find the best expiration (just after earnings)
        earnings_dt = datetime.strptime(earnings_date, "%Y-%m-%d").date()
        best_chain = None
        best_dte = float("inf")

        for chain in chains:
            exp_dt = datetime.strptime(chain["expiration_used"], "%Y-%m-%d").date()
            if exp_dt > earnings_dt:
                dte = (exp_dt - datetime.now().date()).days
                if dte < best_dte:
                    best_dte = dte
                    best_chain = chain

        if not best_chain:
            logger.info(f"No suitable expiration found after earnings for {ticker}")
            return []

        calls = best_chain["calls"]
        puts = best_chain["puts"]
        expiration = best_chain["expiration_used"]

        if calls.empty or puts.empty:
            return []

        # Analyze IV
        skew = analyze_iv_skew(calls, puts, price)
        atm_iv = skew.get("atm_iv")

        if atm_iv is None:
            logger.info(f"Could not determine ATM IV for {ticker}")
            return []

        # Check IV percentile (LOWERED threshold)
        iv_pctile = calculate_iv_percentile(ticker, atm_iv)
        logger.info(f"  {ticker} ATM IV: {atm_iv:.2%}, IV Percentile: {iv_pctile:.0f}%")

        if iv_pctile is None or iv_pctile < config.IV_CRUSH_PERCENTILE_THRESHOLD:
            logger.info(f"  {ticker} IV percentile {iv_pctile:.0f}% below threshold "
                       f"{config.IV_CRUSH_PERCENTILE_THRESHOLD}%")
            return []

        # LLM earnings analysis
        llm_result = None
        if config.LLM_EARNINGS_ENABLED:
            try:
                from earnings_llm import analyze_earnings_play, get_historical_earnings_moves
                
                # Gather context for LLM
                hist = get_stock_history(ticker, period="1mo")
                recent_changes = []
                if not hist.empty and len(hist) >= 2:
                    daily_rets = hist["Close"].pct_change().dropna()
                    recent_changes = daily_rets.tail(5).tolist()
                
                hist_moves = get_historical_earnings_moves(ticker)
                
                # Implied move = ATM straddle / stock price
                atm_opts = find_atm_options(best_chain, price)
                implied_move = 0
                if atm_opts.get("atm_call") and atm_opts.get("atm_put"):
                    call_mid = (atm_opts["atm_call"].get("bid", 0) + atm_opts["atm_call"].get("ask", 0)) / 2
                    put_mid = (atm_opts["atm_put"].get("bid", 0) + atm_opts["atm_put"].get("ask", 0)) / 2
                    implied_move = ((call_mid + put_mid) / price) * 100
                
                llm_result = analyze_earnings_play(
                    ticker=ticker,
                    earnings_date=earnings_date,
                    price_data={"recent_daily_changes": recent_changes},
                    implied_move_pct=implied_move,
                    hist_earnings_moves=hist_moves,
                    iv_percentile=iv_pctile,
                    atm_iv=atm_iv,
                )
                
                if not llm_result.get("should_trade", False):
                    logger.info(f"  🧠 LLM says SKIP {ticker}: {llm_result.get('reasoning', '')[:100]}")
                    return []
                    
            except Exception as e:
                logger.warning(f"LLM analysis failed for {ticker}: {e} — proceeding anyway")

        # IV is elevated — build iron condor (options)
        wing_width = config.IV_CRUSH_IRON_CONDOR_WING_WIDTH
        signal = self._build_iron_condor(
            ticker, price, calls, puts, expiration, wing_width,
            atm_iv, iv_pctile, earnings_date, llm_result
        )

        if signal:
            signals.append(signal)

        return signals

    def _build_iron_condor(self, ticker: str, price: float,
                            calls, puts, expiration: str,
                            wing_width: float, atm_iv: float,
                            iv_pctile: float, earnings_date: str,
                            llm_result: dict = None) -> Optional[dict]:
        """Build an iron condor signal."""
        try:
            dte = (datetime.strptime(expiration, "%Y-%m-%d").date() - datetime.now().date()).days
            std_dev = price * atm_iv * (dte / 365) ** 0.5

            short_put_strike = round((price - std_dev) / 0.5) * 0.5
            short_call_strike = round((price + std_dev) / 0.5) * 0.5
            long_put_strike = short_put_strike - wing_width
            long_call_strike = short_call_strike + wing_width

            def find_closest(df, target_strike):
                if df.empty:
                    return None
                df = df.copy()
                df["dist"] = abs(df["strike"] - target_strike)
                idx = df["dist"].idxmin()
                return df.loc[idx]

            short_put = find_closest(puts, short_put_strike)
            long_put = find_closest(puts, long_put_strike)
            short_call = find_closest(calls, short_call_strike)
            long_call = find_closest(calls, long_call_strike)

            if any(x is None for x in [short_put, long_put, short_call, long_call]):
                logger.warning(f"Could not find all legs for {ticker} iron condor")
                return None

            short_put_mid = (short_put.get("bid", 0) + short_put.get("ask", 0)) / 2
            long_put_mid = (long_put.get("bid", 0) + long_put.get("ask", 0)) / 2
            short_call_mid = (short_call.get("bid", 0) + short_call.get("ask", 0)) / 2
            long_call_mid = (long_call.get("bid", 0) + long_call.get("ask", 0)) / 2

            net_credit = (short_put_mid - long_put_mid) + (short_call_mid - long_call_mid)

            if net_credit <= 0:
                logger.info(f"  {ticker} iron condor has no credit, skipping")
                return None

            max_risk = (wing_width - net_credit) * 100

            if max_risk > config.MAX_RISK_PER_TRADE:
                logger.info(f"  {ticker} iron condor max risk ${max_risk:.0f} exceeds limit")
                return None

            num_contracts = max(1, int(config.MAX_RISK_PER_TRADE / max_risk))

            llm_note = ""
            if llm_result:
                llm_note = f" | LLM: {llm_result.get('conviction', '?')}/10 {llm_result.get('direction', '')}"

            signal = {
                "strategy": "iv_crush",
                "ticker": ticker,
                "trade_type": "iron_condor",
                "direction": "neutral",
                "expiration": expiration,
                "dte": dte,
                "stock_price": price,
                "atm_iv": atm_iv,
                "iv_percentile": iv_pctile,
                "earnings_date": earnings_date,
                "llm_analysis": llm_result,
                "legs": [
                    {"action": "buy", "type": "put", "strike": float(long_put["strike"]),
                     "mid_price": long_put_mid},
                    {"action": "sell", "type": "put", "strike": float(short_put["strike"]),
                     "mid_price": short_put_mid},
                    {"action": "sell", "type": "call", "strike": float(short_call["strike"]),
                     "mid_price": short_call_mid},
                    {"action": "buy", "type": "call", "strike": float(long_call["strike"]),
                     "mid_price": long_call_mid},
                ],
                "net_credit": net_credit,
                "net_credit_total": net_credit * 100 * num_contracts,
                "max_risk": max_risk * num_contracts,
                "num_contracts": num_contracts,
                "profit_target": net_credit * 0.5 * 100 * num_contracts,
                "reason": (f"IV Crush: {ticker} earnings {earnings_date}, "
                          f"IV {atm_iv:.0%} at {iv_pctile:.0f}th pctile, "
                          f"credit ${net_credit:.2f}/contract{llm_note}")
            }

            logger.info(f"  🎯 Iron Condor signal: {ticker} {expiration}")
            logger.info(f"     Puts: {long_put['strike']}/{short_put['strike']} | "
                       f"Calls: {short_call['strike']}/{long_call['strike']}")
            logger.info(f"     Credit: ${net_credit:.2f}/contract x{num_contracts}")

            return signal

        except Exception as e:
            logger.error(f"Error building iron condor for {ticker}: {e}")
            return None
