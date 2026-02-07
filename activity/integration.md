# Activity Logging Integration

## Quick Start

The activity feed is now set up and functional:

1. **Logs**: `activity/logs/YYYY-MM-DD.jsonl` - One file per day in JSONL format
2. **Viewer**: `activity/viewer.html` - Open in browser to view activity
3. **Logger**: `activity/logger.js` - Command line and programmatic logging

## Manual Logging

```bash
# Log a tool call
cd activity && node logger.js "tool_call" "read_success" "Reading user configuration" '{"tool": "Read", "path": "USER.md", "tokens_estimated": 150}'

# Log a file operation  
cd activity && node logger.js "file_op" "write_success" "Creating new memory file" '{"operation": "write", "path": "memory/2026-02-06.md", "size_bytes": 1024}'

# Log external action
cd activity && node logger.js "external" "web_search" "Searching for business information" '{"service": "brave", "query": "coffee shop marketing", "results": 8}'

# Log a decision point
cd activity && node logger.js "decision" "heartbeat_action" "Deciding whether to check email during heartbeat" '{"decision": "skip", "reasoning": "checked 30 minutes ago"}'
```

## Programmatic Usage (if needed later)

```javascript
const { logToolCall, logFileOp, logExternal } = require('./activity/logger');

// Log tool calls
logToolCall('Read', {path: 'HEARTBEAT.md'}, true, 'File loaded successfully', 'Heartbeat check');

// Log file operations  
logFileOp('write', 'memory/notes.md', true, 'Saving daily notes', 2048);

// Log external actions
logExternal('brave', 'search', true, 'Market research', {query: 'coffee trends', results: 12});
```

## Integration Points

Key places to add logging:
- **Heartbeats**: Log what checks are performed and results
- **File Operations**: Read/write/edit operations on important files  
- **External Actions**: Web searches, browser automation, API calls
- **Decision Points**: When choosing between different actions
- **Errors**: Failed operations or unexpected issues

## Current Status

✅ Basic logging system implemented
✅ HTML viewer created  
✅ Command-line interface working
✅ First activity logged

The system is ready to use. Start logging activities manually, and over time we can automate the integration into the workflow.