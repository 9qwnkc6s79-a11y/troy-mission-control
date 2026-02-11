# 🤖 Agent Management Tools

Your complete toolkit for managing your agent ecosystem.

## 🎯 Quick Tools (Available Now)

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

## 🚀 Full Management System (Building...)

A specialized sub-agent is building your comprehensive web dashboard:

- **Real-time agent monitoring**
- **Cost analytics and optimization**
- **Agent personality management (SOUL.md editing)**  
- **Inter-agent workflow automation**
- **Advanced cron scheduling interface**
- **Agent performance analytics**

**ETA: 10-15 minutes**

## 🎨 Current Agent Fleet

| Agent | Purpose | Status |
|-------|---------|--------|
| **Troy** | Main assistant | 🟢 Active |
| **Health Tracker** | Fitness/nutrition logging | 🟢 Active |
| **Coffee Team** | Boundaries Coffee operations | 🟡 Idle |
| **Developer Chat** | Technical discussions | 🟡 Idle |
| **Fitbod Project** | Fitness app development | 🔴 Inactive |
| **VivPatch Team** | Wellness patch brand | 🔴 Inactive |

## 📋 Active Reminders

- **6:30 AM** - Daily weigh-in
- **12:00 PM** - Lunch logging  
- **6:00 PM** - Dinner logging
- **Feb 1** - VivPatch domain registration
- **Jan 26** - Little Elm store tasks

## 🔧 Agent Management Best Practices

### Cost Control
- Monitor daily token usage with `quick-status.py`
- Archive inactive agents to save on context costs
- Use lower-cost models (Sonnet) for routine tasks
- Reserve Opus for complex reasoning only

### Performance Optimization  
- Review agent memory files regularly
- Clear old conversations from inactive agents
- Consolidate similar agents when possible
- Use cron for scheduled tasks vs. constant polling

### Security & Organization
- Keep agent SOUL.md files updated with clear purposes
- Use specific agent names and descriptions
- Regular backup of agent memory and configurations
- Monitor agent communications for security

## 🎯 Quick Commands Reference

```bash
# View all sessions
openclaw sessions list

# Send message to specific agent
openclaw sessions send --session-key "agent:main:telegram:group:-5251868903" --message "Hello"

# List cron jobs
openclaw cron list

# Run cron job immediately  
openclaw cron run --job-id "c3b46ca1-980f-4638-9d46-ce4407be6366"

# Create new reminder
openclaw cron add --job '{...}'
```

**More tools and documentation coming as the full system builds!** 🚀