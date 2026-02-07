# 🏛️ Troy Mission Control

Complete operational visibility and control system for AI agents.

## Features

### 📊 Activity Feed
- Real-time logging of every action Troy takes
- Token usage tracking and estimation
- Interactive web dashboard with search and filtering
- Command-line tools for quick access

### 📅 Task Calendar  
- Visual timeline of all scheduled tasks and cron jobs
- Weekly and monthly views
- Real-time integration with gateway cron system
- Task status tracking and management

### 🔍 Global Search
- Unified search across memories, activity logs, and workspace documents
- Full-text search with relevance scoring
- 154+ documents indexed with 3,600+ searchable terms
- Advanced filtering by type, date, and content

## Quick Start

Open `index.html` in your browser to access the main dashboard, or visit the individual components:

- **Mission Control Dashboard**: `index.html`
- **Activity Feed**: `activity/viewer.html` 
- **Task Calendar**: `calendar/viewer.html`
- **Global Search**: `search/viewer.html`

## Architecture

Built as a static web application with:
- Pure HTML/CSS/JavaScript frontend
- Node.js backend APIs for data processing
- JSON-based data storage and indexing
- Modular component architecture

## Components

- `activity/` - Activity feed system with logging and visualization
- `calendar/` - Task calendar with cron job integration  
- `search/` - Global search with full-text indexing
- `memory/` - Persistent memory and daily logs
- System configuration files (SOUL.md, USER.md, etc.)

## Deployment

Deployed on Vercel with automatic updates from GitHub repository.

---

*Built for Daniel Keene | Boundaries Coffee Operations*