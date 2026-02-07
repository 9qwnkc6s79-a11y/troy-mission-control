# Agent Structure Proposal

*How to organize Troy into specialized modes/agents*

---

## Current Problem

Using one agent for everything means:
- Marketing context mixed with personal stuff
- No clear separation of concerns
- Harder to stay focused on specific domains

---

## Proposed Structure

### 🏛️ Troy (Main Agent)
**Role:** Personal assistant, life admin, general coordination
**Handles:**
- Calendar management
- Email triage
- Personal tasks
- Hiring / HR
- Fundraising follow-ups
- Coordinating between other agents

**Channel:** Telegram (current)

---

### 📣 Troy Marketing (Sub-Agent)
**Role:** Boundaries Coffee marketing specialist
**Handles:**
- Social media content & scheduling (Later)
- Campaign planning
- Influencer outreach
- Content calendar
- Brand voice consistency
- Analytics & reporting

**Could have:**
- Separate Telegram chat or channel
- Different personality (more creative/brand-focused)
- Access to: Later, Meta Business, Instagram, marketing docs

---

### 💼 Troy Ops (Future, Optional)
**Role:** Operations & business management
**Handles:**
- Toast POS monitoring
- Sling scheduling
- QuickBooks review
- Vendor management
- Daily store operations

---

## How Clawdbot Handles This

Clawdbot supports multiple agents via:
```bash
clawdbot agents add <agent-id>
```

Each agent can have:
- Separate config/personality
- Separate session history
- Separate channel (different Telegram chat)
- Shared or separate tool access

---

## Recommended Approach

**Phase 1 (Now):**
- Keep main Troy agent
- Create MEMORY.md system (done ✓)
- Set up Notion for task management
- Get integrations working

**Phase 2 (Soon):**
- Spawn "Troy Marketing" as a sub-agent
- Give it its own Telegram chat
- Connect it to Later, Meta, marketing tools only
- Marketing tasks go there, everything else stays with main Troy

**Phase 3 (Later):**
- Add more specialized agents as needed
- Troy becomes the "coordinator" who delegates

---

## Task Management Integration

With Notion:
- Main board visible to all agents
- Marketing tasks tagged/filtered to Marketing agent
- Ops tasks to Ops agent
- Daniel sees everything in one view
- Each agent only focuses on their domain

---

## Decision Needed

Daniel: Do you want me to:

**A)** Set up one additional "Marketing" agent now
**B)** Stay with single agent but use Notion labels to separate concerns
**C)** Wait until integrations are solid, then add agents

Let me know and I'll implement.

---

*Created: 2026-01-25*
