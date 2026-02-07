"""
Congress Trade Scraper
Fetches politician stock trade disclosures from Capitol Trades
"""

import json
import re
import logging
import requests
from datetime import datetime, timezone
from typing import List, Dict, Optional

logger = logging.getLogger("congress_bot.scraper")


def fetch_capitol_trades(pages: int = 3) -> List[Dict]:
    """
    Fetch trades from Capitol Trades website.
    Extracts the embedded Next.js JSON data from the HTML.
    """
    all_trades = []
    
    for page in range(1, pages + 1):
        try:
            url = f"https://www.capitoltrades.com/trades?page={page}&per-page=96"
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                "Accept": "text/html,application/xhtml+xml",
            }
            
            resp = requests.get(url, headers=headers, timeout=30)
            resp.raise_for_status()
            html = resp.text
            
            # Extract trade data from the Next.js data payload
            trades = extract_trades_from_html(html)
            if trades:
                all_trades.extend(trades)
                logger.info(f"Page {page}: fetched {len(trades)} trades")
            else:
                logger.warning(f"Page {page}: no trades extracted")
                break
                
        except Exception as e:
            logger.error(f"Error fetching page {page}: {e}")
            break
    
    logger.info(f"Total trades fetched: {len(all_trades)}")
    return all_trades


def extract_trades_from_html(html: str) -> List[Dict]:
    """
    Extract trade data from Capitol Trades HTML.
    The data is embedded in Next.js self.__next_f.push() calls as escaped JSON.
    """
    trades = []
    
    # The trade data is in the __next_f.push scripts with escaped JSON
    # First, find all the push calls and unescape the content
    push_pattern = r'self\.__next_f\.push\(\[1,"(.*?)"\]\)'
    pushes = re.findall(push_pattern, html, re.DOTALL)
    
    # Concatenate all push data and unescape
    full_data = ""
    for push in pushes:
        full_data += push
    
    # Unescape the JSON string escaping
    unescaped = full_data.replace('\\"', '"').replace('\\n', '\n').replace('\\\\', '\\')
    
    # Now find trade objects in the unescaped data
    # Look for the data array passed to DataTable component
    data_match = re.search(r'"data":\[(.*?)\],"columnVisibility"', unescaped, re.DOTALL)
    
    if data_match:
        try:
            data_str = "[" + data_match.group(1) + "]"
            raw_trades = json.loads(data_str)
            
            for t in raw_trades:
                trade = normalize_trade(t)
                if trade:
                    trades.append(trade)
            
            logger.debug(f"Extracted {len(trades)} trades via data array method")
            return trades
                    
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parse error on data array: {e}")
    
    # Fallback: extract individual trade objects from unescaped data
    logger.debug("Trying fallback extraction method...")
    trades = extract_trades_from_unescaped(unescaped)
    
    if not trades:
        # Try yet another approach: find objects directly in HTML
        trades = extract_trades_from_raw_html(html)
    
    return trades


def extract_trades_from_unescaped(text: str) -> List[Dict]:
    """Extract trade objects from unescaped Next.js data."""
    trades = []
    
    # Find all trade-like objects starting with {"_issuerId":
    starts = [m.start() for m in re.finditer(r'\{"_issuerId":\d+', text)]
    
    for start in starts:
        depth = 0
        i = start
        while i < len(text) and i < start + 5000:  # Safety limit
            if text[i] == '{':
                depth += 1
            elif text[i] == '}':
                depth -= 1
                if depth == 0:
                    try:
                        obj_str = text[start:i+1]
                        obj = json.loads(obj_str)
                        if "_txId" in obj:
                            trade = normalize_trade(obj)
                            if trade:
                                trades.append(trade)
                    except (json.JSONDecodeError, KeyError):
                        pass
                    break
            i += 1
    
    return trades


def extract_trades_from_raw_html(html: str) -> List[Dict]:
    """Last resort: extract from HTML with escaped JSON."""
    trades = []
    
    # The HTML has escaped JSON like: \"_issuerId\":2264488,\"_politicianId\":\"S001203\",\"_txId\":...
    # Find all transaction blocks
    pattern = r'\{\\?"_issuerId\\?":\d+.*?\\?"_txId\\?":\d+.*?\}'
    
    # Work with the unescaped version
    unescaped_html = html.replace('\\"', '"').replace('\\n', '\n')
    
    starts = [m.start() for m in re.finditer(r'\{"_issuerId":\d+', unescaped_html)]
    
    for start in starts:
        depth = 0
        i = start
        while i < len(unescaped_html) and i < start + 5000:
            if unescaped_html[i] == '{':
                depth += 1
            elif unescaped_html[i] == '}':
                depth -= 1
                if depth == 0:
                    try:
                        obj_str = unescaped_html[start:i+1]
                        obj = json.loads(obj_str)
                        if "_txId" in obj:
                            trade = normalize_trade(obj)
                            if trade:
                                trades.append(trade)
                    except (json.JSONDecodeError, KeyError):
                        pass
                    break
            i += 1
    
    return trades


def normalize_trade(raw: Dict) -> Optional[Dict]:
    """Normalize a raw trade object into our standard format."""
    try:
        # Extract politician info
        politician = raw.get("politician", {})
        first_name = politician.get("firstName", "")
        last_name = politician.get("lastName", "")
        nickname = politician.get("nickname", "")
        
        full_name = f"{first_name} {last_name}".strip()
        if nickname:
            full_name = f"{nickname} {last_name}".strip()
        
        # Extract issuer info
        issuer = raw.get("issuer", {})
        ticker_raw = issuer.get("issuerTicker", "")
        
        # Convert Capitol Trades ticker format (e.g., "AAPL:US") to just "AAPL"
        ticker = ticker_raw.split(":")[0] if ticker_raw else None
        
        # Handle special tickers like BRK/B -> BRK.B
        if ticker:
            ticker = ticker.replace("/", ".")
        
        # Skip trades without tickers (private equity, etc.)
        if not ticker:
            return None
        
        # Transaction type
        tx_type = raw.get("txType", "").lower()
        if tx_type not in ("buy", "sell"):
            return None
        
        # Value
        value = raw.get("value", 0)
        if value is None:
            value = 0
        
        # Dates
        pub_date = raw.get("pubDate", "")
        tx_date = raw.get("txDate", "")
        
        # Parse pub_date
        pub_datetime = None
        if pub_date:
            try:
                pub_datetime = datetime.fromisoformat(pub_date.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                pass
        
        # Parse tx_date (format: YYYY-MM-DD)
        tx_datetime = None
        if tx_date:
            try:
                tx_datetime = datetime.strptime(tx_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            except (ValueError, TypeError):
                pass
        
        return {
            "tx_id": str(raw.get("_txId", "")),
            "politician_id": raw.get("_politicianId", ""),
            "politician_name": full_name,
            "party": politician.get("party", ""),
            "chamber": raw.get("chamber", ""),
            "state": politician.get("_stateId", ""),
            "ticker": ticker,
            "issuer_name": issuer.get("issuerName", ""),
            "sector": issuer.get("sector", ""),
            "tx_type": tx_type,
            "value": value,
            "price": raw.get("price"),
            "pub_date": pub_date,
            "pub_datetime": pub_datetime,
            "tx_date": tx_date,
            "tx_datetime": tx_datetime,
            "reporting_gap_days": raw.get("reportingGap", 0),
            "owner": raw.get("owner", ""),
            "comment": raw.get("comment", ""),
        }
        
    except Exception as e:
        logger.error(f"Error normalizing trade: {e}")
        return None


def get_recent_trades(pages: int = 3) -> List[Dict]:
    """Main entry point: fetch and return normalized recent trades."""
    return fetch_capitol_trades(pages=pages)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    trades = get_recent_trades(pages=2)
    print(f"\nFetched {len(trades)} trades:")
    for t in trades[:10]:
        print(f"  {t['politician_name']:20s} | {t['tx_type'].upper():4s} | {t['ticker']:6s} | ${t['value']:>10,} | {t['tx_date']} | pub: {t['pub_date'][:10] if t['pub_date'] else 'N/A'}")
