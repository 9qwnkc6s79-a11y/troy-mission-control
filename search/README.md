# Global Search System - Troy's Memory & Workspace Search

## Overview
Unified search across all of Troy's memories, activity logs, conversations, and workspace documents. Find any information quickly across the entire operational history.

## Search Sources
- **Memory Files**: Daily logs (`memory/YYYY-MM-DD.md`) and curated memories (`MEMORY.md`)
- **Activity Logs**: Complete action history from activity feed system
- **Workspace Files**: All project documents, configuration, and notes
- **Task Data**: Scheduled tasks and cron job descriptions
- **System Files**: SOUL.md, USER.md, TOOLS.md, and other workspace context

## Features
- **Full-text search** with relevance scoring
- **Source filtering** (memories vs activities vs documents)
- **Date range filtering** for temporal searches
- **Content preview** with highlighted matches
- **Quick navigation** to source files
- **Search suggestions** based on recent queries

## Structure
- `search/viewer.html` - Interactive search interface
- `search/indexer.js` - Build search index from all sources
- `search/api.js` - Search API and data management
- `search/README.md` - This documentation

## Usage
Global search provides the missing piece for navigating Troy's complete operational memory. Instead of manually browsing files, find anything instantly by content, context, or keywords.