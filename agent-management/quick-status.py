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
        
        # Token rate calculation
        if tokens > 0:
            cost_per_1k = (estimated_cost / (tokens / 1000))
            print(f"   Rate: ${cost_per_1k:.4f}/1K tokens | Efficiency: {tokens/max(estimated_cost, 0.001):.0f} tokens/$")
        print()
    
    print(f"📈 TOTAL ESTIMATED COST: ${total_cost:.2f}")
    
    print(f"\n🔥 TOKEN USAGE BREAKDOWN")
    print("-" * 30)
    
    # Sort agents by token usage
    sorted_agents = sorted(sessions_data.get('sessions', []), 
                          key=lambda x: x.get('totalTokens', 0), reverse=True)
    
    total_tokens = sum(s.get('totalTokens', 0) for s in sorted_agents)
    
    print(f"Total Tokens: {total_tokens:,}")
    print(f"Average per Agent: {total_tokens // len(sorted_agents):,}")
    print(f"Tokens per $1: {total_tokens / max(total_cost, 0.01):.0f}")
    print()
    
    print("Top Token Consumers:")
    for i, session in enumerate(sorted_agents[:3]):
        name = session.get('displayName', 'Unknown')[:25]
        tokens = session.get('totalTokens', 0)
        percentage = (tokens / max(total_tokens, 1)) * 100
        print(f"  {i+1}. {name} - {tokens:,} ({percentage:.1f}%)")
    
    # Token efficiency recommendations
    print(f"\n💡 OPTIMIZATION RECOMMENDATIONS")
    print("-" * 35)
    
    # Find inefficient agents
    for session in sorted_agents[:2]:  # Top 2 token users
        tokens = session.get('totalTokens', 0)
        model = session.get('model', '')
        name = session.get('displayName', 'Unknown')[:20]
        
        if 'opus' in model.lower() and tokens > 50000:
            print(f"⚠️  Consider switching {name} to Sonnet for routine tasks")
        elif tokens > 100000:
            print(f"📊 {name} has high token usage - monitor conversations")
    
    if total_cost < 2:
        print("✅ Token usage is well-optimized")
    elif total_cost > 5:
        print("🔥 High token costs - consider consolidating agents")
    
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