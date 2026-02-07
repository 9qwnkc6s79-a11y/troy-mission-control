#!/bin/bash

# Calendar Viewer - Troy's Task Calendar

echo "🗓️ Troy Task Calendar"
echo "====================="

# Check for optional command
COMMAND=${1:-"overview"}

case $COMMAND in
    "overview")
        echo "📊 Task Overview:"
        cd $(dirname "$0")
        node api.js list
        echo ""
        echo "💡 Open 'calendar/viewer.html' in browser for full calendar view"
        echo "💡 Use './view.sh tasks' for detailed task list"
        echo "💡 Use './view.sh serve' to start API server"
        ;;
    
    "tasks")
        echo "📋 Detailed Task List:"
        cd $(dirname "$0")
        node api.js list
        ;;
    
    "json")
        echo "📄 Exporting calendar data to JSON..."
        cd $(dirname "$0")
        node api.js json calendar-data.json
        ;;
    
    "serve")
        echo "🌐 Starting Calendar API server..."
        cd $(dirname "$0")
        node api.js serve
        ;;
    
    *)
        echo "Usage: $0 [command]"
        echo "Commands:"
        echo "  overview - Show task overview (default)"
        echo "  tasks    - Detailed task list"
        echo "  json     - Export to JSON file"
        echo "  serve    - Start API server"
        ;;
esac