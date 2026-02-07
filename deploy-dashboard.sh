#!/bin/bash

echo "🚀 Deploying Boundaries Management Dashboard..."

# Fix npm permissions (run this manually if needed)
# sudo chown -R $(whoami) ~/.npm

# Navigate to dashboard
cd boundaries-management-dashboard

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building for production..."
npm run build

echo "🌐 Starting development server..."
npm run dev

echo "✅ Dashboard running at: http://localhost:3000"
echo ""
echo "📊 Dashboard Features:"
echo "• Executive metrics for both locations"
echo "• Staff hiring pipeline (Sydney Carter listed)"
echo "• Fundraising progress ($500K of $2.25M)"
echo "• Sales analytics and trends"
echo "• Beautiful coffee shop branding"
echo ""
echo "🚀 To deploy to production:"
echo "npm run build && npx vercel deploy"