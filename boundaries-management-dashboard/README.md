# Boundaries Coffee Management Dashboard

A comprehensive executive dashboard for managing Boundaries Coffee's drive-through locations in Little Elm and Prosper, TX.

## 🎯 Overview

This dashboard provides real-time operational insights for coffee shop management including sales tracking, staff management, menu performance, financial metrics, and marketing analytics.

### Key Features

- **📊 Executive Overview**: Real-time sales, orders, and performance metrics
- **👥 Staff Management**: Hiring pipeline, scheduling, and training progress  
- **📋 Menu Management**: Item performance and seasonal rollout tracking
- **💰 Financial Dashboard**: Revenue, expenses, and fundraising progress
- **📱 Marketing Command**: Social media metrics and campaign tracking
- **🏪 Location Comparison**: Side-by-side analytics for both locations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 🎨 Design System

### Brand Colors
- **Primary**: `#6e886e` (Sage green)
- **Secondary**: `#d4864a` (Coffee brown)  
- **Accent**: `#f59e0b` (Golden yellow)

### Theme Support
- Light/Dark mode toggle
- Responsive design (mobile-first)
- Touch-friendly interface for tablet use

## 📊 Data Structure

The dashboard currently uses mock data located in `/data/mockData.ts`. This can be easily replaced with real API integrations.

### Mock Data Includes:
- Daily/weekly/monthly sales figures
- Location-specific performance metrics
- Staff hiring pipeline and scheduling
- Menu item performance and categories
- Financial data and fundraising progress
- Marketing metrics and campaign data
- Real-time activity feed

## 🔧 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + React Chart.js 2
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📱 Responsive Design

The dashboard is optimized for:
- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Touch-friendly interface with collapsible panels
- **Mobile**: Streamlined view with essential metrics

## 🔄 API Integration

To connect real data sources:

1. **Toast POS Integration**
   - Replace mock sales data with Toast API calls
   - Add real-time order tracking
   - Connect inventory management

2. **Sling Scheduling**
   - Staff scheduling and time tracking
   - Employee management features

3. **QuickBooks**
   - Financial data synchronization
   - Expense tracking and reporting

4. **TapMango Loyalty**
   - Customer analytics
   - Loyalty program metrics

## 🎯 Business Context

### Locations
- **Little Elm**: Primary location with manager Kate
- **Prosper**: Newer location, hiring manager TBD

### Current Goals
- **Fundraising**: $500K raised of $2.25M goal (deadline Feb 18, 2026)
- **Hiring**: Active recruitment for Prosper location
- **Menu**: Spring 2026 seasonal rollout planning
- **Operations**: Streamline multi-location management

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
npm run build
npx vercel deploy
```

### Docker
```bash
# Build container
docker build -t boundaries-dashboard .

# Run container
docker run -p 3000:3000 boundaries-dashboard
```

## 📈 Future Enhancements

### Planned Features
1. **Real-time Notifications**: Push alerts for critical events
2. **Mobile App**: React Native companion app
3. **Advanced Analytics**: Predictive modeling and forecasting
4. **Inventory Management**: Low stock alerts and auto-ordering
5. **Employee Portal**: Self-service scheduling and training
6. **Customer Analytics**: Loyalty program insights and demographics

### Technical Roadmap
1. **API Layer**: Centralized data service with caching
2. **Real-time Updates**: WebSocket integration for live data
3. **Advanced Charts**: Interactive dashboards with drill-down
4. **Offline Support**: PWA capabilities for tablet use
5. **Multi-tenant**: Support for franchise expansion

## 🛠️ Development

### Project Structure
```
boundaries-management-dashboard/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard home
├── components/            # React components
│   ├── Header.tsx         # Top navigation
│   ├── Sidebar.tsx        # Left navigation
│   ├── QuickStats.tsx     # Metric cards
│   └── ...
├── data/                  # Data layer
│   └── mockData.ts        # Mock business data
└── lib/                   # Utilities
```

### Component Guidelines
- Use TypeScript for all components
- Follow compound component patterns
- Implement proper loading states
- Add error boundaries for robustness

### Styling Conventions
- Use Tailwind utility classes
- Custom components in `globals.css`
- Dark mode support via CSS variables
- Mobile-first responsive design

## 📞 Support

For technical support or business questions:

**Daniel Keene**  
Owner, Boundaries Coffee  
Email: daniel@boundariescoffee.com  
Phone: 817.705.9400

**Business Locations:**
- Little Elm: [Address TBD]
- Prosper: [Address TBD]

---

Built with ❤️ for the Boundaries Coffee team.