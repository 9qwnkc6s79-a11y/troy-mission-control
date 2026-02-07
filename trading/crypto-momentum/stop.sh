#!/bin/bash
# Stop the trading bot
cd "$(dirname "$0")"

if [ ! -f logs/bot.pid ]; then
    echo "No PID file found. Bot may not be running."
    exit 1
fi

PID=$(cat logs/bot.pid)
if kill -0 "$PID" 2>/dev/null; then
    echo "Stopping bot (PID: $PID)..."
    kill "$PID"
    sleep 2
    if kill -0 "$PID" 2>/dev/null; then
        echo "Force killing..."
        kill -9 "$PID"
    fi
    echo "Bot stopped."
else
    echo "Bot is not running (stale PID: $PID)"
fi
rm -f logs/bot.pid
