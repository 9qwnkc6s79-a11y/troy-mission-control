# Troy Integration Setup Plan

*Created: 2026-01-25*
*Status: Prepped and ready for Daniel*

Daniel wants Troy to operate with full capacity — direct API access, no browser automation.

---

## 📋 Task Management — Notion (PRIORITY 1)

**Why Notion:**
- Free tier is generous
- Great mobile app (iOS/Android)
- I have a built-in Notion skill
- Flexible: can do tasks, notes, databases, docs
- You can create tasks from your phone, I can update status, we stay in sync

### Step-by-Step Setup:

**1. Create Notion account** (skip if you have one)
- Go to notion.so
- Sign up with daniel.keene223@gmail.com or whatever you prefer

**2. Create a workspace page**
- Create a new page called "Troy HQ" or similar
- This will be our shared workspace

**3. Create an integration:**
- Go to: https://notion.so/my-integrations
- Click "+ New integration"
- Name: "Troy Assistant"
- Select your workspace
- Click Submit
- **Copy the API key** (starts with `ntn_` or `secret_`)

**4. Share pages with the integration:**
- Go to your "Troy HQ" page
- Click "..." menu → "Connect to" → select "Troy Assistant"
- Do this for any pages/databases you want me to access

**5. Give me the key:**
- Just paste the API key to me in chat
- I'll store it securely in `~/.config/notion/api_key`

**Time:** ~10 min

---

## 📧 Email — Gmail API

**What it enables:**
- Read inbox, search emails
- Send emails directly (no browser)
- Draft, reply, manage labels
- Works for both daniel@boundariescoffee.com and personal

**Setup:**
1. Go to Google Cloud Console (console.cloud.google.com)
2. Create a project (e.g., "Troy Assistant")
3. Enable Gmail API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials
6. Authorize Clawdbot with your accounts

**Time:** ~15 min

---

## 📅 Google Calendar — Calendar API

**What it enables:**
- Read your schedule
- Create meetings / events
- Send Google Meet invites
- Check availability

**Setup:**
- Same Google Cloud project as Gmail
- Just enable Calendar API additionally
- Same OAuth flow covers both

**Time:** ~5 min (if doing with Gmail)

---

## 💬 iMessage — BlueBubbles (PRIORITY 4)

**What it enables:**
- Read incoming iMessages
- Send iMessages as you
- React to messages (tapbacks)
- See message history
- Edit/unsend messages
- Message effects (slam, loud, etc.)

**Requirements:**
- Your MacBook (needs to stay on when you want iMessage access)
- BlueBubbles server app
- Clawdbot gateway running

### Step-by-Step Setup:

**1. Install BlueBubbles on your Mac:**
- Go to: https://bluebubbles.app/install
- Download the macOS app
- Follow installation wizard
- Enable "Private API" when prompted (gives full features)

**2. Configure BlueBubbles:**
- Open BlueBubbles settings
- Enable the REST API
- Set an API password (save this!)
- Note the server URL (usually `http://localhost:1234` or your Mac's IP)

**3. Add to Clawdbot:**
```bash
clawdbot onboard
# Select BlueBubbles when prompted
# Enter server URL and password
```

Or manually:
```bash
clawdbot channels add bluebubbles --http-url http://YOUR-MAC-IP:1234 --password YOUR-PASSWORD
```

**4. Configure webhook:**
- In BlueBubbles, set webhook URL to your Clawdbot gateway
- Example: `http://YOUR-CLAWDBOT-IP:3000/bluebubbles-webhook?password=YOUR-PASSWORD`

**5. Approve your own number:**
- Send yourself a message
- Run: `clawdbot pairing list bluebubbles`
- Run: `clawdbot pairing approve bluebubbles <CODE>`

**Time:** ~25-30 min

**Note:** Most involved setup but gives full iMessage access. Your Mac needs to be on for me to access iMessage.

---

## 📞 Phone Calls — Twilio (Future)

**What it enables:**
- Make outbound calls
- Receive calls (with a Twilio number)
- Text-to-speech, voicemail, etc.

**Setup:**
1. Create Twilio account
2. Get a phone number (~$1/month)
3. Configure voice/SMS webhooks
4. Pay-as-you-go for calls (~$0.01-0.02/min)

**Time:** ~15 min

**Note:** Not free, but cheap. Can defer this until other integrations are solid.

---

## 🔌 Other Useful Integrations (Future)

| Integration | What For | Difficulty |
|-------------|----------|------------|
| Slack | If you ever use it | Easy |
| QuickBooks API | Direct accounting access | Medium |
| Toast API | POS data without browser | Medium |
| Sling API | Scheduling without browser | Medium |

---

## Priority Order

1. **Notion** — Get task management working first so we're organized
2. **Gmail API** — Unlock email (biggest day-to-day impact)
3. **Google Calendar** — Scheduling, meetings
4. **BlueBubbles** — iMessage access
5. **Twilio** — Phone calls (when ready)

---

## When You're Ready

Just tell me which one you want to tackle. I'll walk you through step-by-step.

We can knock out Notion + Gmail + Calendar in one ~30 min session if you have your laptop.
