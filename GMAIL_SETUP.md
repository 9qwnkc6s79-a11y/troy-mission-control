# Gmail Integration Setup Guide

## 1. Google Cloud Console Setup

### Create a Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: "OpenClaw Gmail Integration"
4. Click "Create"

### Enable Gmail API
1. Go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on it and press "Enable"

### Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - Choose "External" (unless you have a Google Workspace)
   - Fill in app name: "OpenClaw Gmail"
   - Add your email as a test user
   - Add scopes: `../auth/gmail.readonly`, `../auth/gmail.send`, `../auth/gmail.modify`
4. Choose "Desktop application"
5. Name: "OpenClaw Desktop Client"
6. Download the JSON file

### OAuth Consent Screen (if needed)
1. Go to "APIs & Services" → "OAuth consent screen"
2. Fill in required fields:
   - App name: "OpenClaw Gmail Integration"
   - User support email: your email
   - Developer contact: your email
3. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.modify`
4. Add test users (your Gmail address)

## 2. Local Setup

### Install Dependencies
```bash
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

### Place Credentials
1. Create `~/.openclaw/` directory if it doesn't exist
2. Copy the downloaded JSON file to `~/.openclaw/client_secret.json`

### Run Setup
```bash
chmod +x email-integration.py
python3 email-integration.py
```

This will:
1. Open a browser for OAuth authentication
2. Save credentials for future use
3. Test email access

## 3. Configuration

Edit `~/.openclaw/email_config.json`:

```json
{
  "auto_respond_enabled": false,
  "auto_respond_message": "Thank you for your email. I have received it and will respond shortly.",
  "task_creation_enabled": true,
  "priority_keywords": ["urgent", "asap", "important", "critical"],
  "auto_mark_read": true
}
```

## 4. Testing

```bash
python3 email-integration.py
```

Should show:
- ✅ OAuth successful
- 📧 Found X unread emails
- ✅ Created Y tasks

## 5. Integration with OpenClaw

The email system will:
1. Monitor Gmail for new emails
2. Create tasks from important emails
3. Auto-respond if configured
4. Route urgent emails to immediate attention

## Troubleshooting

### "access_denied" Error
- Check OAuth consent screen is configured
- Add your email as a test user
- Verify scopes are correct

### "invalid_client" Error
- Re-download credentials from Google Cloud Console
- Check file is named `client_secret.json`
- Verify project has Gmail API enabled

### Rate Limits
- Gmail API has quota limits
- Normal usage should be fine
- If exceeded, requests will be throttled

## Security Notes

- Credentials are stored locally in `~/.openclaw/`
- Never share `gmail_token.pickle` file
- Regularly review granted permissions in [Google Account settings](https://myaccount.google.com/permissions)