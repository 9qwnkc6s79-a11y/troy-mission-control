# Brewshift — Brand Book

*Version 1.0 | January 2026*

---

## 1. Brand Overview

### Name
**Brewshift**

### What It Is
The operating system for coffee shop operations. Training, accountability, and performance — all in one platform.

### Tagline Options
- **Primary:** "Run every shift like your best shift."
- **Alt 1:** "Your coffee shop's operating system."
- **Alt 2:** "Train. Track. Transform."
- **Alt 3:** "Shift the way you operate."

### Brand Personality
| Trait | Description |
|-------|-------------|
| **Professional** | Trusted by owners who take their business seriously |
| **Efficient** | Respects your time — no bloat, no fluff |
| **Warm** | Coffee industry at heart — approachable, not corporate |
| **Empowering** | Makes your team better, not just more watched |
| **Modern** | Clean, fast, feels like the future |

### Voice & Tone
- **Confident but not arrogant.** "We know coffee shop ops" not "We're the best."
- **Direct.** Say it in fewer words. Coffee people are busy.
- **Supportive.** Partner energy, not vendor energy.
- **Occasional wit.** Coffee puns welcome but never forced.

**Examples:**
- ✅ "Your opening checklist, verified with photos. No more trust-me-I-did-it."
- ✅ "New hire to bar-ready in half the time."
- ❌ "Leverage synergistic operational efficiencies across your retail footprint."
- ❌ "We're revolutionizing the coffee industry with AI."

---

## 2. Logo System

### Primary Logo Mark (Icon)
**Concept:** A coffee cup silhouette integrated with an upward shift arrow — representing operational excellence and upward momentum.

**Specifications for designer:**
- Geometric/minimal style
- Coffee cup viewed from slight angle, with steam or rim forming an upward arrow (⬆️ or ↗️)
- Should work at 16x16 favicon AND 512x512 app icon sizes
- Single-color construction (works in one color)
- Rounded corners on the icon container (like an app icon)

**Alternate concept:** Abstract "B" + "S" monogram where the letterforms suggest a coffee cup and shift arrow.

### Logo Variations
1. **Icon Only** — App icon, favicon, avatar
2. **Icon + Wordmark (Horizontal)** — Nav bars, email headers
3. **Wordmark Only** — When the icon is already present or too small
4. **Icon + Wordmark (Stacked)** — Login screens, splash pages

### Wordmark Typography
- **Font:** Plus Jakarta Sans (already in the app) — Extra Bold / 800 weight
- **Styling:** ALL CAPS, tight letter-spacing (-0.02em)
- **"Brew"** in primary color, **"shift"** in primary color (single color)
- Alternative: **"Brew"** bold + **"shift"** regular weight for visual hierarchy

### Clear Space
Minimum clear space around the logo = height of the "B" in the wordmark on all sides.

### Minimum Sizes
- Icon only: 24px minimum
- Icon + wordmark: 120px wide minimum
- Favicon: 16x16 (icon only, simplified)

---

## 3. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Navy** (Primary) | `#0F2B3C` | 15, 43, 60 | Sidebar, nav, primary buttons, login background |
| **White** | `#FFFFFF` | 255, 255, 255 | Cards, text on dark, backgrounds |
| **Slate** | `#1E3A4C` | 30, 58, 76 | Hover states, secondary navy |

### Accent Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Copper** | `#C77B3C` | 199, 123, 60 | CTAs, highlights, active states, links |
| **Warm Cream** | `#F5F0E8` | 245, 240, 232 | Page backgrounds, cards, light mode base |
| **Espresso** | `#2C1810` | 44, 24, 16 | Dark text on light backgrounds |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#22C55E` | Completed tasks, approvals, on-time |
| **Warning** | `#F59E0B` | Late submissions, approaching deadlines |
| **Danger** | `#EF4444` | Missed checklists, deactivation, errors |
| **Info** | `#3B82F6` | Toast sync, tips, informational |

### Color Ratios
- Navy + White = 80% of the UI
- Copper = 10% (draw attention, CTAs)
- Semantic = 5% (status indicators)
- Cream = 5% (background warmth)

### Why These Colors?
- **Navy** = trust, professionalism, reliability (keeps the current app's proven dark UI)
- **Copper** = warmth, coffee, premium feel (replaces the red accent — red feels like an error in an ops tool)
- **Cream** = organic warmth, coffee shop aesthetic (not sterile white)

---

## 4. Typography

### Primary Font: Plus Jakarta Sans
Already loaded in the app. Modern geometric sans-serif with warmth.

| Style | Weight | Usage |
|-------|--------|-------|
| **Extra Bold (800)** | Headings, logo, page titles | `MANAGER HUB`, `TEAM MANAGEMENT` |
| **Bold (700)** | Sub-headings, card titles, nav items | Section headers, user names |
| **Semibold (600)** | Labels, badges, button text | `ADMIN`, `TRAINEE`, form labels |
| **Medium (500)** | Body text, descriptions | Paragraphs, list items |
| **Regular (400)** | Secondary text, metadata | Timestamps, helper text |

### Type Scale
| Element | Size | Weight | Case |
|---------|------|--------|------|
| Page Title | 32-40px | 800 | UPPERCASE |
| Section Header | 20-24px | 700-800 | UPPERCASE |
| Card Title | 16-18px | 700 | UPPERCASE |
| Body | 14-16px | 400-500 | Sentence case |
| Caption/Label | 10-12px | 600-700 | UPPERCASE, wide tracking |
| Badge | 10-11px | 700 | UPPERCASE |

### Letter Spacing
- Headings: `-0.02em` (tight)
- Labels/Badges: `0.05em - 0.1em` (wide, for legibility at small sizes)
- Body: `0` (default)

---

## 5. Iconography

### Icon Library: Lucide React
Already in use. Clean, consistent stroke-based icons.

### Icon Usage
- **Navigation:** 20-24px, 2px stroke
- **In-card:** 16-18px, 2px stroke
- **Badges/inline:** 14-16px, 2.5px stroke
- **Always use the same stroke weight within a context**

### Key Icons by Feature
| Feature | Icon | Lucide Name |
|---------|------|-------------|
| Training | `GraduationCap` | graduation-cap |
| Checklists | `ClipboardCheck` | clipboard-check |
| Performance | `TrendingUp` | trending-up |
| Team | `Users` | users |
| Store | `MapPin` | map-pin |
| Toast Integration | `Utensils` | utensils |
| AI Features | `Sparkles` | sparkles |
| Settings | `Settings` | settings |
| Security | `Shield` | shield |

---

## 6. Component Patterns

### Cards
- Background: White (`#FFFFFF`)
- Border radius: `12px`
- Shadow: `0 1px 3px rgba(0,0,0,0.08)`
- Padding: `20-24px`
- Hover: subtle shadow increase

### Buttons
| Type | Background | Text | Border | Usage |
|------|-----------|------|--------|-------|
| Primary | Navy `#0F2B3C` | White | None | Main actions |
| Accent | Copper `#C77B3C` | White | None | CTAs, highlights |
| Secondary | White | Navy | 1px Navy | Cancel, back |
| Danger | Red `#EF4444` | White | None | Delete, deactivate |
| Ghost | Transparent | Navy | None | Tertiary actions |

### Form Inputs
- Background: Light gray `#F9FAFB`
- Border: 1px `#E5E7EB`
- Border radius: `8px`
- Focus: 2px ring in Navy with 10% opacity
- Padding: `12-16px`
- Font: Medium 500

### Badges / Pills
- Border radius: `full` (pill shape)
- Padding: `2px 8px`
- Font: 10-11px, Bold 700, UPPERCASE
- Color-coded by role or status

---

## 7. Photography & Imagery Style

### When Photos Are Used
- Landing page hero
- Marketing materials
- Onboarding illustrations

### Photo Guidelines
- **Authentic coffee shop environments** — real shops, not stock
- **Warm lighting** — golden hour, natural light
- **People in action** — baristas making drinks, not posing
- **No heavy filters** — slight warm grade is fine
- **Diverse representation**

### Illustration Style
- Minimal line art or geometric shapes
- Navy + Copper color palette
- Used for empty states, onboarding steps, feature explanations

---

## 8. Brand Applications

### App (Current Product)
- Sidebar: Navy background, white text/icons
- Login page: Navy full-screen with white card
- Cards: White on cream background
- Accent: Copper for CTAs and active states

### Landing Page
- Hero: Navy gradient background with white text
- Sections: Alternating white and cream
- CTAs: Copper buttons
- Screenshots: In device mockups with subtle shadow

### Email Communications
- Header: Navy bar with white Brewshift logo
- Body: White background
- CTA buttons: Copper
- Footer: Light gray with navy text

### Social Media
- Profile: Icon mark on navy circle
- Posts: Navy + white + copper palette
- Consistency: Always use the wordmark, never just "BS"

---

## 9. Domain Strategy

| Domain | Status | Use |
|--------|--------|-----|
| `brewshift.app` | **Buy now** | Primary product URL |
| `brewshift.com` | Expiring Feb 2, 2026 — acquire | Redirect → .app (eventually primary) |
| `brewshift.io` | Available | Hold/redirect |
| `getbrewshift.com` | Available | Marketing alternate |

### URL Structure (Future)
- `brewshift.app` — Landing page / marketing
- `app.brewshift.app` — The product (or just the root)
- `docs.brewshift.app` — Help center / documentation
- `{shopname}.brewshift.app` — Per-shop subdomains (future)

---

## 10. Competitive Positioning

### One-Liner
"Brewshift is the all-in-one operations platform for coffee shops — training, photo-verified checklists, Toast POS data, and AI auditing in a single app."

### Elevator Pitch (30 seconds)
"Coffee shop owners spend their days juggling training, checklists, and accountability — usually with a binder and hope. Brewshift replaces all of that with a single app. New hires train themselves through interactive modules. Opening and closing checklists are photo-verified and AI-audited. Toast POS data flows in automatically so you can see sales, turn times, and who's on shift — without being there. It takes 5 minutes to set up and your team can start using it the same day."

### Key Differentiators
1. **Purpose-built for coffee shops** (not generic restaurant software)
2. **Toast POS integration** (live sales, labor, turn times — no one else does this)
3. **Photo verification + AI auditing** (actual proof, not checkboxes)
4. **Training + ops in one app** (competitors are one or the other)
5. **Self-service setup in 5 minutes** (no sales calls, no implementation fee)

---

## 11. Naming Conventions

### Product Names
- **Brewshift** — The overall platform
- **Brewshift Academy** — Training modules section
- **Brewshift Logbook** — Checklists / operational logging
- **Brewshift Pulse** — Dashboard / real-time performance
- **Barista Brain** — AI assistant (keep this name — it's great)

### Plan Names
- **Starter** — Solo owner, basic features
- **Pro** — Full platform, Toast integration
- **Scale** — Multi-unit, advanced analytics

---

## 12. Legal

### Trademark
- **"Brewshift"** — File for trademark in Class 42 (SaaS/software) and Class 9 (downloadable software)
- The name is a **coined compound word** — strongest category of trademark
- No existing registrations found for "Brewshift" in USPTO
- File intent-to-use (ITU) application before public launch

### Copyright
- All training content, UI design, and code are original works
- © 2026 Brewshift, LLC (or whatever entity Daniel creates)

### Notes
- The `brewshift.com` domain is currently owned by someone else (site is dead, expiring Feb 2, 2026)
- No evidence of active business use of the "Brewshift" name anywhere
- Low conflict risk, but monitor the .com situation

---

*This brand book is a living document. Update as the brand evolves.*
