// ============================================
// Sample Data for Dashboard Development & Demo
// ============================================
// This data is used when API credentials aren't configured yet.
// Remove or disable once live APIs are connected.
// ============================================

import { format, subDays, eachDayOfInterval } from 'date-fns';

// Helper to generate date range
function getDates(days: number): string[] {
  const end = new Date();
  const start = subDays(end, days);
  return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
}

// ---------- Meta Ads Sample Data ----------
export function getSampleMetaInsights() {
  const dates = getDates(30);
  return dates.map(date => ({
    date,
    campaign_name: 'Boundaries Coffee - Local Awareness',
    impressions: Math.floor(800 + Math.random() * 1200),
    reach: Math.floor(600 + Math.random() * 800),
    clicks: Math.floor(15 + Math.random() * 45),
    spend: parseFloat((8 + Math.random() * 17).toFixed(2)),
    cpc: parseFloat((0.35 + Math.random() * 0.65).toFixed(2)),
    ctr: parseFloat((1.2 + Math.random() * 2.8).toFixed(2)),
    store_visits: Math.floor(2 + Math.random() * 8),
  }));
}

export function getSampleMetaCampaigns() {
  return [
    {
      id: '1001',
      name: 'Boundaries Coffee - Little Elm Awareness',
      status: 'ACTIVE' as const,
      objective: 'REACH',
      daily_budget: 15,
      spend_today: 12.47,
      impressions_today: 1847,
      clicks_today: 34,
      ctr: 1.84,
      store_visits: 5,
    },
    {
      id: '1002',
      name: 'Boundaries Coffee - Prosper Store Traffic',
      status: 'ACTIVE' as const,
      objective: 'STORE_TRAFFIC',
      daily_budget: 20,
      spend_today: 18.23,
      impressions_today: 2341,
      clicks_today: 52,
      ctr: 2.22,
      store_visits: 8,
    },
    {
      id: '1003',
      name: 'Tiramisu Latte - Seasonal Promo',
      status: 'ACTIVE' as const,
      objective: 'CONVERSIONS',
      daily_budget: 10,
      spend_today: 8.91,
      impressions_today: 1523,
      clicks_today: 41,
      ctr: 2.69,
      store_visits: 6,
    },
    {
      id: '1004',
      name: 'Boundaries Coffee - Duplicate (PAUSE THIS)',
      status: 'ACTIVE' as const,
      objective: 'ENGAGEMENT',
      daily_budget: 10,
      spend_today: 9.44,
      impressions_today: 3102,
      clicks_today: 12,
      ctr: 0.39,
      store_visits: 0,
    },
  ];
}

// ---------- Google Ads Sample Data ----------
export function getSampleGoogleAdsCampaigns() {
  return [
    {
      id: '2001',
      name: 'Boundaries Coffee - Local Search',
      status: 'ENABLED',
      type: 'SEARCH',
      budget: 25,
      spend: 22.15,
      impressions: 3421,
      clicks: 89,
      conversions: 12,
      store_visits: 7,
      cost_per_conversion: 1.85,
    },
    {
      id: '2002',
      name: 'Boundaries Coffee - Maps/Local',
      status: 'ENABLED',
      type: 'LOCAL',
      budget: 15,
      spend: 13.67,
      impressions: 5234,
      clicks: 67,
      conversions: 8,
      store_visits: 11,
      cost_per_conversion: 1.71,
    },
    {
      id: '2003',
      name: 'Boundaries Coffee - Display Retarget',
      status: 'ENABLED',
      type: 'DISPLAY',
      budget: 10,
      spend: 8.32,
      impressions: 12450,
      clicks: 23,
      conversions: 3,
      store_visits: 2,
      cost_per_conversion: 2.77,
    },
  ];
}

// ---------- Toast POS Sample Data ----------
export function getSampleToastData() {
  const dates = getDates(30);
  const locations: Array<'Little Elm' | 'Prosper'> = ['Little Elm', 'Prosper'];

  return dates.flatMap(date =>
    locations.map(location => {
      const isWeekend = [0, 6].includes(new Date(date).getDay());
      const baseRevenue = location === 'Little Elm' ? 1800 : 2200;
      const multiplier = isWeekend ? 1.3 : 1.0;

      const hourlyBreakdown = Array.from({ length: 15 }, (_, i) => {
        const hour = i + 6; // 6am to 8pm
        let hourMultiplier = 0.5;
        if (hour >= 6 && hour < 9) hourMultiplier = 2.0; // Breakfast rush
        else if (hour >= 11 && hour < 14) hourMultiplier = 1.8; // Lunch rush
        else if (hour >= 14 && hour < 17) hourMultiplier = 0.8; // Afternoon
        else if (hour >= 17) hourMultiplier = 0.6; // Evening

        const hourRevenue = (baseRevenue * multiplier * hourMultiplier / 15) * (0.8 + Math.random() * 0.4);
        const hourTransactions = Math.floor(hourRevenue / (5.5 + Math.random() * 3));

        return {
          hour,
          revenue: parseFloat(hourRevenue.toFixed(2)),
          transactions: hourTransactions,
        };
      });

      const totalRevenue = hourlyBreakdown.reduce((sum, h) => sum + h.revenue, 0);
      const totalTransactions = hourlyBreakdown.reduce((sum, h) => sum + h.transactions, 0);

      return {
        date,
        location,
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
        transaction_count: totalTransactions,
        average_ticket: parseFloat((totalRevenue / totalTransactions).toFixed(2)),
        hourly_breakdown: hourlyBreakdown,
        top_items: [
          { name: 'Iced Latte', quantity: Math.floor(20 + Math.random() * 30), revenue: parseFloat((120 + Math.random() * 80).toFixed(2)), category: 'Espresso' },
          { name: 'Cold Brew', quantity: Math.floor(15 + Math.random() * 25), revenue: parseFloat((90 + Math.random() * 60).toFixed(2)), category: 'Coffee' },
          { name: 'Tiramisu Latte', quantity: Math.floor(8 + Math.random() * 15), revenue: parseFloat((55 + Math.random() * 45).toFixed(2)), category: 'Seasonal' },
          { name: 'Drip Coffee', quantity: Math.floor(25 + Math.random() * 20), revenue: parseFloat((75 + Math.random() * 40).toFixed(2)), category: 'Coffee' },
          { name: 'Breakfast Sandwich', quantity: Math.floor(10 + Math.random() * 15), revenue: parseFloat((65 + Math.random() * 35).toFixed(2)), category: 'Food' },
          { name: 'Matcha Latte', quantity: Math.floor(6 + Math.random() * 12), revenue: parseFloat((40 + Math.random() * 35).toFixed(2)), category: 'Specialty' },
        ],
      };
    })
  );
}

// ---------- Dashboard Summary ----------
export function getSampleDashboardSummary() {
  const toastData = getSampleToastData();
  const todayData = toastData.filter(d => d.date === format(new Date(), 'yyyy-MM-dd'));
  const todayRevenue = todayData.reduce((sum, d) => sum + d.total_revenue, 0);

  const last30Revenue = toastData.reduce((sum, d) => sum + d.total_revenue, 0);
  const last30AdSpend = 30 * (15 + 20 + 10 + 10 + 25 + 15 + 10); // daily budgets

  return {
    today: {
      revenue: todayRevenue || 4200,
      ad_spend: 49.05 + 44.14,
      roas: todayRevenue ? todayRevenue / (49.05 + 44.14) : 45.1,
      store_visits: 19,
      transactions: todayData.reduce((sum, d) => sum + d.transaction_count, 0) || 287,
      impressions: 1847 + 2341 + 1523 + 3102 + 3421 + 5234 + 12450,
      clicks: 34 + 52 + 41 + 12 + 89 + 67 + 23,
    },
    last_7_days: {
      revenue: last30Revenue / 30 * 7,
      ad_spend: 7 * 105,
      roas: (last30Revenue / 30 * 7) / (7 * 105),
      store_visits: 133,
      cpa: (7 * 105) / 133,
    },
    last_30_days: {
      revenue: last30Revenue,
      ad_spend: last30AdSpend,
      roas: last30Revenue / last30AdSpend,
      store_visits: 570,
      cpa: last30AdSpend / 570,
    },
  };
}

// ---------- Radius Performance ----------
export function getSampleRadiusData() {
  return [
    {
      radius: '0-5mi' as const,
      impressions: 28450,
      clicks: 823,
      ctr: 2.89,
      conversions: 156,
      store_visits: 89,
      spend: 412.30,
      cpa: 2.64,
      roas: 8.2,
      color: '#10b981',
    },
    {
      radius: '5-10mi' as const,
      impressions: 45230,
      clicks: 612,
      ctr: 1.35,
      conversions: 78,
      store_visits: 34,
      spend: 523.15,
      cpa: 6.71,
      roas: 3.8,
      color: '#3b82f6',
    },
    {
      radius: '10-15mi' as const,
      impressions: 31200,
      clicks: 234,
      ctr: 0.75,
      conversions: 23,
      store_visits: 8,
      spend: 298.40,
      cpa: 12.97,
      roas: 1.4,
      color: '#f59e0b',
    },
    {
      radius: '15mi+' as const,
      impressions: 18900,
      clicks: 89,
      ctr: 0.47,
      conversions: 5,
      store_visits: 1,
      spend: 187.65,
      cpa: 37.53,
      roas: 0.4,
      color: '#ef4444',
    },
  ];
}

// ---------- Rush Hour Performance ----------
export function getSampleRushHourData() {
  return {
    breakfast: {
      period: 'breakfast' as const,
      time_range: '6:00 AM - 9:00 AM',
      hours: [
        { hour: 6, label: '6 AM', impressions: 890, clicks: 34, revenue: 420, transactions: 67 },
        { hour: 7, label: '7 AM', impressions: 1456, clicks: 58, revenue: 780, transactions: 112 },
        { hour: 8, label: '8 AM', impressions: 1230, clicks: 47, revenue: 650, transactions: 98 },
      ],
      total_ad_impressions: 3576,
      total_ad_clicks: 139,
      total_revenue: 1850,
      total_transactions: 277,
      ad_spend: 28.45,
      roas: 65.0,
      best_platform: 'Google Ads (Search)',
    },
    lunch: {
      period: 'lunch' as const,
      time_range: '11:00 AM - 2:00 PM',
      hours: [
        { hour: 11, label: '11 AM', impressions: 1123, clicks: 42, revenue: 520, transactions: 78 },
        { hour: 12, label: '12 PM', impressions: 1567, clicks: 61, revenue: 690, transactions: 95 },
        { hour: 13, label: '1 PM', impressions: 1345, clicks: 53, revenue: 580, transactions: 82 },
      ],
      total_ad_impressions: 4035,
      total_ad_clicks: 156,
      total_revenue: 1790,
      total_transactions: 255,
      ad_spend: 32.18,
      roas: 55.6,
      best_platform: 'Meta (Store Traffic)',
    },
  };
}

// ---------- Seasonal Campaigns ----------
export function getSampleSeasonalCampaigns() {
  return [
    {
      name: 'Tiramisu Latte Launch',
      product: 'Tiramisu Latte',
      start_date: '2024-11-01',
      end_date: '2025-01-31',
      status: 'active',
      total_spend: 450.00,
      total_revenue: 3200.00,
      units_sold: 534,
      roas: 7.11,
      impressions: 67800,
      clicks: 2340,
      store_visits: 189,
    },
    {
      name: 'Holiday Special Blend',
      product: 'Holiday Blend',
      start_date: '2024-12-01',
      end_date: '2024-12-31',
      status: 'completed',
      total_spend: 280.00,
      total_revenue: 1890.00,
      units_sold: 312,
      roas: 6.75,
      impressions: 45200,
      clicks: 1560,
      store_visits: 134,
    },
    {
      name: 'Summer Cold Brew Push',
      product: 'Cold Brew',
      start_date: '2025-06-01',
      end_date: '2025-08-31',
      status: 'planned',
      total_spend: 0,
      total_revenue: 0,
      units_sold: 0,
      roas: 0,
      impressions: 0,
      clicks: 0,
      store_visits: 0,
    },
    {
      name: 'Spring Matcha Promo',
      product: 'Matcha Latte',
      start_date: '2025-03-15',
      end_date: '2025-05-15',
      status: 'active',
      total_spend: 320.00,
      total_revenue: 2100.00,
      units_sold: 387,
      roas: 6.56,
      impressions: 52100,
      clicks: 1890,
      store_visits: 156,
    },
  ];
}

// ---------- Daily Trend Data ----------
export function getSampleDailyTrends() {
  const dates = getDates(30);
  return dates.map(date => {
    const isWeekend = [0, 6].includes(new Date(date).getDay());
    const weekendBoost = isWeekend ? 1.3 : 1.0;

    const metaSpend = parseFloat((25 + Math.random() * 20).toFixed(2));
    const googleSpend = parseFloat((20 + Math.random() * 15).toFixed(2));
    const totalSpend = metaSpend + googleSpend;

    const leRevenue = parseFloat((1800 * weekendBoost * (0.85 + Math.random() * 0.3)).toFixed(2));
    const prosperRevenue = parseFloat((2200 * weekendBoost * (0.85 + Math.random() * 0.3)).toFixed(2));
    const totalRevenue = leRevenue + prosperRevenue;

    return {
      date,
      meta_spend: metaSpend,
      google_spend: googleSpend,
      total_spend: totalSpend,
      little_elm_revenue: leRevenue,
      prosper_revenue: prosperRevenue,
      total_revenue: totalRevenue,
      roas: parseFloat((totalRevenue / totalSpend).toFixed(1)),
      store_visits: Math.floor(12 + Math.random() * 15),
      impressions: Math.floor(8000 + Math.random() * 12000),
      clicks: Math.floor(100 + Math.random() * 200),
    };
  });
}
