# Convex Setup Instructions

## Current Status
- ✅ Convex installed via pnpm
- ✅ Schema and functions created
- ✅ Activity logging code prepared
- ❌ **Manual login required**

## Next Steps

### 1. Complete Convex Authentication
Run this command in Terminal:
```bash
cd /Users/danielkeene/clawd
export PATH="/Users/danielkeene/Library/pnpm:$PATH"
pnpm exec convex dev --once --configure=new
```

When prompted:
- **Login to Convex account** (create if needed)
- **Choose team/project name** (suggest: daniel-keene / troy-mission-control)
- **Select deployment type**: Cloud (recommended)

### 2. Get Deployment URL
After setup, you'll get a deployment URL like:
`https://your-project.convex.cloud`

### 3. Update Environment
Add to `.env.local`:
```
CONVEX_URL=https://your-project.convex.cloud
```

## What This Enables
- **Live activity feed** - see actions in real-time
- **Real-time search** - instant index updates
- **System status** - current state monitoring
- **Remote visibility** - truly live mission control

## Files Ready
- `convex/schema.ts` - Database schema
- `convex/activities.ts` - Activity logging functions  
- `activity/convex-logger.js` - Integrated logger
- Dashboard viewers ready for live data

**Time to complete**: ~5 minutes once authenticated