#!/usr/bin/env python3
"""
Quick Cron Job Manager
Run: python3 agent-management/quick-cron.py
"""
import json
import subprocess
import sys
from datetime import datetime

def run_openclaw_command(command, input_data=None):
    """Run openclaw command and return JSON result"""
    try:
        process_input = json.dumps(input_data) if input_data else None
        result = subprocess.run(['openclaw'] + command, 
                              input=process_input, 
                              capture_output=True, 
                              text=True)
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            return None
        return json.loads(result.stdout) if result.stdout.strip() else None
    except Exception as e:
        print(f"Command failed: {e}")
        return None

def list_cron_jobs():
    """List all cron jobs"""
    cron_data = run_openclaw_command(['cron', 'list', '--json'])
    if not cron_data:
        print("❌ Failed to get cron data")
        return []
    
    jobs = []
    print("\n⏰ CRON JOBS:")
    print("-" * 40)
    
    for i, job in enumerate(cron_data.get('jobs', []), 1):
        name = job.get('name', 'Unnamed')
        enabled = "✅" if job.get('enabled', False) else "❌"
        schedule = job.get('schedule', {}).get('expr', 'Unknown')
        job_id = job.get('id', '')
        
        next_run = job.get('state', {}).get('nextRunAtMs', 0)
        if next_run:
            next_run_dt = datetime.fromtimestamp(next_run / 1000)
            next_run_str = next_run_dt.strftime('%m/%d %H:%M')
        else:
            next_run_str = "Unknown"
        
        jobs.append({
            'index': i,
            'name': name,
            'id': job_id,
            'enabled': job.get('enabled', False),
            'schedule': schedule
        })
        
        print(f"{i}. {enabled} {name}")
        print(f"   Schedule: {schedule} | Next: {next_run_str}")
        print()
    
    return jobs

def toggle_job(job_id, current_enabled):
    """Enable/disable a cron job"""
    new_state = not current_enabled
    action = "enable" if new_state else "disable"
    
    patch_data = {"enabled": new_state}
    
    result = subprocess.run([
        'openclaw', 'cron', 'update',
        '--job-id', job_id,
        '--patch', json.dumps(patch_data)
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        status = "enabled" if new_state else "disabled"
        print(f"✅ Job {status} successfully!")
    else:
        print(f"❌ Failed to {action} job: {result.stderr}")

def run_job_now(job_id):
    """Trigger a cron job immediately"""
    result = subprocess.run([
        'openclaw', 'cron', 'run',
        '--job-id', job_id
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Job triggered successfully!")
    else:
        print(f"❌ Failed to run job: {result.stderr}")

def create_quick_reminder():
    """Create a quick one-time reminder"""
    print("\n📝 CREATE QUICK REMINDER")
    print("-" * 25)
    
    reminder_text = input("Enter reminder text: ").strip()
    if not reminder_text:
        print("❌ No reminder text entered")
        return
    
    print("\nWhen? (examples: 'in 30 minutes', 'tomorrow 9am', 'next monday 2pm')")
    when = input("Time: ").strip()
    if not when:
        print("❌ No time entered")
        return
    
    # For now, just show what would be created
    # In full implementation, this would parse time and create cron job
    print(f"\n📋 REMINDER PREVIEW:")
    print(f"Text: {reminder_text}")
    print(f"When: {when}")
    print("\n⚠️  Full time parsing coming in dashboard - use openclaw cron directly for now")

def main():
    print("⏰ CRON JOB MANAGER")
    print("=" * 30)
    
    while True:
        jobs = list_cron_jobs()
        if not jobs:
            return
        
        print("\nOptions:")
        print("1. Enable/Disable job")
        print("2. Run job now")
        print("3. Create reminder")
        print("q. Quit")
        
        choice = input("\nSelect option: ").strip()
        
        if choice.lower() == 'q':
            break
        elif choice == '1':
            job_num = input("Enter job number to toggle: ").strip()
            try:
                job_idx = int(job_num) - 1
                if 0 <= job_idx < len(jobs):
                    job = jobs[job_idx]
                    toggle_job(job['id'], job['enabled'])
                else:
                    print("❌ Invalid job number")
            except ValueError:
                print("❌ Please enter a valid number")
        elif choice == '2':
            job_num = input("Enter job number to run: ").strip()
            try:
                job_idx = int(job_num) - 1
                if 0 <= job_idx < len(jobs):
                    job = jobs[job_idx]
                    run_job_now(job['id'])
                else:
                    print("❌ Invalid job number")
            except ValueError:
                print("❌ Please enter a valid number")
        elif choice == '3':
            create_quick_reminder()
        else:
            print("❌ Invalid option")
        
        print("\n" + "="*50)

if __name__ == "__main__":
    main()