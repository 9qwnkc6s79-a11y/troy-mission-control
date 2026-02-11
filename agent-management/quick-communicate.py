#!/usr/bin/env python3
"""
Quick Agent Communication Tool
Run: python3 agent-management/quick-communicate.py
"""
import json
import subprocess
import sys

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

def list_agents():
    """List available agents for communication"""
    sessions_data = run_openclaw_command(['sessions', 'list', '--json'])
    if not sessions_data:
        print("❌ Failed to get session data")
        return []
    
    agents = []
    print("\n🤖 AVAILABLE AGENTS:")
    print("-" * 30)
    
    for i, session in enumerate(sessions_data.get('sessions', []), 1):
        name = session.get('displayName', 'Unknown')
        key = session.get('key', '')
        kind = session.get('kind', 'other')
        
        agents.append({
            'index': i,
            'name': name,
            'key': key,
            'kind': kind
        })
        
        print(f"{i}. {name} ({kind})")
    
    return agents

def send_message_to_agent(agent_key, message):
    """Send a message to specific agent"""
    print(f"\n📤 Sending message to agent...")
    
    # Use openclaw sessions send command
    result = subprocess.run([
        'openclaw', 'sessions', 'send', 
        '--session-key', agent_key,
        '--message', message
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Message sent successfully!")
    else:
        print(f"❌ Failed to send message: {result.stderr}")

def main():
    print("🎯 AGENT COMMUNICATION TOOL")
    print("=" * 40)
    
    agents = list_agents()
    if not agents:
        return
    
    print("\nEnter the number of the agent you want to message (or 'q' to quit):")
    choice = input("> ").strip()
    
    if choice.lower() == 'q':
        return
    
    try:
        choice_idx = int(choice) - 1
        if 0 <= choice_idx < len(agents):
            selected_agent = agents[choice_idx]
            print(f"\n📝 Selected: {selected_agent['name']}")
            
            print("\nEnter your message:")
            message = input("> ").strip()
            
            if message:
                send_message_to_agent(selected_agent['key'], message)
            else:
                print("❌ No message entered")
        else:
            print("❌ Invalid selection")
    except ValueError:
        print("❌ Please enter a valid number")

if __name__ == "__main__":
    main()