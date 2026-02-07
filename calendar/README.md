# Calendar System - Troy's Scheduled Tasks

## Overview
Visual calendar interface showing all scheduled tasks, cron jobs, and reminders in an easy-to-read weekly/monthly view.

## Structure
- `calendar/viewer.html` - Interactive calendar dashboard
- `calendar/api.js` - Data loader for cron jobs and scheduled tasks
- `calendar/README.md` - This documentation

## Data Sources
- **Cron Jobs**: From Clawdbot's cron system (gateway cron jobs)
- **Heartbeat Tasks**: Recurring tasks from heartbeat configuration
- **Future**: Could integrate with external calendars (Google Calendar, etc.)

## Features
- **Weekly View**: Shows next 4 weeks of scheduled tasks
- **Monthly View**: Full month calendar with task markers
- **Task Details**: Click tasks to see full details and context
- **Status Indicators**: Show job status (enabled/disabled, last run, next run)
- **Quick Actions**: Enable/disable jobs, view logs

## Task Types
- **Cron Jobs**: Exact scheduled reminders and automations
- **Heartbeat Tasks**: Recurring checks (rotate through HEARTBEAT.md tasks)
- **One-shot Reminders**: Single-time scheduled events

## Usage
Open `calendar/viewer.html` in browser for visual scheduling overview. Perfect for reviewing what's coming up and managing task timing.