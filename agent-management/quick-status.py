#!/usr/bin/env python3
"""
Quick Agent Status Checker
Run: python3 agent-management/quick-status.py
"""
import json
import subprocess
import sys
from datetime import datetime

def run_openclaw_command(command):
    """Run openclaw command and return JSON result"""
    try:
        result = subprocess.run(['openclaw'] + command, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            return None
        return json.loads(result.stdout) if result.stdout.strip() else None
    except Exception as e:
        print(f"Command failed: {e}")
        return None

def get_agent_status():
    """Get status of all agents and cron jobs"""
    print("🤖 AGENT STATUS DASHBOARD")
    print("=" * 50)
    
    # Get sessions
    sessions_data = run_openclaw_command(['sessions', 'list', '--json'])
    if not sessions_data:
        print("❌ Failed to get session data")
        return
    
    # Get cron jobs
    cron_data = run_openclaw_command(['cron', 'list', '--json'])
    if not cron_data:
        print("❌ Failed to get cron data")
        return
    
    print(f"\n📊 ACTIVE AGENTS ({len(sessions_data.get('sessions', []))})")
    print("-" * 30)
    
    total_cost = 0
    for session in sessions_data.get('sessions', []):
        name = session.get('displayName', 'Unknown')
        model = session.get('model', 'Unknown')
        tokens = session.get('totalTokens', 0)
        last_activity = session.get('updatedAt', 0)
        
        # Estimate daily cost (rough calculation)
        estimated_cost = (tokens / 1000) * 0.01  # Very rough estimate
        total_cost += estimated_cost
        
        # Activity status
        hours_since_activity = (datetime.now().timestamp() * 1000 - last_activity) / (1000 * 60 * 60)
        status = "🟢 Active" if hours_since_activity < 1 else "🟡 Idle" if hours_since_activity < 24 else "🔴 Inactive"
        
        print(f"{status} {name[:30]}")
        print(f"   Model: {model} | Tokens: {tokens:,} | Cost: ${estimated_cost:.3f}")
        print()
    
    print(f"📈 TOTAL ESTIMATED COST: ${total_cost:.2f}")
    
    print(f"\n⏰ CRON JOBS ({len(cron_data.get('jobs', []))})")
    print("-" * 20)
    
    for job in cron_data.get('jobs', []):
        name = job.get('name', 'Unnamed')
        enabled = "✅" if job.get('enabled', False) else "❌"
        schedule = job.get('schedule', {}).get('expr', 'Unknown')
        
        next_run = job.get('state', {}).get('nextRunAtMs', 0)
        if next_run:
            next_run_dt = datetime.fromtimestamp(next_run / 1000)
            next_run_str = next_run_dt.strftime('%m/%d %H:%M')
        else:
            next_run_str = "Unknown"
            
        print(f"{enabled} {name}")
        print(f"   Schedule: {schedule} | Next: {next_run_str}")
        print()

if __name__ == "__main__":
    get_agent_status()