#!/bin/bash
# Start Options Trading Bot
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Check if already running
if [ -f bot.pid ]; then
    PID=$(cat bot.pid)
    if kill -0 "$PID" 2>/dev/null; then
        echo "Bot is already running (PID: $PID)"
        exit 1
    fi
fi

# Create logs directory
mkdir -p logs

echo "🎯 Starting Options Trading Bot..."
nohup python3 bot.py > logs/stdout.log 2>&1 &
PID=$!
echo $PID > bot.pid
echo "Bot started with PID: $PID"
echo "Logs: $DIR/logs/options_bot.log"
echo "Stdout: $DIR/logs/stdout.log"
