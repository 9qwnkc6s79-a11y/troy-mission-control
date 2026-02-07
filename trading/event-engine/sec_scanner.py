"""
SEC EDGAR Scanner
Monitors Form 4 filings (insider buying/selling) and detects cluster activity.
"""

import json
import logging
import re
import time
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple
from xml.etree import ElementTree

import requests

import config as cfg

logger = logging.getLogger("event_engine.sec")

# SEC requires a valid User-Agent
SEC_HEADERS = {
    "User-Agent": "TradingBot research@example.com",
    "Accept": "application/json, text/html, application/xml",
}

# Rate limit: SEC asks for max 10 requests/second
_last_request_time = 0


def _rate_limit():
    """Respect SEC rate limits."""
    global _last_request_time
    elapsed = time.time() - _last_request_time
    if elapsed < 0.15:  # ~6-7 req/sec to be safe
        time.sleep(0.15 - elapsed)
    _last_request_time = time.time()


def fetch_recent_form4_filings(days_back: int = 3, max_results: int = 200) -> List[Dict]:
    """
    Fetch recent Form 4 filings from SEC EDGAR full-text search.
    Returns list of filing metadata.
    """
    _rate_limit()
    
    end_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    start_date = (datetime.now(timezone.utc) - timedelta(days=days_back)).strftime("%Y-%m-%d")
    
    # Use EDGAR full-text search API
    url = "https://efts.sec.gov/LATEST/search-index"
    params = {
        "q": '"form-type"',
        "forms": "4",
        "dateRange": "custom",
        "startdt": start_date,
        "enddt": end_date,
    }
    
    filings = []
    
    try:
        resp = requests.get(url, params=params, headers=SEC_HEADERS, timeout=30)
        
        if resp.status_code == 200:
            try:
                data = resp.json()
                hits = data.get("hits", {}).get("hits", [])
                for hit in hits[:max_results]:
                    source = hit.get("_source", {})
                    filings.append({
                        "filing_type": "4",
                        "file_date": source.get("file_date", ""),
                        "company_name": source.get("display_names", [""])[0] if source.get("display_names") else "",
                        "cik": source.get("entity_id", ""),
                        "accession": hit.get("_id", ""),
                    })
            except (json.JSONDecodeError, KeyError):
                logger.debug("EFTS response not JSON, trying alternative approach")
        
        if not filings:
            # Alternative: use EDGAR XBRL companion API
            filings = _fetch_form4_via_rss(days_back)
            
    except Exception as e:
        logger.error(f"Error fetching EDGAR filings: {e}")
        # Fallback
        filings = _fetch_form4_via_rss(days_back)
    
    logger.info(f"Fetched {len(filings)} Form 4 filings from EDGAR")
    return filings


def _fetch_form4_via_rss(days_back: int = 3) -> List[Dict]:
    """
    Alternative: fetch Form 4 filings via EDGAR RSS feed.
    """
    _rate_limit()
    filings = []
    
    try:
        url = "https://www.sec.gov/cgi-bin/browse-edgar"
        params = {
            "action": "getcurrent",
            "type": "4",
            "dateb": "",
            "owner": "include",
            "count": 100,
            "search_text": "",
            "start": 0,
            "output": "atom",
        }
        
        resp = requests.get(url, params=params, headers=SEC_HEADERS, timeout=30)
        if resp.status_code == 200:
            filings = _parse_edgar_atom_feed(resp.text, days_back)
            
    except Exception as e:
        logger.error(f"Error fetching EDGAR RSS: {e}")
    
    return filings


def _parse_edgar_atom_feed(xml_text: str, days_back: int = 3) -> List[Dict]:
    """Parse EDGAR Atom feed for Form 4 filings."""
    filings = []
    cutoff = datetime.now(timezone.utc) - timedelta(days=days_back)
    
    try:
        root = ElementTree.fromstring(xml_text)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        
        for entry in root.findall("atom:entry", ns):
            title = entry.findtext("atom:title", "", ns)
            updated = entry.findtext("atom:updated", "", ns)
            link_el = entry.find("atom:link", ns)
            link = link_el.get("href", "") if link_el is not None else ""
            summary = entry.findtext("atom:summary", "", ns)
            
            if "4" not in title:
                continue
            
            # Parse date
            try:
                dt = datetime.fromisoformat(updated.replace("Z", "+00:00"))
                if dt < cutoff:
                    continue
            except (ValueError, TypeError):
                pass
            
            # Extract company and CIK from title
            # Title format: "4 - Company Name (0001234567) (Reporting)"
            match = re.match(r"4\s*-\s*(.+?)\s*\((\d+)\)", title)
            company = match.group(1).strip() if match else title
            cik = match.group(2) if match else ""
            
            # Extract accession number from link
            acc_match = re.search(r"/(\d{10}-\d{2}-\d{6})", link)
            accession = acc_match.group(1) if acc_match else ""
            
            filings.append({
                "filing_type": "4",
                "file_date": updated[:10],
                "company_name": company,
                "cik": cik,
                "accession": accession,
                "link": link,
                "summary": summary,
            })
            
    except ElementTree.ParseError as e:
        logger.error(f"XML parse error: {e}")
    
    return filings


def parse_form4_filing(filing: Dict) -> Optional[Dict]:
    """
    Parse a Form 4 filing to extract insider transaction details.
    Returns structured data about who bought/sold, how much, at what price.
    """
    accession = filing.get("accession", "")
    cik = filing.get("cik", "")
    
    if not accession or not cik:
        return None
    
    _rate_limit()
    
    # Try to fetch the XML version of the Form 4
    accession_no_dashes = accession.replace("-", "")
    xml_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession_no_dashes}/{accession}.txt"
    
    try:
        resp = requests.get(xml_url, headers=SEC_HEADERS, timeout=30)
        if resp.status_code != 200:
            return None
        
        text = resp.text
        
        # Try to find the XML document within the filing
        xml_match = re.search(r'<ownershipDocument>(.*?)</ownershipDocument>', text, re.DOTALL)
        if not xml_match:
            # Maybe the whole response is XML
            if '<ownershipDocument>' in text:
                xml_text = text
            else:
                return _parse_form4_from_text(text, filing)
        else:
            xml_text = f"<ownershipDocument>{xml_match.group(1)}</ownershipDocument>"
        
        return _parse_form4_xml(xml_text, filing)
        
    except Exception as e:
        logger.debug(f"Error parsing Form 4 filing {accession}: {e}")
        return None


def _parse_form4_xml(xml_text: str, filing: Dict) -> Optional[Dict]:
    """Parse Form 4 XML to extract transaction details."""
    try:
        root = ElementTree.fromstring(xml_text)
        
        # Get reporting owner
        owner_el = root.find(".//reportingOwnerId")
        owner_name = ""
        if owner_el is not None:
            owner_name = owner_el.findtext("rptOwnerName", "")
        
        # Get issuer
        issuer_el = root.find(".//issuer")
        issuer_name = ""
        issuer_ticker = ""
        issuer_cik = ""
        if issuer_el is not None:
            issuer_name = issuer_el.findtext("issuerName", "")
            issuer_ticker = issuer_el.findtext("issuerTradingSymbol", "")
            issuer_cik = issuer_el.findtext("issuerCik", "")
        
        # Get transactions
        transactions = []
        
        # Non-derivative transactions
        for tx in root.findall(".//nonDerivativeTransaction"):
            transaction = _extract_transaction(tx, is_derivative=False)
            if transaction:
                transactions.append(transaction)
        
        # Derivative transactions
        for tx in root.findall(".//derivativeTransaction"):
            transaction = _extract_transaction(tx, is_derivative=True)
            if transaction:
                transactions.append(transaction)
        
        if not transactions:
            return None
        
        # Determine if this is a purchase or option exercise
        has_purchase = any(t["tx_code"] == "P" for t in transactions)
        has_sale = any(t["tx_code"] == "S" for t in transactions)
        has_option_exercise = any(t["tx_code"] in ("M", "C", "E") for t in transactions)
        
        total_value = sum(t.get("value", 0) for t in transactions)
        
        return {
            "owner_name": owner_name,
            "issuer_name": issuer_name,
            "ticker": issuer_ticker.upper() if issuer_ticker else "",
            "issuer_cik": issuer_cik,
            "file_date": filing.get("file_date", ""),
            "transactions": transactions,
            "has_purchase": has_purchase,
            "has_sale": has_sale,
            "has_option_exercise": has_option_exercise,
            "total_value": total_value,
            "accession": filing.get("accession", ""),
        }
        
    except ElementTree.ParseError:
        return None


def _extract_transaction(tx_element, is_derivative: bool = False) -> Optional[Dict]:
    """Extract a single transaction from Form 4 XML."""
    try:
        # Security title
        title_el = tx_element.find(".//securityTitle/value")
        title = title_el.text if title_el is not None else ""
        
        # Transaction date
        date_el = tx_element.find(".//transactionDate/value")
        tx_date = date_el.text if date_el is not None else ""
        
        # Transaction code (P=Purchase, S=Sale, M=Exercise, C=Conversion, A=Award, etc.)
        code_el = tx_element.find(".//transactionCoding/transactionCode")
        tx_code = code_el.text if code_el is not None else ""
        
        # Shares
        shares_el = tx_element.find(".//transactionAmounts/transactionShares/value")
        shares = float(shares_el.text) if shares_el is not None and shares_el.text else 0
        
        # Price per share
        price_el = tx_element.find(".//transactionAmounts/transactionPricePerShare/value")
        price = float(price_el.text) if price_el is not None and price_el.text else 0
        
        # Acquired or disposed
        ad_el = tx_element.find(".//transactionAmounts/transactionAcquiredDisposedCode/value")
        acquired_disposed = ad_el.text if ad_el is not None else ""
        
        value = shares * price
        
        return {
            "security_title": title,
            "tx_date": tx_date,
            "tx_code": tx_code,
            "shares": shares,
            "price": price,
            "value": value,
            "acquired_disposed": acquired_disposed,  # A=acquired, D=disposed
            "is_derivative": is_derivative,
            "is_purchase": tx_code == "P" and acquired_disposed == "A",
            "is_sale": tx_code == "S" and acquired_disposed == "D",
            "is_option_exercise": tx_code in ("M", "C", "E"),
        }
    except (ValueError, TypeError):
        return None


def _parse_form4_from_text(text: str, filing: Dict) -> Optional[Dict]:
    """Fallback: parse Form 4 from plain text."""
    # Extract ticker from text
    ticker_match = re.search(r'ISSUER TRADING SYMBOL:\s*(\S+)', text, re.IGNORECASE)
    ticker = ticker_match.group(1).upper() if ticker_match else ""
    
    owner_match = re.search(r'REPORTING OWNER:\s*(.+)', text, re.IGNORECASE)
    owner = owner_match.group(1).strip() if owner_match else ""
    
    if not ticker:
        return None
    
    return {
        "owner_name": owner,
        "issuer_name": filing.get("company_name", ""),
        "ticker": ticker,
        "issuer_cik": filing.get("cik", ""),
        "file_date": filing.get("file_date", ""),
        "transactions": [],
        "has_purchase": False,
        "has_sale": False,
        "has_option_exercise": False,
        "total_value": 0,
        "accession": filing.get("accession", ""),
    }


def detect_insider_clusters(parsed_filings: List[Dict], 
                             min_insiders: int = None,
                             window_days: int = None) -> List[Dict]:
    """
    Detect insider buying clusters: multiple insiders buying the same stock
    within a time window. This is a high-conviction bullish signal.
    
    Returns list of cluster signals sorted by conviction.
    """
    min_insiders = min_insiders or cfg.INSIDER_CLUSTER_MIN
    window_days = window_days or cfg.INSIDER_CLUSTER_DAYS
    
    # Group purchases by ticker
    purchases_by_ticker = defaultdict(list)
    
    for filing in parsed_filings:
        ticker = filing.get("ticker", "")
        if not ticker:
            continue
        
        if filing.get("has_purchase"):
            purchases_by_ticker[ticker].append(filing)
    
    # Detect clusters
    clusters = []
    
    for ticker, purchases in purchases_by_ticker.items():
        if len(purchases) < min_insiders:
            continue
        
        # Group by date proximity
        unique_owners = set()
        total_value = 0
        dates = []
        
        for p in purchases:
            unique_owners.add(p.get("owner_name", ""))
            total_value += p.get("total_value", 0)
            if p.get("file_date"):
                dates.append(p["file_date"])
        
        if len(unique_owners) < min_insiders:
            continue
        
        # Calculate conviction score
        num_insiders = len(unique_owners)
        value_score = min(total_value / 500000, 30)  # Up to 30 points for value
        insider_score = min(num_insiders * 15, 40)    # Up to 40 points for insiders
        
        # Recency bonus
        recency_score = 0
        if dates:
            try:
                latest = max(datetime.strptime(d, "%Y-%m-%d") for d in dates if d)
                days_ago = (datetime.now() - latest).days
                recency_score = max(0, 20 - days_ago * 2)  # Up to 20 points
            except (ValueError, TypeError):
                pass
        
        conviction = min(int(value_score + insider_score + recency_score), 100)
        
        clusters.append({
            "ticker": ticker,
            "signal_type": "insider_cluster_buy",
            "direction": "bullish",
            "conviction": conviction,
            "num_insiders": num_insiders,
            "insider_names": list(unique_owners),
            "total_value": total_value,
            "filing_dates": sorted(dates),
            "sources": [f"SEC Form 4 ({num_insiders} insiders)"],
            "reasoning": (
                f"{num_insiders} corporate insiders purchased {ticker} stock "
                f"(total value: ${total_value:,.0f}). "
                f"Insiders: {', '.join(list(unique_owners)[:3])}"
                f"{'...' if num_insiders > 3 else ''}"
            ),
        })
    
    # Also find individual large insider purchases
    for ticker, purchases in purchases_by_ticker.items():
        for p in purchases:
            if p.get("total_value", 0) >= 500000:  # $500k+ single insider buy
                conviction = min(int(p["total_value"] / 100000 * 5 + 20), 85)
                clusters.append({
                    "ticker": ticker,
                    "signal_type": "insider_large_buy",
                    "direction": "bullish",
                    "conviction": conviction,
                    "num_insiders": 1,
                    "insider_names": [p.get("owner_name", "unknown")],
                    "total_value": p["total_value"],
                    "filing_dates": [p.get("file_date", "")],
                    "sources": ["SEC Form 4 (large purchase)"],
                    "reasoning": (
                        f"Large insider purchase: {p.get('owner_name', 'Unknown')} "
                        f"bought ${p['total_value']:,.0f} of {ticker}"
                    ),
                })
    
    # Sort by conviction
    clusters.sort(key=lambda x: x["conviction"], reverse=True)
    
    return clusters


def scan_insider_activity(days_back: int = 3) -> List[Dict]:
    """
    Main entry point: scan SEC EDGAR for insider activity and return signals.
    """
    logger.info(f"Scanning SEC EDGAR for Form 4 filings (last {days_back} days)...")
    
    # Fetch filings
    filings = fetch_recent_form4_filings(days_back=days_back)
    logger.info(f"Found {len(filings)} Form 4 filings")
    
    # Parse filings (limit to avoid hitting rate limits)
    parsed = []
    max_parse = min(len(filings), 50)  # Parse up to 50
    
    for filing in filings[:max_parse]:
        result = parse_form4_filing(filing)
        if result and result.get("ticker"):
            parsed.append(result)
            if result.get("has_purchase"):
                logger.debug(
                    f"  Insider BUY: {result['owner_name']} -> {result['ticker']} "
                    f"(${result['total_value']:,.0f})"
                )
    
    logger.info(f"Parsed {len(parsed)} filings with tickers")
    
    # Detect clusters
    signals = detect_insider_clusters(parsed)
    logger.info(f"Found {len(signals)} insider signals")
    
    return signals


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(name)s | %(message)s")
    signals = scan_insider_activity(days_back=5)
    print(f"\n{'='*60}")
    print(f"SEC Insider Signals: {len(signals)}")
    print(f"{'='*60}")
    for s in signals[:10]:
        print(f"  {s['ticker']:6s} | {s['signal_type']:25s} | "
              f"Conviction: {s['conviction']:3d} | "
              f"Value: ${s['total_value']:>12,.0f} | "
              f"Insiders: {s['num_insiders']}")
        print(f"    {s['reasoning']}")
