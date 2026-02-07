# Activity Feed System

## Overview
Comprehensive logging of every significant action Troy performs, providing full visibility into autonomous operations.

## Structure
- `activity/logs/YYYY-MM-DD.jsonl` - Daily activity logs in JSONL format
- `activity/viewer.html` - Simple HTML viewer for browsing activity
- `activity/README.md` - This documentation

## Log Entry Format
```json
{
  "timestamp": "2026-02-06T16:48:30.123Z",
  "session": "session_key",
  "type": "tool_call|file_op|external|heartbeat|decision|error",
  "action": "read_file|web_search|browser_action|etc",
  "details": {
    "tool": "Read",
    "path": "/path/to/file",
    "success": true,
    "tokens_estimated": 150
  },
  "context": "Brief description of why this action was taken",
  "result": "Summary of outcome"
}
```

## Action Types
- **tool_call**: Any function/tool invocation
- **file_op**: Read, write, edit operations
- **external**: Web searches, browser automation, API calls
- **heartbeat**: Periodic check activities
- **decision**: Key decision points or branching logic
- **error**: Failed operations or issues

## Usage
Activity is logged automatically. Use the HTML viewer to browse, search, and analyze patterns.