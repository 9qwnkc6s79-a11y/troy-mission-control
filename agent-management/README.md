# 🤖 Agent Management System

Your comprehensive toolkit for managing your AI agent ecosystem.

## 🌐 Web Dashboard (Ready!)

Professional web interface for complete agent control:

```bash
# Launch dashboard in browser
python3 agent-management/launch.py

# Start HTTP server for full functionality  
python3 agent-management/launch.py --server
```

### 🎛️ **Dashboard Features:**
- **Agent Fleet Overview** - Real-time status of all 8 agents
- **Task Assignment Hub** - Select agents and assign tasks instantly
- **Performance Metrics** - Token usage, costs, and activity tracking
- **Quick Communication** - Send messages between agents
- **Status Indicators** - Active/Idle/Offline with live updates

### ⏰ **Schedule Manager:**
- **Visual Timeline** - Next 7 days of automated tasks
- **Quick Templates** - Health, business, meeting, and custom reminders
- **Cron Job Control** - Enable/disable/run/delete scheduled tasks
- **Smart Scheduling** - Daily, weekly, and custom cron expressions

## 🎯 Quick CLI Tools (Instant Use)

### 1. Agent Status Dashboard
```bash
python3 agent-management/quick-status.py
```
**Shows:**
- All active agents and their status
- Token usage and estimated costs
- Last activity times
- Model configurations

### 2. Agent Communication
```bash
python3 agent-management/quick-communicate.py
```
**Features:**
- Send messages to any agent
- Interactive agent selection
- Direct agent-to-agent communication

### 3. Cron Job Manager
```bash
python3 agent-management/quick-cron.py
```
**Manage:**
- Enable/disable scheduled jobs
- Run jobs immediately  
- View schedules and next run times
- Create quick reminders

## 🎨 Current Agent Fleet

| Agent | Purpose | Status | Daily Cost |
|-------|---------|--------|------------|
| **Troy** | Main assistant | 🟢 Active | $0.23 |
| **Health Tracker** | Fitness/nutrition logging | 🟢 Active | $0.89 |
| **Coffee Operations** | Boundaries Coffee management | 🟡 Idle | $1.24 |
| **Developer Assistant** | Technical discussions | 🟡 Idle | $0.91 |
| **Fitness App Dev** | Fitbod project | 🔴 Inactive | $0.26 |
| **VivPatch Team** | Wellness patch brand | 🔴 Inactive | $0.05 |

**Total Daily Cost: ~$3.58**

## 📋 Active Scheduled Tasks

- **6:30 AM** - Daily weigh-in reminder → Health Group
- **12:00 PM** - Lunch logging reminder → Health Group
- **6:00 PM** - Dinner logging reminder → Health Group
- **Feb 1 9:00 AM** - VivPatch domain registration reminder
- **Jan 26 9:00 AM** - Little Elm store tasks (completed)

## 🚀 Quick Start Guide

### 1. **View Your Agent Fleet:**
```bash
python3 agent-management/launch.py
```
Opens the main dashboard with all agent statuses, costs, and upcoming schedules.

### 2. **Assign a Task to an Agent:**
- Open dashboard → Select agent(s) → Enter task → Click "Assign Task"
- Or use: `python3 quick-communicate.py`

### 3. **Manage Schedules:**
- Dashboard → "Schedule" tab → View timeline, create reminders
- Or use: `python3 quick-cron.py`

### 4. **Check System Status:**
```bash
python3 quick-status.py
```

## 🔧 Agent Management Best Practices

### Cost Control
- Monitor daily token usage with dashboard or `quick-status.py`
- Archive inactive agents to save on context costs
- Use Sonnet for routine tasks, Opus for complex reasoning only
- Track costs in the dashboard analytics

### Performance Optimization  
- Review agent memory files regularly
- Clear old conversations from inactive agents
- Consolidate similar agents when possible
- Use scheduled tasks vs. constant polling

### Security & Organization
- Keep agent SOUL.md files updated with clear purposes
- Use specific agent names and descriptions
- Regular backup of agent configurations via dashboard
- Monitor inter-agent communications

## 🎯 OpenClaw Command Reference

```bash
# View all sessions
openclaw sessions list

# Send message to specific agent
openclaw sessions send --session-key "AGENT_KEY" --message "Hello"

# List cron jobs
openclaw cron list

# Run cron job immediately  
openclaw cron run --job-id "JOB_ID"

# Enable/disable cron job
openclaw cron update --job-id "JOB_ID" --patch '{"enabled": true}'

# Create new agent
openclaw sessions spawn --task "TASK_DESCRIPTION" --label "AGENT_NAME"
```

## 🛠️ Troubleshooting

### Dashboard Won't Load
```bash
# Try HTTP server mode
python3 launch.py --server
# Then open: http://localhost:8000
```

### CLI Tools Not Working
```bash
# Make sure scripts are executable
chmod +x agent-management/quick-*.py

# Check OpenClaw is running
openclaw status
```

### Agent Not Responding
```bash
# Check agent status
python3 quick-status.py

# Send test message
python3 quick-communicate.py
```

## 📊 System Requirements

- **Python 3.7+** for CLI tools and dashboard launcher
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **OpenClaw** running and accessible via command line
- **File system access** to workspace for memory management

## 🔄 Auto-Updates

The dashboard automatically refreshes agent status every 30 seconds and cron data every minute. CLI tools always fetch live data.

---

**🎯 Ready to manage your agent fleet like a pro!** 

Start with: `python3 agent-management/launch.py`