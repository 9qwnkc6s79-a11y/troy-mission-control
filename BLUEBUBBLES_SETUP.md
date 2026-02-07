# BlueBubbles Setup for iMessage Integration

## Overview

BlueBubbles enables access to iMessage/SMS from non-Apple devices and APIs. This integration allows OpenClaw to send and receive text messages through your Mac.

## Requirements

- **macOS with iMessage access** (required)
- **Messages app signed in** to your Apple ID
- **Full Disk Access** permissions
- **Accessibility** permissions

## Installation

### 1. Download BlueBubbles Server

Go to [BlueBubbles Server Releases](https://github.com/BlueBubblesApp/BlueBubbles-Server/releases) and download the latest `BlueBubbles-Server.dmg`.

### 2. Install the App

1. Open the DMG file
2. Drag BlueBubbles Server to Applications
3. Launch BlueBubbles Server from Applications

### 3. Initial Setup

When first launching:

1. **Welcome Screen**: Click "Continue"
2. **Permissions**: Grant all requested permissions:
   - Open "System Preferences" → "Security & Privacy" → "Privacy"
   - Add BlueBubbles to "Full Disk Access"
   - Add BlueBubbles to "Accessibility"
3. **Configuration**:
   - Set server password (remember this!)
   - Port: 1234 (default)
   - Enable "Start Server on Login"
   - Enable "Auto-start on Boot"

### 4. Test Connection

1. In BlueBubbles app, go to "Server Management"
2. Click "Start Server"
3. Note the server URL (usually `http://localhost:1234`)
4. Test by visiting the URL in your browser

## Configuration

### Basic Settings

In BlueBubbles Server app:

1. **Server Tab**:
   - Port: 1234
   - Password: (set a secure password)
   - Auto-start: ✅ Enabled

2. **Features Tab**:
   - Private API: ❌ Disabled (uses AppleScript)
   - Helper Bundle: ❌ Disabled
   - Startup with macOS: ✅ Enabled

### API Access

1. Go to "Settings" → "API & Webhooks"
2. Enable "HTTP API Access"
3. Note your server password

## OpenClaw Integration

### Install Dependencies

```bash
pip install requests websockets
```

### Configure

```bash
cd /Users/danielkeene/openclaw
python3 imessage-integration.py
```

This will:
1. Test BlueBubbles connection
2. Set up configuration
3. Enable interactive testing

### Configuration File

Edit `~/.openclaw/bluebubbles_config.json`:

```json
{
  "server_url": "http://localhost:1234",
  "password": "your_bluebubbles_password",
  "websocket_url": "ws://localhost:1234",
  "auto_mark_read": true,
  "contact_aliases": {
    "mom": "+1234567890",
    "dad": "+0987654321",
    "work": "boss@company.com"
  }
}
```

## Testing

### Manual Test

```bash
python3 imessage-integration.py
```

Commands:
- `send mom Hello from OpenClaw!`
- `contacts` - List available contacts
- `recent` - Show recent messages
- `alias work +1234567890` - Add contact alias

### API Test

```bash
# Test with curl
curl -X POST http://localhost:1234/api/v1/message/text \
  -H "Authorization: your_password" \
  -H "Content-Type: application/json" \
  -d '{
    "chatGuid": null,
    "message": "Test from API",
    "method": "apple-script"
  }'
```

## Troubleshooting

### "Connection Failed" Error

1. **Check BlueBubbles is running**:
   ```bash
   curl http://localhost:1234/api/v1/server/info
   ```

2. **Verify permissions**:
   - System Preferences → Security & Privacy → Privacy
   - Full Disk Access: BlueBubbles Server ✅
   - Accessibility: BlueBubbles Server ✅

3. **Check Messages app**:
   - Messages app must be signed in
   - Try sending a manual message first

### "Authentication Failed" Error

- Check password in BlueBubbles Server settings
- Verify password matches in config file
- Try without password first (set empty in BlueBubbles)

### "Method not available" Error

- Private API might be required for some features
- Try with `"method": "apple-script"` first
- For Private API setup, see BlueBubbles documentation

### Messages Not Sending

1. **Check Messages app**:
   - Ensure Messages is running
   - Verify you can send manually
   - Check iMessage/SMS settings

2. **Check recipient format**:
   - Phone numbers: `+1234567890` or `1234567890`
   - iMessage: email or phone number

3. **Check BlueBubbles logs**:
   - In BlueBubbles app, go to "Server Management" → "Logs"
   - Look for error messages

## Security Notes

- BlueBubbles gives API access to your Messages
- Use a strong server password
- Only enable on trusted networks
- Consider firewall rules if exposing beyond localhost
- Regular security updates

## Alternative: Messages App Direct Access

If BlueBubbles doesn't work, you can use AppleScript directly:

```bash
osascript -e 'tell application "Messages" to send "Hello!" to buddy "+1234567890"'
```

This is simpler but less feature-rich than BlueBubbles API.