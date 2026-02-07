#!/bin/bash
# Start the trading bot in the background
cd "$(dirname "$0")"

# Check if already running
if [ -f logs/bot.pid ]; then
    PID=$(cat logs/bot.pid)
    if kill -0 "$PID" 2>/dev/null; then
        echo "Bot is already running (PID: $PID)"
        exit 1
    fi
fi

echo "Starting Crypto Trading Bot..."
nohup python3 bot.py > logs/bot_stdout.log 2>&1 &
echo $! > logs/bot.pid
echo "Bot started with PID: $!"
echo "Logs: tail -f logs/bot.log"
echo "Status: python3 status.py"
