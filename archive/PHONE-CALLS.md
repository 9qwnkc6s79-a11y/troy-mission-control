# Troy's Phone Call System

## How It Works

1. **You tell me:** Company name, phone number, account info, what you want done
2. **I call via Bland AI:** Handle the conversation, follow your instructions
3. **If I need info:** I'll ping you mid-call or before if I can predict it
4. **Report back:** Done/not done, summary of call, any follow-up needed

## Cost
- ~$0.09/minute
- 2.00 credits = ~22 minutes of calls (free trial)
- Typical cancellation call: ~$0.50-1.00

## Example Request

> "Troy, cancel my Viasat internet at the Little Elm store. Account is under Boundaries Coffee LLC. Tell them we switched to Starlink. Get confirmation number."

## What I Can Handle

✅ **Cancel services** (internet, subscriptions, etc.)
✅ **Pay bills** (if you give me payment method or it's on file)
✅ **Schedule appointments**
✅ **Check account status / balances**
✅ **Request information**
✅ **Navigate phone trees / IVR systems**

## What I'll Ask You For

- Account numbers (if not on file)
- Security PINs/passwords
- Payment authorization
- Decision points ("they offered X, do you want it?")

## API Details

```
Endpoint: https://api.bland.ai/v1/calls
Method: POST
Headers: Authorization: org_e619cfa792e138e4f51b9fa955f3538f43357eb3604556a946bb75d31eea99eae19305a51f572026e19b69
```

## Voice Options
- June (American Female) - default
- Brady (Soft-spoken American Male)
- Paige (Calm, soft-tone female)

---

*System ready. Give me a call to make.*
