"""Trade logging — writes every trade to a daily CSV file."""

import csv
import os
from datetime import datetime, timezone
from pathlib import Path

TRADES_DIR = Path(__file__).parent / "trades"


def _ensure_dir():
    TRADES_DIR.mkdir(exist_ok=True)


def _today_file() -> Path:
    return TRADES_DIR / f"trades_{datetime.now(timezone.utc).strftime('%Y-%m-%d')}.csv"


FIELDNAMES = [
    "timestamp",
    "symbol",
    "side",
    "qty",
    "price",
    "order_id",
    "stop_loss",
    "take_profit",
    "signal_rsi",
    "signal_ema",
    "confidence",
    "pnl",
    "note",
]


def log_trade(
    symbol: str,
    side: str,
    qty: float,
    price: float,
    order_id: str = "",
    stop_loss: float = 0.0,
    take_profit: float = 0.0,
    signal_rsi: float = 0.0,
    signal_ema: float = 0.0,
    confidence: str = "",
    pnl: float = 0.0,
    note: str = "",
):
    """Append one row to today's trade CSV."""
    _ensure_dir()
    path = _today_file()
    write_header = not path.exists()

    with open(path, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        if write_header:
            writer.writeheader()
        writer.writerow(
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "symbol": symbol,
                "side": side,
                "qty": qty,
                "price": price,
                "order_id": order_id,
                "stop_loss": stop_loss,
                "take_profit": take_profit,
                "signal_rsi": signal_rsi,
                "signal_ema": signal_ema,
                "confidence": confidence,
                "pnl": pnl,
                "note": note,
            }
        )


def recent_trades(n: int = 20) -> list[dict]:
    """Return the last *n* trades across all daily files."""
    _ensure_dir()
    files = sorted(TRADES_DIR.glob("trades_*.csv"), reverse=True)
    rows: list[dict] = []
    for f in files:
        with open(f) as fh:
            reader = csv.DictReader(fh)
            rows.extend(list(reader))
        if len(rows) >= n:
            break
    rows.sort(key=lambda r: r.get("timestamp", ""), reverse=True)
    return rows[:n]
