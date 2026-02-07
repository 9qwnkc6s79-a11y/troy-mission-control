// ============================================
// Toast POS API / CSV Import Integration
// ============================================
// Toast API requires partner credentials. For now, we support:
// 1. Toast API (if credentials available)
// 2. Manual CSV upload from Toast reports
// ============================================

import { ToastSalesData } from '@/types';

const TOAST_API_BASE = 'https://ws-api.toasttab.com';

// ---------- Toast API (if available) ----------
async function getToastHeaders() {
  // Toast uses OAuth2 client credentials flow
  const tokenRes = await fetch(`${TOAST_API_BASE}/authentication/v1/authentication/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: process.env.TOAST_CLIENT_ID,
      clientSecret: process.env.TOAST_CLIENT_SECRET,
      userAccessType: 'TOAST_MACHINE_CLIENT',
    }),
  });

  const tokenData = await tokenRes.json();

  return {
    'Authorization': `Bearer ${tokenData.token?.accessToken}`,
    'Toast-Restaurant-External-ID': process.env.TOAST_RESTAURANT_ID || '',
    'Content-Type': 'application/json',
  };
}

export async function getToastOrders(
  dateRange: { start: string; end: string },
  restaurantId?: string
): Promise<ToastSalesData[]> {
  try {
    const headers = await getToastHeaders();
    if (restaurantId) {
      headers['Toast-Restaurant-External-ID'] = restaurantId;
    }

    const res = await fetch(
      `${TOAST_API_BASE}/orders/v2/ordersBulk?startDate=${dateRange.start}T00:00:00.000Z&endDate=${dateRange.end}T23:59:59.999Z`,
      { headers }
    );

    if (!res.ok) {
      console.warn('Toast API unavailable, using stored data');
      return [];
    }

    const orders = await res.json();
    return processToastOrders(orders);
  } catch {
    console.warn('Toast API not configured, use CSV import');
    return [];
  }
}

// ---------- CSV Processing ----------
export function parseToastCSV(csvContent: string, location: 'Little Elm' | 'Prosper'): ToastSalesData[] {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  const dateIdx = headers.findIndex(h => h.includes('date'));
  const revenueIdx = headers.findIndex(h => h.includes('net') || h.includes('total') || h.includes('revenue'));
  const countIdx = headers.findIndex(h => h.includes('count') || h.includes('orders') || h.includes('checks'));
  const hourIdx = headers.findIndex(h => h.includes('hour') || h.includes('time'));
  const itemIdx = headers.findIndex(h => h.includes('item') || h.includes('product'));
  const qtyIdx = headers.findIndex(h => h.includes('qty') || h.includes('quantity'));

  const dailyData: Record<string, ToastSalesData> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
    if (cols.length < 2) continue;

    const date = cols[dateIdx] || '';
    if (!date) continue;

    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        location,
        total_revenue: 0,
        transaction_count: 0,
        average_ticket: 0,
        hourly_breakdown: [],
        top_items: [],
      };
    }

    const revenue = parseFloat(cols[revenueIdx]) || 0;
    const count = parseInt(cols[countIdx]) || 0;

    dailyData[date].total_revenue += revenue;
    dailyData[date].transaction_count += count;

    if (hourIdx >= 0) {
      const hour = parseInt(cols[hourIdx]) || 0;
      dailyData[date].hourly_breakdown.push({
        hour,
        revenue,
        transactions: count,
      });
    }

    if (itemIdx >= 0) {
      dailyData[date].top_items.push({
        name: cols[itemIdx] || 'Unknown',
        quantity: parseInt(cols[qtyIdx]) || 1,
        revenue,
        category: 'General',
      });
    }
  }

  return Object.values(dailyData).map(d => ({
    ...d,
    average_ticket: d.transaction_count > 0 ? d.total_revenue / d.transaction_count : 0,
  }));
}

// ---------- Process Raw Toast Orders ----------
function processToastOrders(orders: Record<string, unknown>[]): ToastSalesData[] {
  const dailyMap: Record<string, ToastSalesData> = {};

  for (const order of orders) {
    const date = String(order.openedDate || '').split('T')[0];
    const location = detectLocation(order);

    const key = `${date}-${location}`;
    if (!dailyMap[key]) {
      dailyMap[key] = {
        date,
        location,
        total_revenue: 0,
        transaction_count: 0,
        average_ticket: 0,
        hourly_breakdown: [],
        top_items: [],
      };
    }

    const total = Number(order.totalAmount) || 0;
    dailyMap[key].total_revenue += total;
    dailyMap[key].transaction_count += 1;
  }

  return Object.values(dailyMap).map(d => ({
    ...d,
    average_ticket: d.transaction_count > 0 ? d.total_revenue / d.transaction_count : 0,
  }));
}

function detectLocation(order: Record<string, unknown>): 'Little Elm' | 'Prosper' {
  const name = String(order.restaurantName || order.locationName || '').toLowerCase();
  if (name.includes('prosper')) return 'Prosper';
  return 'Little Elm';
}

// ---------- Revenue Aggregation Helpers ----------
export function aggregateRevenue(
  salesData: ToastSalesData[],
  dateRange: { start: string; end: string }
): { totalRevenue: number; totalTransactions: number; avgTicket: number; byLocation: Record<string, number> } {
  const filtered = salesData.filter(d => d.date >= dateRange.start && d.date <= dateRange.end);

  const totalRevenue = filtered.reduce((sum, d) => sum + d.total_revenue, 0);
  const totalTransactions = filtered.reduce((sum, d) => sum + d.transaction_count, 0);

  const byLocation: Record<string, number> = {};
  filtered.forEach(d => {
    byLocation[d.location] = (byLocation[d.location] || 0) + d.total_revenue;
  });

  return {
    totalRevenue,
    totalTransactions,
    avgTicket: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
    byLocation,
  };
}

// ---------- Rush Hour Revenue ----------
export function getRushHourRevenue(salesData: ToastSalesData[]): {
  breakfast: { revenue: number; transactions: number };
  lunch: { revenue: number; transactions: number };
} {
  const breakfast = { revenue: 0, transactions: 0 };
  const lunch = { revenue: 0, transactions: 0 };

  for (const day of salesData) {
    for (const hourData of day.hourly_breakdown) {
      if (hourData.hour >= 6 && hourData.hour < 9) {
        breakfast.revenue += hourData.revenue;
        breakfast.transactions += hourData.transactions;
      } else if (hourData.hour >= 11 && hourData.hour < 14) {
        lunch.revenue += hourData.revenue;
        lunch.transactions += hourData.transactions;
      }
    }
  }

  return { breakfast, lunch };
}

// ---------- Seasonal Product Performance ----------
export function getSeasonalProductRevenue(
  salesData: ToastSalesData[],
  productNames: string[]
): Record<string, { quantity: number; revenue: number }> {
  const results: Record<string, { quantity: number; revenue: number }> = {};

  for (const name of productNames) {
    results[name] = { quantity: 0, revenue: 0 };
  }

  for (const day of salesData) {
    for (const item of day.top_items) {
      for (const name of productNames) {
        if (item.name.toLowerCase().includes(name.toLowerCase())) {
          results[name].quantity += item.quantity;
          results[name].revenue += item.revenue;
        }
      }
    }
  }

  return results;
}
