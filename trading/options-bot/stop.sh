#!/bin/bash
# Stop Options Trading Bot
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

if [ -f bot.pid ]; then
    PID=$(cat bot.pid)
    if kill -0 "$PID" 2>/dev/null; then
        echo "Stopping Options Trading Bot (PID: $PID)..."
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
    rm -f bot.pid
else
    echo "No PID file found. Bot may not be running."
    # Try to find and kill any running instances
    PIDS=$(pgrep -f "trading-bot-options/bot.py" | grep -v $$)
    if [ -n "$PIDS" ]; then
        echo "Found running instances: $PIDS"
        kill $PIDS 2>/dev/null
        echo "Killed."
    fi
fi
