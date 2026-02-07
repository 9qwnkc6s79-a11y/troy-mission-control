# ☕ Boundaries Coffee — Advertising Dashboard

A comprehensive advertising performance dashboard built for Boundaries Coffee (Little Elm & Prosper, TX). Track Meta Ads, Google Ads, and Toast POS sales data in one place to optimize ad spend and measure real business impact.

## 🖥️ Dashboard Views

### 1. Executive Summary
- **Real-time ROAS tracking** — Revenue from Toast vs combined ad spend
- **Today's key metrics** — Revenue, ad spend, store visits, impressions, clicks
- **30-day trend line** — ROAS over time
- **Revenue vs ad spend correlation** — Daily overlay chart
- **Platform comparison** — Meta vs Google side-by-side
- **Rush hour performance** — 6-9am breakfast & 11am-2pm lunch effectiveness
- **Campaign alerts** — Flags duplicate campaigns and wrong objectives

### 2. Campaign Performance
- **All campaigns** across Meta and Google with detailed metrics
- **Issue detection** — Flags duplicates, wrong objectives, low CTR
- **Budget utilization** — How much of daily budget is being spent
- **Spend distribution** — Pie chart by platform

### 3. Revenue Correlation
- **Toast POS data** overlaid with ad spend
- **Revenue by location** — Little Elm vs Prosper
- **Average ticket trend** — Track over time
- **Top selling products** — From Toast POS data
- **Transaction volume** — Daily patterns

### 4. Local Performance
- **Radius analysis** — 5mi vs 10mi vs 15mi targeting effectiveness
- **Store visits by distance** — Where customers come from
- **CPA by radius** — Cost per acquisition at each distance
- **Optimization recommendations** — Data-driven budget allocation suggestions

### 5. Seasonal Tracking
- **Product-specific campaigns** — Tiramisu Latte, Holiday Blend, etc.
- **Campaign lifecycle** — Active, completed, planned
- **Units sold vs ad spend** — Per-product ROI
- **Rush hour deep dive** — Breakfast and lunch performance

### 6. Upload Data
- **Toast CSV import** — Upload sales reports for correlation
- **Step-by-step guide** — How to export from Toast POS
- **Automatic parsing** — Supports standard Toast export format

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Install & Run
```bash
# Clone the repository
git clone <your-repo-url>
cd advertising-dashboard

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your API credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the dashboard works immediately with sample data.

## 🔧 API Configuration

The dashboard works with **sample data** out of the box. Configure APIs for live data:

### Meta Business API
```env
META_ACCESS_TOKEN=your_long_lived_token
META_AD_ACCOUNT_ID=468165461888446
META_BUSINESS_ID=1264820400638644
```

**Setup:**
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create an app → Add Marketing API
3. Generate a long-lived access token (System User recommended)
4. Token lasts 60 days; set up token refresh for production

### Google Ads API
```env
GOOGLE_ADS_CLIENT_ID=your_oauth_client_id
GOOGLE_ADS_CLIENT_SECRET=your_oauth_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_CUSTOMER_ID=123-456-7890
GOOGLE_ADS_DEVELOPER_TOKEN=your_dev_token
```

**Setup:**
1. [Apply for API access](https://ads.google.com/home/tools/api-center/)
2. Create OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com/)
3. Complete the OAuth flow to get a refresh token
4. Developer token requires Google approval (Basic access for read-only)

### Toast POS
**Option A:** CSV Upload (recommended to start)
- Export from Toast: **Reports → Sales Summary → Export CSV**
- Upload through the dashboard's Upload Data page

**Option B:** API Integration
```env
TOAST_CLIENT_ID=your_toast_client_id
TOAST_CLIENT_SECRET=your_toast_client_secret
TOAST_RESTAURANT_ID=your_restaurant_id
```
Note: Toast API requires partner program access.

## 🌐 Deploy to Vercel

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

### Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add META_ACCESS_TOKEN
vercel env add META_AD_ACCOUNT_ID
vercel env add META_BUSINESS_ID
# ... add other variables

# Deploy to production
vercel --prod
```

### Via GitHub
1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Project Settings → Environment Variables
4. Deploy automatically on every push

## 📁 Project Structure

```
advertising-dashboard/
├── app/
│   ├── api/
│   │   ├── dashboard/route.ts    # Aggregated dashboard data
│   │   ├── meta/route.ts         # Meta Ads API proxy
│   │   ├── google-ads/route.ts   # Google Ads API proxy
│   │   ├── toast/route.ts        # Toast POS data
│   │   └── upload/route.ts       # CSV upload handler
│   ├── dashboard/
│   │   ├── page.tsx              # Executive Summary
│   │   ├── campaigns/page.tsx    # Campaign Performance
│   │   ├── revenue/page.tsx      # Revenue Correlation
│   │   ├── local/page.tsx        # Local Performance
│   │   ├── seasonal/page.tsx     # Seasonal Tracking
│   │   ├── upload/page.tsx       # Data Upload
│   │   ├── settings/page.tsx     # Configuration
│   │   └── layout.tsx            # Dashboard layout w/ sidebar
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── charts/
│   │   ├── roas-trend.tsx        # ROAS over time
│   │   ├── revenue-vs-spend.tsx  # Revenue/spend overlay
│   │   ├── rush-hour-chart.tsx   # Hourly performance
│   │   ├── radius-performance.tsx # Distance analysis
│   │   ├── location-comparison.tsx # Store comparison
│   │   └── seasonal-campaigns.tsx # Product campaigns
│   ├── metrics/
│   │   ├── metric-card.tsx       # KPI card component
│   │   ├── platform-comparison.tsx # Platform table
│   │   └── campaign-table.tsx    # Campaign details table
│   ├── layout/
│   │   ├── sidebar.tsx           # Navigation sidebar
│   │   └── header.tsx            # Page header w/ date picker
│   └── ui/
│       ├── card.tsx              # Card components
│       ├── badge.tsx             # Badge component
│       └── date-range-picker.tsx # Date range selector
├── lib/
│   ├── meta-api.ts              # Meta Business API client
│   ├── google-ads-api.ts        # Google Ads API client
│   ├── toast-api.ts             # Toast POS API + CSV parser
│   ├── sample-data.ts           # Demo/sample data generator
│   └── utils.ts                 # Formatting utilities
├── types/
│   └── index.ts                 # TypeScript type definitions
├── .env.example                 # Environment variable template
├── .env.local                   # Local environment (gitignored)
├── tailwind.config.ts           # Tailwind configuration
├── next.config.mjs              # Next.js configuration
└── package.json                 # Dependencies
```

## 🎨 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **CSV Parsing:** Built-in parser (papaparse available)
- **Deployment:** Vercel

## 📊 Key Business Metrics Tracked

| Metric | Source | Description |
|--------|--------|-------------|
| ROAS | Toast + Ads | Revenue / Ad Spend |
| Store Visits | Meta + Google | In-store visits from ads |
| CPA | Calculated | Cost per customer acquisition |
| Rush Hour ROAS | Toast + Ads | 6-9am and 11am-2pm performance |
| Radius Performance | Google Ads | 5mi vs 10mi targeting |
| Seasonal ROI | All Sources | Product-specific campaign returns |

## 🏪 Store Context

- **Little Elm, TX** — Primary location
- **Prosper, TX** — Second location  
- **Meta Business ID:** 1264820400638644
- **Meta Ad Account:** act_468165461888446
- **Rush Hours:** 6-9am (breakfast), 11am-2pm (lunch)

## 📝 Notes

- Dashboard starts with realistic sample data — no API setup required
- All API errors gracefully fall back to sample data
- CSV upload supports standard Toast POS export format
- Mobile-responsive design for on-the-go monitoring
- Campaign issue detection flags duplicates and wrong objectives automatically

---

Built for Boundaries Coffee ☕
