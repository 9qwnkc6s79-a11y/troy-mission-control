#!/usr/bin/env python3
"""
Agent Management Dashboard Launcher
Opens the dashboard in your default browser and optionally starts a simple HTTP server.
"""
import subprocess
import webbrowser
import os
import sys
from pathlib import Path

def launch_dashboard():
    # Get the directory of this script
    script_dir = Path(__file__).parent
    dashboard_path = script_dir / "dashboard.html"
    
    if not dashboard_path.exists():
        print("❌ Dashboard not found. Make sure dashboard.html exists.")
        return
    
    print("🚀 Launching Agent Management Dashboard...")
    
    # Option 1: Open directly in browser (works for most browsers)
    try:
        file_url = f"file://{dashboard_path.absolute()}"
        print(f"📂 Opening: {file_url}")
        webbrowser.open(file_url)
        print("✅ Dashboard opened in your default browser!")
        print("\n💡 If you see CORS errors, run with --server flag to start HTTP server")
    except Exception as e:
        print(f"❌ Failed to open browser: {e}")

def start_server():
    """Start a simple HTTP server for the dashboard"""
    script_dir = Path(__file__).parent
    
    print("🌐 Starting HTTP server for Agent Management Dashboard...")
    print("📍 Server will run at: http://localhost:8000")
    
    try:
        # Change to the agent-management directory
        os.chdir(script_dir)
        
        # Start Python HTTP server
        subprocess.run([
            sys.executable, "-m", "http.server", "8000"
        ])
    except KeyboardInterrupt:
        print("\n⏹️  Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")

def main():
    print("🤖 Agent Management Dashboard Launcher")
    print("=" * 45)
    
    # Check command line arguments
    if "--server" in sys.argv or "-s" in sys.argv:
        start_server()
    elif "--help" in sys.argv or "-h" in sys.argv:
        print("""
Usage:
  python3 launch.py          Open dashboard in browser
  python3 launch.py --server Start HTTP server (recommended for full functionality)
  python3 launch.py --help   Show this help
  
The dashboard provides:
  🎛️  Agent status monitoring
  📋 Task assignment interface  
  ⏰ Cron job scheduling
  📊 Performance analytics
        """)
    else:
        launch_dashboard()
        
        print("\n" + "="*50)
        print("🛠️  QUICK COMMANDS:")
        print("View agent status: python3 quick-status.py")
        print("Message agents:    python3 quick-communicate.py") 
        print("Manage cron jobs:  python3 quick-cron.py")
        print("Start HTTP server: python3 launch.py --server")

if __name__ == "__main__":
    main()