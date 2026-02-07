export const mockData = {
  // Combined stats for both locations
  combinedStats: {
    todaySales: 2847,
    todayOrders: 186,
    avgOrderValue: 15.31,
    staffOnDuty: 8,
    weeklyRevenue: 19250,
    monthlyRevenue: 82340,
  },

  // Individual location stats
  locationStats: {
    littleElm: {
      todaySales: 1623,
      todayOrders: 108,
      avgOrderValue: 15.03,
      staffOnDuty: 4,
      weeklyRevenue: 11200,
      monthlyRevenue: 47680,
      status: 'open',
      manager: 'Kate',
      hoursToday: '5:30 AM - 7:00 PM'
    },
    prosper: {
      todaySales: 1224,
      todayOrders: 78,
      avgOrderValue: 15.69,
      staffOnDuty: 4,
      weeklyRevenue: 8050,
      monthlyRevenue: 34660,
      status: 'open',
      manager: 'TBD',
      hoursToday: '6:00 AM - 6:00 PM'
    }
  },

  // Sales data for charts
  salesData: {
    daily: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      littleElm: [1450, 1623, 1389, 1756, 1892, 2103, 1654],
      prosper: [1123, 1224, 1067, 1298, 1445, 1632, 1187],
    },
    hourly: {
      labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM'],
      data: [45, 124, 267, 189, 156, 134, 178, 145, 123, 167, 189, 145, 89],
    }
  },

  // Staff data
  staffData: {
    totalEmployees: 12,
    activeToday: 8,
    applicants: 6,
    interviewsScheduled: 3,
    newHires: 1,
    recentHires: [
      { name: 'Sydney Carter', position: 'Barista', startDate: '2026-01-27', location: 'Prosper' }
    ],
    upcomingInterviews: [
      { name: 'Moriah Peralta', position: 'Barista', date: '2026-02-08', time: '2:00 PM' },
      { name: 'Kylie Kirn', position: 'Barista', date: '2026-02-09', time: '10:00 AM' },
    ]
  },

  // Menu performance
  menuData: {
    topSellers: [
      { name: 'Signature Latte', sales: 42, revenue: 231, category: 'Espresso' },
      { name: 'Iced Coffee', sales: 38, revenue: 152, category: 'Cold Coffee' },
      { name: 'Americano', sales: 31, revenue: 139.5, category: 'Espresso' },
      { name: 'Cappuccino', sales: 28, revenue: 154, category: 'Espresso' },
      { name: 'Cold Brew', sales: 24, revenue: 120, category: 'Cold Coffee' },
    ],
    categoryPerformance: [
      { category: 'Espresso', sales: 156, percentage: 42 },
      { category: 'Cold Coffee', sales: 89, percentage: 24 },
      { category: 'Tea', sales: 67, percentage: 18 },
      { category: 'Pastries', sales: 45, percentage: 12 },
      { category: 'Other', sales: 15, percentage: 4 },
    ]
  },

  // Financial data
  financialData: {
    revenue: {
      daily: 2847,
      weekly: 19250,
      monthly: 82340,
      yearly: 956000,
    },
    expenses: {
      daily: 1538,
      weekly: 10266,
      monthly: 44285,
      yearly: 531420,
    },
    profit: {
      daily: 1309,
      weekly: 8984,
      monthly: 38055,
      yearly: 424580,
    },
    fundraising: {
      target: 2250000,
      raised: 500000,
      percentage: 22.2,
      deadline: '2026-02-18',
      investors: 8,
      recentInvestments: [
        { investor: 'Local Family Fund', amount: 125000, date: '2026-01-15' },
        { investor: 'Coffee Ventures LLC', amount: 75000, date: '2026-01-22' },
      ]
    }
  },

  // Marketing data
  marketingData: {
    socialMedia: {
      instagram: { followers: 3420, engagement: 4.2, posts: 28 },
      facebook: { followers: 1680, engagement: 2.8, posts: 18 },
      tiktok: { followers: 890, engagement: 8.5, posts: 12 },
    },
    campaigns: [
      { name: 'Spring Menu Launch', status: 'active', reach: 12500, conversions: 186 },
      { name: 'Loyalty Program', status: 'ongoing', reach: 8900, conversions: 234 },
    ],
    upcomingPosts: [
      { platform: 'Instagram', content: 'New Spring Drinks', date: '2026-02-08' },
      { platform: 'TikTok', content: 'Barista Training Video', date: '2026-02-09' },
    ]
  },

  // Recent activity feed
  recentActivity: [
    { 
      type: 'sale', 
      message: 'Large order completed - $67.50 (Prosper)', 
      time: '2 minutes ago',
      icon: 'dollar-sign'
    },
    { 
      type: 'staff', 
      message: 'Sydney Carter completed training module', 
      time: '15 minutes ago',
      icon: 'user-check'
    },
    { 
      type: 'inventory', 
      message: 'Low stock alert: Oat milk (Little Elm)', 
      time: '32 minutes ago',
      icon: 'alert-triangle'
    },
    { 
      type: 'review', 
      message: 'New 5-star review on Google (Little Elm)', 
      time: '1 hour ago',
      icon: 'star'
    },
    { 
      type: 'interview', 
      message: 'Interview scheduled: Moriah P. - Tomorrow 2PM', 
      time: '2 hours ago',
      icon: 'calendar'
    },
  ]
}