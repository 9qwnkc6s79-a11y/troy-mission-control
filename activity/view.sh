#!/bin/bash

# Activity Feed Viewer - Troy's Activity Dashboard

# Default to show today's activity
DATE=${1:-$(date +%Y-%m-%d)}
LOG_FILE="logs/${DATE}.jsonl"

echo "🏛️ Troy Activity Feed - ${DATE}"
echo "================================================"

if [ ! -f "$LOG_FILE" ]; then
    echo "No activity logged for ${DATE}"
    exit 0
fi

# Count activities by type
echo "📊 Activity Summary:"
jq -r '.type' "$LOG_FILE" 2>/dev/null | sort | uniq -c | while read count type; do
    echo "   $type: $count"
done

echo ""
echo "📋 Recent Activities:"
echo "================================================"

# Show recent activities (most recent first)  
tail -r "$LOG_FILE" | head -10 | while IFS= read -r line; do
    if [ -n "$line" ]; then
        # Parse JSON and format output
        timestamp=$(echo "$line" | jq -r '.timestamp' | cut -d'T' -f2 | cut -d'.' -f1)
        type=$(echo "$line" | jq -r '.type')
        action=$(echo "$line" | jq -r '.action')
        context=$(echo "$line" | jq -r '.context')
        
        # Color coding for types
        case $type in
            "tool_call") color="\033[34m" ;;     # Blue
            "file_op") color="\033[35m" ;;       # Magenta  
            "external") color="\033[33m" ;;      # Yellow
            "heartbeat") color="\033[32m" ;;     # Green
            "decision") color="\033[36m" ;;      # Cyan
            "error") color="\033[31m" ;;         # Red
            *) color="\033[0m" ;;               # Default
        esac
        
        echo -e "${color}[$timestamp] $type${color}: $action\033[0m"
        echo "   $context"
        echo ""
    fi
done

echo "💡 Open 'activity/viewer.html' in browser for full interactive view"