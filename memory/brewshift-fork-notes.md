# Brewshift Fork Progress Notes

## Task 1: Repo Fork — ✅ COMPLETE

### What was done
- Created clean repo at `/Users/danielkeene/Brewshift`
- Copied all multi-tenant core from Boundaries Logbook Application
- Stripped Boundaries-specific content:
  - `mockData.ts` — emptied MOCK_STORES, MOCK_USERS, BOUNDARIES_MANUAL, BOUNDARIES_RECIPES, TRAINING_CURRICULUM
  - `App.tsx` — changed DEFAULT_ORG_ID to 'org-default', org name to 'BREWSHIFT'
  - `App.tsx` — replaced `@boundariescoffee.com` email check with role-based `canEdit`
  - `App.tsx` — genericized AI audit prompt (was "auditor for Boundaries Coffee")
  - `Login.tsx` — removed `@boundariescoffee.com` → MANAGER auto-assign, updated copy
  - Removed: TOAST_SETUP_GUIDE.md, Module PDFs, upload-handbook.html, .env.local
- Kept (multi-tenant core):
  - Full org system with Firestore scoping (`organizations/{orgId}/`)
  - Dynamic branding (CSS variables --primary, --accent; org config)
  - Self-service onboarding with 4 starter packs
  - Team Management + Toast employee sync
  - Training modules framework (video, quiz, practice, file upload)
  - Photo-verified checklists + AI auditing (Gemini)
  - Recipe book (espresso, grid, batch, standard formats)
  - Leader performance tracking
  - Password hashing (SHA-256 w/ salt)
  - Capacitor iOS/Android native setup
  - All Vercel serverless API functions (toast-sales, toast-labor, etc.)
- Updated capacitor.config.ts: appId → 'com.brewshift.app', scheme → 'App'
- `npm run build` succeeds (855KB JS bundle)
- Git initialized, initial commit made

---

## Task 2: iOS Build — ✅ COMPLETE

### Problems found and fixed

1. **"No destinations for scheme" error**
   - Root cause: Xcode 26.2 requires `SUPPORTED_PLATFORMS` in build settings
   - Fix: Added `SUPPORTED_PLATFORMS = "iphoneos iphonesimulator"` to all 4 build configurations in project.pbxproj

2. **No shared scheme file**
   - Root cause: Xcode auto-generates schemes, but they don't properly inherit platform settings
   - Fix: Created explicit `App.xcscheme` at `ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme`

3. **SPM package resolution hanging**
   - Root cause: `npx cap sync ios` overwrites Package.swift with remote GitHub dependency (ionic-team/capacitor-swift-pm)
   - Fix: Restore Package.swift to use local binary xcframeworks after every `cap sync`
   - **Important**: The Package.swift at `ios/App/CapApp-SPM/Package.swift` must NOT have the `DO NOT MODIFY` header from Capacitor. After `cap sync`, always restore local xcframework targets.

4. **"iOS 26.2 Platform Not Installed" from ibtool**
   - Root cause: Xcode 26.2 requires the iOS platform to be explicitly registered/downloaded
   - Fix: `xcodebuild -downloadPlatform iOS` (one-time, registers the platform)
   - The SDK files were already present, but ibtool needs the platform registration

### Build commands that work

```bash
# Regular build (target-based, always works)
xcodebuild -project ios/App/App.xcodeproj \
  -target App -configuration Release -sdk iphoneos26.2 \
  ARCHS=arm64 -skipPackagePluginValidation \
  CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO \
  build

# Archive (scheme-based, requires platform registration)
xcodebuild -project ios/App/App.xcodeproj \
  -scheme App -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/Brewshift.xcarchive \
  -skipPackagePluginValidation \
  CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO \
  archive
```

### Archive location
- `/Users/danielkeene/Brewshift/build/Brewshift.xcarchive`
- Contains App.app, dSYMs, Info.plist

---

## Task 3: Landing Page — ✅ COMPLETE

### Location
- `/Users/danielkeene/Brewshift/landing/index.html`

### Features
- Single-page static HTML (no build step needed)
- Navy (#0F2B3C) + Copper (#C77B3C) + Cream (#F5F0E8) palette
- Plus Jakarta Sans font (Google Fonts CDN)
- Sections: Nav, Hero, Features, How It Works, Screenshots, Pricing, CTA, Footer
- Hero includes an interactive app mockup showing checklist + sales stats
- 6 feature cards: Training, Checklists, Toast, AI Auditing, Team Mgmt, Branding
- 3-step "How It Works": Create Shop → Add Team → Run Shifts
- Pricing tiers: Starter ($0), Pro ($49/mo), Scale ($129/mo)
- Screenshot placeholders (3 phone-shaped slots)
- CTA section with "Start Your Free Trial" + "Schedule a Demo"
- Fully mobile responsive (single column on mobile, hidden mockup)
- Tagline: "Run every shift like your best shift."

### Next steps for landing page
- Add real screenshots / demo GIF
- Connect CTA buttons to actual signup
- Deploy to brewshift.app domain
- Add analytics (GA or Plausible)
- SEO meta tags / Open Graph images

---

## Git Status
- 2 commits on main branch
- All files tracked, clean working tree
