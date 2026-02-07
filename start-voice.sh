#!/bin/bash
# OpenClaw Voice Assistant Startup Script

cd "$(dirname "$0")"

echo "🎙️  Starting OpenClaw Voice Assistant..."
echo "📂 Working directory: $(pwd)"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Install required Python packages if needed
echo "📦 Checking Python dependencies..."
python3 -c "import websockets, asyncio" 2>/dev/null || {
    echo "📦 Installing websockets..."
    pip3 install websockets
}

# Start the voice server
echo "🚀 Starting voice WebSocket server..."
python3 voice-server.py &
SERVER_PID=$!

# Open the voice assistant in the default browser
echo "🌐 Opening voice assistant interface..."
if command -v open &> /dev/null; then
    open voice-assistant.html
elif command -v xdg-open &> /dev/null; then
    xdg-open voice-assistant.html
fi

echo "✅ Voice assistant is ready!"
echo "   📱 Interface: file://$(pwd)/voice-assistant.html"
echo "   🔌 WebSocket: ws://localhost:8080/ws"
echo "   🛑 Stop server: kill $SERVER_PID or Ctrl+C"

# Wait for server to exit
wait $SERVER_PID
echo "🛑 Voice server stopped."