# Boundaries Logbook Application — Deep-Dive Analysis

*Produced: January 2026 | Version Analyzed: 3.4.2*

---

## Section 1: Product Overview

### What It Does

The Boundaries Logbook Application is a **comprehensive operational management and employee training platform** purpose-built for Boundaries Coffee — a multi-location drive-thru specialty coffee shop in the DFW area (Little Elm and Prosper, TX). It combines five major functional pillars into a single web application:

1. **Training Academy** — Self-paced onboarding curriculum with video lessons, quizzes, practice checklists with photo verification, and file uploads
2. **Operational Logbook** — Digital opening/closing/weekly cleaning checklists with photo-verified task completion and AI-powered photo auditing
3. **Manager Hub** — Real-time dashboard for compliance monitoring, staff training progress, checklist review/approval, Toast POS data, team leader performance scoring, cash auditing, and Google Reviews integration
4. **Staff Dashboard** — Personal performance stats, leaderboard, training progress, and streak tracking for individual employees
5. **Recipe Book** — Complete digital recipe reference and operations manual accessible to all staff

### Who It's For

- **Trainees** — New hires completing onboarding modules (16 modules, 40+ lessons)
- **Trainers** — Staff who've completed onboarding, mentor new hires
- **Managers/Admins** — Daniel, Kate, and shift leads who oversee operations across locations
- **The business** — Provides accountability, consistency, and data-driven performance management

### Full Feature Inventory

#### Training Academy
- **16 onboarding modules** covering: admin logistics, company values, morning routines, coffee ordering knowledge, specialty coffee education, seed-to-cup, Onyx Coffee Lab standards, teamwork (Lencioni), espresso fundamentals, espresso troubleshooting, milk steaming, drink making (Day 1 hot drinks), menu knowledge, hospitality (Ritz-Carlton-inspired), order taking (8-step script), Toast POS navigation
- **Lesson types**: CONTENT (rich text/markdown), VIDEO (YouTube embeds with watch tracking), QUIZ (multiple choice, true/false, select-all with explanations), PRACTICE (checkable items with photo capture), FILE_UPLOAD (e.g., Food Handler certificate), SIGN_OFF
- **Quiz engine**: Scoring, pass/fail (80% threshold), cooldown timers on retakes, review mode showing correct answers with explanations
- **Practice sessions**: Checklist items with optional photo requirements, camera capture with Firebase Storage upload, progress gallery for comparing attempts over time
- **Video progress tracking**: Watch percentage tracking, minimum watch requirements
- **Search & filter**: By lesson type, completion status, keyword
- **Role auto-promotion**: Trainees who complete all onboarding auto-promote to Trainer role
- **Curriculum editor**: Managers can add/edit/reorder modules and lessons in real-time
- **Lesson reset**: Managers can reset individual lesson progress for retraining

#### Operational Logbook (OpsView)
- **Configurable checklist templates**: Opening, Closing, Shift Change, Weekly deep cleans (Monday–Sunday), with per-store customization
- **Task types**: Simple checkbox, photo-required (single or multi-photo), value-required (e.g., grind setting), comment fields
- **Camera integration**: In-app camera with preview/retake, JPEG compression (800px max, 70% quality), Firebase Storage upload
- **AI photo auditing**: Gemini 2.5 Flash Vision model analyzes submitted photos against task descriptions, flags irrelevant/blurry/incorrect photos with explanations
- **Draft & submit flow**: Save progress as draft, finalize to submit for manager review
- **Deadline awareness**: Checklists have unlock hours and deadline hours; late submissions tracked
- **Multi-user collaboration**: Any clocked-in staff can contribute to the same checklist; tracks who completed each task and when
- **Read-only mode**: Submitted/approved checklists viewable but not editable

#### Manager Hub
- **Dashboard sub-tabs**: Dashboard, Compliance Matrix, Template Editor, Staff Training, Photo Gallery, Audit/Review, Manual Editor, Cash Audit, Performance Leaderboard
- **Compliance Matrix**: 7-day heatmap showing on-time/late/missed checklist submissions across all template types
- **Checklist Review**: Approve/reject submissions, manager comments on individual photos, AI flag override (manager can approve despite AI flag)
- **Template Editor**: Create/edit/delete checklist templates, add/remove/reorder tasks, set photo requirements, critical task marking, drag-and-drop reordering
- **Staff Training Overview**: Per-employee onboarding % and continued training % progress
- **AI Insights**: Gemini-powered analysis generating operational insights from submission data
- **Manual Editor**: Full WYSIWYG editing of the operations manual sections
- **Recipe Management**: Add/edit/delete recipe cards (espresso, grid, batch, standard types)

#### Toast POS Integration
- **Live sales data**: Today's total net sales, order count, average check, total tips, average turn time, hourly sales breakdown, payment method breakdown
- **Sales comparison**: Week-over-week comparison (today vs. same day last week) with % change
- **Labor data**: Currently clocked-in employees with job titles, shift hours, labor summary
- **Cash management**: Cash drops, pay-outs, tip-outs from Toast Cash Management API
- **Cash deposit auditing**: Record bank deposits, compare expected vs actual, calculate variance, pass/review/fail status
- **Multi-location support**: Separate GUIDs for Little Elm and Prosper locations
- **Auto-refresh**: Data refreshes every 5 minutes with manual refresh option

#### Team Leader Performance System
- **Leader detection**: Auto-identifies GMs, Team Leaders, Shift Leads from Toast clocked-in data using job title matching (exact + regex fallback)
- **Per-shift scoring**: Timeliness (0-40pts), Turn Time (0-40pts), Average Ticket (0-25pts) = 105 max per shift
- **Composite leaderboard**: Normalized scoring across all shifts in lookback period (7/14/30 days)
- **Toast snapshot**: Captures turn time, average check, sales data at moment of checklist submission for accountability
- **Multiple leader detection**: Flags when 2+ leaders are on duty (shared responsibility)
- **Google Reviews bonus**: 5-star reviews attributed to on-duty leader add bonus points to leaderboard

#### Google Reviews Integration
- **Places API (New)**: Fetches reviews for each location via Vercel serverless proxy
- **Review tracking**: Detects new reviews, attributes to on-duty leaders, awards bonus points
- **Deduplication**: Review tracking persisted in Firestore with dedup logic

#### Staff Dashboard
- **Personal metrics**: Total submissions, on-time rate, current streak, training progress %
- **Leaderboard**: Ranked against all staff at the location
- **Training progress**: Visual progress bars for onboarding and continued education

#### AI Features (Gemini Integration)
- **Photo auditing**: Gemini 2.5 Flash Image analyzes checklist photos for task relevance
- **Barista Brain chatbot**: AI assistant grounded in the operations manual and recipe book, answers staff questions using RAG-style context injection, streaming responses
- **Manager AI insights**: Generates operational analysis from compliance and submission data

#### Infrastructure & Architecture

**Tech Stack:**
- **Frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS 3.4
- **UI Components**: Lucide React icons, Recharts for data visualization, Plus Jakarta Sans font
- **Backend**: Vercel Serverless Functions (Node.js) for API proxying
- **Database**: Firebase Firestore (single-collection document store, `appData` collection)
- **File Storage**: Firebase Storage (photos uploaded as JPEG, stored with download URLs)
- **AI**: Google Gemini API (via `@google/genai` SDK)
- **POS Integration**: Toast REST APIs (Orders v2, Labor v1, Cash Management v1, Authentication v1)
- **Reviews**: Google Places API (New)
- **PWA**: Service worker registration (currently disabled), manifest.json, apple-touch-icon support

**Data Architecture:**
- Single Firestore collection (`appData`) with documents: `users`, `progress`, `submissions`, `templates`, `curriculum`, `manual`, `recipes`, `deposits`, `googleReviews`, `curriculum_version`
- All data stored as arrays within single documents (not sub-collections)
- 1MB Firestore document limit managed with size checking and warnings
- Real-time sync heartbeat every 4 seconds for near-real-time multi-user updates
- Cross-tab sync via localStorage change detection
- Optimistic UI protection (7-second buffer after local updates to prevent stale sync overwrites)

**Deployment:**
- Hosted on Vercel
- Toast API calls proxied through Vercel serverless functions to avoid CORS
- Firebase credentials hardcoded in client (Firestore security rules control access)
- Environment variables for Toast API credentials and Gemini API key

### Toast API Integration Details

| API | Endpoint | Data Fetched |
|-----|----------|-------------|
| **Authentication** | `POST /authentication/v1/authentication/login` | OAuth2 token (clientId + clientSecret → 24h access token) |
| **Orders** | `GET /orders/v2/ordersBulk` | All orders by date range — NET sales, tax, tips, turn times, hourly breakdown, payment methods |
| **Labor** | `GET /labor/v1/timeEntries?businessDate=YYYYMMDD&open=true` | Time entries including currently clocked-in (open=true critical), employee names, job titles, hours |
| **Employees** | `GET /labor/v1/employees` | Employee directory for name resolution |
| **Jobs** | `GET /labor/v1/jobs` | Job titles for role resolution |
| **Cash Management** | `GET /cashmgmt/v1/entries` | Cash drops, pay-outs, tip-outs by date range |

**Multi-location routing**: Each location (Little Elm, Prosper) has separate restaurant GUIDs. The system probes multiple GUIDs and caches the working one.

### Training PDFs in dist/
- `Module_Hospitality.pdf` (53KB)
- `Module_Order_Taking.pdf` (63KB)
- `Module_Toast_POS_Navigation.pdf` (82KB)

These appear to be downloadable/printable versions of three training modules.

### How Training Modules Work

1. Modules are organized in categories: ONBOARDING (required for all new hires) and CONTINUED/BARISTA_SKILLS
2. Lessons within modules follow a structured sequence: typically a CONTENT intro → VIDEO lesson → QUIZ assessment, or CONTENT → PRACTICE with checklist → QUIZ
3. Quizzes require 80%+ to pass with a cooldown timer on retakes
4. Practice lessons have checkable items, some requiring photo proof (camera capture uploads to Firebase Storage)
5. Curriculum is versioned (`CURRICULUM_VERSION = 5`) — version bump forces Firebase to refresh cached curriculum
6. Progress is tracked per-user per-lesson in Firestore
7. All onboarding completion auto-promotes TRAINEE → TRAINER role
8. Managers can add/edit modules and lessons dynamically (changes sync to all users via Firestore)

---

## Section 2: Competitive Analysis

### What This Does That Toast Doesn't Offer Natively

Toast POS is a point-of-sale and restaurant management platform. Here's what this app adds that Toast does NOT provide:

| Feature | Toast Native? | Boundaries App |
|---------|:---:|:---:|
| Self-paced onboarding training with video/quiz/practice | ❌ | ✅ |
| Photo-verified operational checklists | ❌ | ✅ |
| AI-powered photo auditing (Gemini Vision) | ❌ | ✅ |
| In-app camera with Firebase Storage | ❌ | ✅ |
| Compliance matrix (7-day checklist heatmap) | ❌ | ✅ |
| Team leader performance scoring (turn time + timeliness + sales) | ❌ | ✅ |
| Digital recipe book with grid/batch/espresso card types | ❌ | ✅ |
| Full operations manual with in-app editing | ❌ | ✅ |
| AI chatbot for staff (grounded in manual/recipes) | ❌ | ✅ |
| Cash deposit auditing with variance tracking | ❌ | ✅ |
| Google Reviews integration with leader attribution | ❌ | ✅ |
| Onboarding file upload (food handler cert) | ❌ | ✅ |
| Toast live sales data in sidebar widget | ❌ (in their own app, not yours) | ✅ |

**Toast does offer**: Toast Payroll, scheduling (via Sling integration), basic sales reporting in their own dashboard, and Toast University (generic POS training). But nothing like structured brand-specific training, photo-verified ops accountability, or AI auditing.

### Unique Value Proposition

**"The operating system for coffee shop accountability."**

This app sits at the intersection of three things no single product handles well for coffee shops:

1. **Training** — Not generic food-safety CBTs, but *your specific brand's* espresso recipes, greeting scripts, coffee education, and hospitality philosophy, delivered in an engaging mobile format
2. **Ops accountability** — Photo-verified checklists with AI auditing turn "trust me, I did it" into "here's the proof"
3. **Performance data** — Connecting Toast POS data (sales, turn times) to shift leaders creates accountability that otherwise requires constant manager presence

The closest analogy: **what Zenput (now part of Restaurant365) is for QSR chains, but purpose-built for specialty coffee and 10x cheaper.**

### Who Else Is in This Space?

| Competitor | What They Do | Gap |
|-----------|-------------|-----|
| **Zenput/Restaurant365** | Enterprise compliance checklists, temp logging, auditing | $300-500+/mo, built for chains of 50+, no training, no POS integration |
| **Jolt** | Digital checklists, temp monitoring, labeling | $50-150/mo per location, no training, no Toast integration |
| **7shifts** | Scheduling + basic task management | Scheduling-focused, minimal checklist/training, no POS data integration |
| **Trainual** | SOPs and training playbooks | Training only, no ops checklists, no POS, $99-249/mo |
| **Connecteam** | Employee app (training, tasks, scheduling) | Generic, not coffee-specific, no POS integration, complex setup |
| **Toast Payroll & Team** | Basic HR, payroll, scheduling | No training modules, no checklist accountability, no AI |
| **Notion / Google Docs** | DIY ops manuals | Zero accountability, no photo verification, no POS data |

**Key gap in the market**: No one combines training + photo-verified checklists + Toast POS data + AI auditing in a single product designed for independent coffee shops. The enterprise solutions (Zenput, R365) are overkill and overpriced. The small-shop solutions (Jolt, Connecteam) lack depth and POS integration.

---

## Section 3: Productization Game Plan

### Current State (Single-Tenant)

Today, the app is hardcoded for Boundaries Coffee:
- `MOCK_STORES` defines Little Elm and Prosper
- `MOCK_USERS` includes Daniel, Kate, and a test trainee
- Firebase config points to `boundaries-logbook-app` project
- Toast credentials are environment-specific
- Branding (colors, logo, fonts) is hardcoded
- Curriculum content is Boundaries-specific (but editable by managers)

### What Needs to Change for Multi-Tenant SaaS

#### 1. Authentication & User Management
**Current**: Email/password stored in Firestore docs, no real auth
**Needed**:
- Firebase Authentication (or Auth0/Clerk) for proper auth
- Toast OAuth2 flow for connecting customer's Toast account
- Invitation system (manager invites staff via email/link)
- Role management per organization
- Password hashing (currently plaintext!)

#### 2. Multi-Tenancy Architecture
**Current**: Single Firestore collection (`appData`) with single documents
**Needed**:
- Organization-scoped data: `organizations/{orgId}/...`
- Each org gets isolated: users, templates, submissions, curriculum, recipes, manual, progress
- Shared infrastructure with data isolation
- Firestore security rules enforcing org-level access

**Recommended migration path**:
```
organizations/
  {orgId}/
    config/         → branding, Toast credentials, store locations
    users/          → org members with roles
    curriculum/     → training modules (seeded from templates)
    templates/      → checklist templates
    submissions/    → checklist submissions
    progress/       → training progress
    recipes/        → recipe book
    manual/         → operations manual
    deposits/       → cash deposits
    reviews/        → Google review tracking
```

#### 3. Onboarding Flow for New Customers
1. **Sign up** → Create organization
2. **Connect Toast** → OAuth2 flow to link Toast account (auto-populates locations, employees, jobs)
3. **Choose starter pack** → Pre-built curriculum templates (Coffee Shop Basics, Espresso Training, etc.)
4. **Customize** → Edit training content, checklist templates, recipes for their brand
5. **Invite team** → Email/SMS invitations for staff
6. **Go live** → Staff downloads PWA and starts training

#### 4. White-Labeling Approach
**Tier 1 (Simple — MVP)**: 
- Custom shop name and logo upload
- Custom color scheme (primary, secondary, accent)
- Custom store locations
- Custom domain via CNAME (e.g., `training.joescoffee.com`)

**Tier 2 (Advanced)**:
- Custom email templates
- Custom PWA manifest (icon, splash screen)
- Custom welcome video/message
- Custom login page design

**Implementation**: Store branding config in Firestore per org, load dynamically on app init. CSS variables for theming.

#### 5. Toast OAuth Integration
**Current**: Manual API key entry
**Needed**: Toast Partner OAuth2 flow
- Register as Toast Partner
- Implement OAuth2 authorization code flow
- Auto-discover restaurant GUIDs and locations
- Per-org encrypted credential storage
- Token refresh management

#### 6. Content Template Library
Instead of empty curriculum for new shops, offer **starter packs**:
- ☕ Coffee Shop Essentials (hospitality, food safety, POS basics)
- 🎯 Espresso Training (extraction, dialing in, milk steaming, troubleshooting)
- 📋 Standard Checklists (opening, closing, weekly cleans)
- 🍹 Bar Operations (non-coffee drinks, smoothies, energy drinks)

Each pack is a template that gets cloned into the org's Firestore. Managers can then customize freely.

### Pricing Model Recommendations

| Plan | Price | Target | What's Included |
|------|-------|--------|----------------|
| **Starter** | $49/mo per location | Solo owner, 1-2 locations | Training (10 modules), basic checklists, recipe book, 5 staff |
| **Pro** | $99/mo per location | Growing shops, 1-5 locations | Unlimited modules, photo verification, AI auditing, Toast integration, unlimited staff |
| **Scale** | $199/mo per location | Multi-unit operators, 5+ locations | Everything in Pro + multi-location dashboard, performance leaderboard, cash auditing, priority support |
| **Enterprise** | Custom | 10+ locations | White-label, custom integrations, dedicated support, SLA |

**Add-ons**:
- AI Photo Auditing: +$20/mo (Gemini API costs ~$0.001/audit)
- Barista Brain AI Chat: +$15/mo (Gemini API costs)
- Google Reviews Integration: +$10/mo

**Annual discount**: 20% off (2 months free)

**Revenue per customer projection**: Average $120/mo (weighted toward Pro plan)

---

## Section 4: Go-to-Market Strategy

### How to Reach Coffee Shops on Toast

#### Channel 1: Toast Marketplace (Highest ROI)
- **Toast Integration Partner Program**: Apply to be listed in Toast's integration marketplace
- Toast has 120,000+ restaurant locations; coffee shops are a major segment
- Being listed = instant credibility + discovery
- **Timeline**: 2-3 months to apply and get approved
- **Action**: Apply at partners.toasttab.com

#### Channel 2: Direct Outreach to Coffee Shops on Toast
- **Target**: Independent and small-chain coffee shops (1-10 locations) that use Toast
- **How to find them**: 
  - Toast's public restaurant directory
  - Google Maps searches for coffee shops filtered by "Toast" reviews/receipts
  - Instagram hashtag mining (#toastpos, #drivetrucoffee, etc.)
  - SCA (Specialty Coffee Association) member lists
  - Local coffee shop owner Facebook groups
- **Outreach method**: Cold email/DM showing the product with a video demo
- **Message**: "You're already on Toast. Here's the training & ops app that plugs right in."

#### Channel 3: Coffee Industry Communities
- **SCA (Specialty Coffee Association)** events and membership
- **Coffee Fest** and **National Coffee Association** conferences
- **Reddit** r/barista, r/coffee, r/coffeeShops
- **Facebook Groups**: "Coffee Shop Owners", "Drive-Thru Coffee Shop Owners"
- **Instagram**: Partner with coffee influencers for reviews/demos

#### Channel 4: Content Marketing
- **Blog/YouTube**: "How to train baristas faster," "Coffee shop checklist templates," "How to use Toast POS data for accountability"
- **Free downloads**: Printable opening/closing checklist PDFs (lead magnets)
- **Case study**: Document Boundaries Coffee's improvement metrics (training time reduction, compliance rates, turn time improvement)

#### Channel 5: Referral Program
- Existing customers refer other shops → 1 month free for both
- Coffee shop owners know other coffee shop owners — word of mouth is powerful in this community

### Positioning and Messaging

**Tagline options:**
- "The operating system for coffee shop accountability."
- "Train, track, and transform your coffee shop — all in one app."
- "Your baristas deserve better training. Your managers deserve real accountability."

**Key messages by persona:**

**To Owners/GMs:**
> "Stop wondering if your checklists are actually getting done. Photo-verified tasks, AI auditing, and real-time Toast data — see exactly what's happening at every location without being there."

**To Multi-Unit Operators:**
> "Scale your culture, not your chaos. Every new hire gets the same training. Every shift gets the same accountability. Every location runs the same standard."

**To Training Managers:**
> "Replace your binder of SOPs with an interactive training academy. Video lessons, quizzes, practice checklists with photo proof — your new hires are bar-ready in half the time."

### Launch Timeline

#### Phase 1: MVP (Months 1-3)
- [ ] Multi-tenant data architecture (Firestore restructure)
- [ ] Proper authentication (Firebase Auth)
- [ ] Basic onboarding flow (create org → add locations → invite staff)
- [ ] White-label basics (name, logo, colors)
- [ ] Starter curriculum template packs (Coffee Essentials, Espresso, Checklists)
- [ ] Toast OAuth integration (replace manual credential entry)
- [ ] Landing page and marketing site
- [ ] Stripe billing integration

#### Phase 2: Beta (Months 4-6)
- [ ] Recruit 5-10 beta coffee shops (offer free 3 months)
- [ ] Gather feedback, iterate on UX
- [ ] Build content template marketplace (shops share curriculum)
- [ ] Mobile-first UX polish (it's already PWA-capable)
- [ ] Analytics dashboard (how many lessons completed, compliance rate, etc.)
- [ ] Apply for Toast Integration Partner program

#### Phase 3: Launch (Months 7-9)
- [ ] Public launch with pricing tiers
- [ ] Toast Marketplace listing live
- [ ] Content marketing engine running (blog, YouTube, case studies)
- [ ] Referral program active
- [ ] First 50 paying customers target
- [ ] Customer success playbook (onboarding calls, check-ins)

#### Phase 4: Scale (Months 10-18)
- [ ] Enterprise features (custom integrations, SLA, dedicated support)
- [ ] Square POS / Clover POS integration (expand beyond Toast)
- [ ] API for third-party integrations
- [ ] Native mobile apps (React Native)
- [ ] Marketplace for community-created curriculum
- [ ] International expansion (language support)

### Revenue Projections

**Assumptions**: Average revenue per customer = $120/mo, average 1.5 locations per customer

| Scenario | Month 6 | Month 12 | Month 18 | Month 24 |
|----------|---------|----------|----------|----------|
| **Conservative** (slow organic growth) | 10 customers, $1,200/mo | 30 customers, $3,600/mo | 75 customers, $9,000/mo | 150 customers, $18,000/mo |
| **Moderate** (Toast marketplace + outreach) | 25 customers, $3,000/mo | 75 customers, $9,000/mo | 200 customers, $24,000/mo | 400 customers, $48,000/mo |
| **Aggressive** (viral + partnerships) | 50 customers, $6,000/mo | 150 customers, $18,000/mo | 500 customers, $60,000/mo | 1,000 customers, $120,000/mo |

**Conservative annual (Year 2)**: ~$216K ARR
**Moderate annual (Year 2)**: ~$576K ARR  
**Aggressive annual (Year 2)**: ~$1.44M ARR

**Key leverage**: Toast has 120K+ restaurants. Coffee shops are estimated at 15-20% of their base (18K-24K). Capturing just 1% = 180-240 customers = $260K-$345K ARR.

**Cost structure** (estimated monthly at scale):
- Firebase/GCP: $50-300/mo (scales with usage)
- Vercel: $20-150/mo (serverless functions)
- Gemini API: $0.001/photo audit × volume
- Stripe fees: 2.9% + $0.30 per transaction
- Domain/DNS: ~$15/mo
- Your time: Priceless until you hire

---

## Section 5: Immediate Next Steps

### Top 5 Things to Do First (Priority Order)

#### 1. 🔐 Fix Authentication (Week 1-2)
**Why first**: Passwords are stored in plaintext in Firestore. This is the most critical security issue.
- Implement Firebase Authentication
- Hash existing passwords
- Add proper session management
- Remove plaintext passwords from `MOCK_USERS`

**This is both a security fix AND the foundation for multi-tenant auth.**

#### 2. 🏗️ Restructure Data for Multi-Tenancy (Week 2-4)
**Why second**: Everything else depends on data isolation.
- Create `organizations/{orgId}/` structure in Firestore
- Migrate existing Boundaries Coffee data into org-scoped collections
- Update `db.ts` CloudAPI to be org-aware
- Write Firestore security rules enforcing org-level access
- Keep backward compatibility during migration

#### 3. 🎯 Build the Landing Page + Waitlist (Week 2-3)
**Why now**: Start building demand while you build the product.
- Simple landing page: Hero, features, pricing, waitlist signup
- **Domain**: Something like `shiftops.app`, `barista.app`, `cafeops.io`, `shoplogbook.com`
- Record a 2-minute demo video showing the actual app
- Post in coffee owner communities for early interest
- **Tool**: Ship on Vercel with a simple React or Next.js page

#### 4. 🔗 Apply for Toast Integration Partner Program (Week 3-4)
**Why early**: Approval takes time (weeks to months). Start the process now.
- Apply at partners.toasttab.com
- You already have a working Toast integration — this is a huge head start
- Partnership enables OAuth2 flow (no more manual credential entry)
- Marketplace listing is the #1 distribution channel

#### 5. 📦 Build Starter Template Packs (Week 4-6)
**Why before launch**: This is what makes onboarding effortless for new customers.
- Extract Boundaries-specific content from curriculum
- Create generic, reusable templates:
  - ☕ **Coffee Shop Essentials** (hospitality, food safety, customer service)
  - 🎯 **Espresso 101** (extraction, milk steaming, troubleshooting)
  - 📋 **Standard Ops Checklists** (opening, closing, weekly cleans)
- Build "choose your starter pack" into the onboarding flow
- Let managers customize everything after initial seed

---

## Appendix: Technical Debt & Cleanup Notes

| Issue | Severity | Notes |
|-------|----------|-------|
| **Plaintext passwords** | 🔴 Critical | `MOCK_USERS` has raw passwords, stored in Firestore unencrypted |
| **Firebase config in client code** | 🟡 Medium | apiKey hardcoded in `db.ts` — fine for Firestore with rules, but should be env var |
| **Single-document data model** | 🟡 Medium | All submissions in one doc risks 1MB limit at scale |
| **4-second sync heartbeat** | 🟡 Medium | 900+ Firestore reads/hour per user — will be costly at scale |
| **Service worker disabled** | 🟢 Low | PWA features commented out; should re-enable for production |
| **No error boundaries** | 🟢 Low | React error boundaries needed for production resilience |
| **No automated tests** | 🟢 Low | No test files found; add Jest/Vitest before SaaS launch |
| **Console.log everywhere** | 🟢 Low | Production logging should use structured logger with levels |

---

## Appendix: File Map

```
/Boundaries-Logbook-Application/
├── App.tsx                    # Main app component, state management, routing
├── index.tsx                  # React entry point, service worker registration
├── types.ts                   # All TypeScript interfaces and enums
├── index.css                  # Tailwind imports + custom styles
├── index.html                 # HTML shell with Firebase CDN, PWA meta tags
├── vite.config.ts             # Vite build config
├── package.json               # Dependencies (React 19, Gemini, Recharts, Lucide)
├── metadata.json              # App metadata (name, description, camera permission)
├── .env.local.example         # Environment variable template
├── TOAST_SETUP_GUIDE.md       # Setup documentation for Toast integration
├── README.md                  # Basic run instructions
├── components/
│   ├── Layout.tsx             # App shell: sidebar, nav, Toast widgets, AI chatbot
│   ├── Login.tsx              # Auth flow: login, signup, password reset
│   ├── TrainingView.tsx       # Training academy: modules, lessons, quizzes, practice
│   ├── OpsView.tsx            # Operational checklists with camera + submission flow
│   ├── ManagerHub.tsx         # Manager dashboard: compliance, reviews, editor, Toast data
│   ├── StaffDashboard.tsx     # Personal stats, leaderboard, training progress
│   ├── RecipeBook.tsx         # Recipe cards + operations manual viewer/editor
│   └── StorageDiagnostic.tsx  # Debug tool for storage testing
├── services/
│   ├── db.ts                  # Firebase Firestore + Storage CRUD operations
│   └── toast.ts               # Toast API client (calls serverless proxies)
├── api/
│   ├── toast-auth.ts          # Vercel serverless: Toast OAuth2 token
│   ├── toast-sales.ts         # Vercel serverless: Orders/sales data
│   ├── toast-labor.ts         # Vercel serverless: Labor/time entries
│   ├── toast-cash.ts          # Vercel serverless: Cash management
│   ├── toast-debug.ts         # Debug endpoint
│   ├── toast-health.ts        # Health check endpoint
│   ├── toast-labor-debug.ts   # Labor debug endpoint
│   ├── toast-labor-live.ts    # Labor live endpoint
│   ├── toast-restaurants.ts   # Restaurant discovery
│   └── google-reviews.ts      # Google Places API reviews proxy
├── data/
│   └── mockData.ts            # Seed data: stores, users, manual, recipes, curriculum, templates
├── utils/
│   └── leadershipTracking.ts  # Leader detection, scoring, leaderboard calculations
├── dist/
│   ├── Module_Hospitality.pdf
│   ├── Module_Order_Taking.pdf
│   ├── Module_Toast_POS_Navigation.pdf
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── assets/                # Built JS/CSS bundles
└── public/
    └── sw.js                  # Service worker source
```

---

*This report covers every file, every feature, every integration point. The app is remarkably complete for a single-tenant tool — the path to SaaS is mostly architectural (multi-tenancy, auth, onboarding flow) rather than feature-gap. The hardest part is already built.*
