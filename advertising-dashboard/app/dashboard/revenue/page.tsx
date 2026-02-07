'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { MetricCard } from '@/components/metrics/metric-card';
import { RevenueVsSpend } from '@/components/charts/revenue-vs-spend';
import { LocationComparison } from '@/components/charts/location-comparison';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { DollarSign, TrendingUp, ShoppingBag, Coffee } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

export default function RevenuePage() {
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [trends, setTrends] = useState<Array<Record<string, string | number>>>([]);
  const [toastData, setToastData] = useState<Array<Record<string, unknown>>>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [trendsRes, toastRes] = await Promise.all([
        fetch(`/api/dashboard?view=trends&period=${dateRange}`),
        fetch(`/api/toast?period=${dateRange}`),
      ]);
      const [trendsData, toastResult] = await Promise.all([
        trendsRes.json(),
        toastRes.json(),
      ]);
      setTrends(trendsData.data);
      setToastData(toastResult.data);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    }
    setIsLoading(false);
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto" />
      </div>
    );
  }

  const totalRevenue = trends.reduce((sum, t) => sum + Number(t.total_revenue), 0);
  const totalSpend = trends.reduce((sum, t) => sum + Number(t.total_spend), 0);
  const avgDailyRevenue = trends.length > 0 ? totalRevenue / trends.length : 0;
  const overallROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const littleElmRevenue = trends.reduce((sum, t) => sum + Number(t.little_elm_revenue), 0);
  const prosperRevenue = trends.reduce((sum, t) => sum + Number(t.prosper_revenue), 0);

  // Toast-specific aggregation
  const totalTransactions = toastData.reduce((sum, d) => sum + Number(d.transaction_count || 0), 0);
  const avgTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Top products from Toast data
  const productMap: Record<string, { quantity: number; revenue: number }> = {};
  toastData.forEach((day: Record<string, unknown>) => {
    const items = (day.top_items as Array<Record<string, unknown>>) || [];
    items.forEach((item) => {
      const name = String(item.name);
      if (!productMap[name]) productMap[name] = { quantity: 0, revenue: 0 };
      productMap[name].quantity += Number(item.quantity || 0);
      productMap[name].revenue += Number(item.revenue || 0);
    });
  });
  const topProducts = Object.entries(productMap)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 8);

  // Revenue correlation data
  const correlationData = trends.map(t => ({
    date: String(t.date),
    total_revenue: Number(t.total_revenue),
    meta_spend: Number(t.meta_spend),
    google_spend: Number(t.google_spend),
    total_spend: Number(t.total_spend),
  }));

  const locationData = trends.map(t => ({
    date: String(t.date),
    little_elm_revenue: Number(t.little_elm_revenue),
    prosper_revenue: Number(t.prosper_revenue),
  }));

  // Average ticket trend
  const ticketTrend = trends.map(t => {
    const dayToast = toastData.filter((d: Record<string, unknown>) => String(d.date) === String(t.date));
    const dayTransactions = dayToast.reduce((s, d) => s + Number(d.transaction_count || 0), 0);
    const dayRevenue = Number(t.total_revenue);
    return {
      date: String(t.date),
      avgTicket: dayTransactions > 0 ? dayRevenue / dayTransactions : 0,
      transactions: dayTransactions,
    };
  });

  return (
    <div>
      <Header
        title="Revenue Correlation"
        subtitle="Ad spend vs Toast POS sales data"
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          subtitle={`${trends.length} days`}
        />
        <MetricCard
          title="Overall ROAS"
          value={`${overallROAS.toFixed(1)}x`}
          icon={<TrendingUp className="w-5 h-5" />}
          valueClassName="text-emerald-600"
          subtitle={`${formatCurrency(totalSpend)} total ad spend`}
        />
        <MetricCard
          title="Transactions"
          value={formatNumber(totalTransactions)}
          icon={<ShoppingBag className="w-5 h-5" />}
          subtitle={`Avg ticket: ${formatCurrency(avgTicket)}`}
        />
        <MetricCard
          title="Avg Daily Revenue"
          value={formatCurrency(avgDailyRevenue)}
          icon={<Coffee className="w-5 h-5" />}
          subtitle="Both locations"
        />
      </div>

      {/* Location Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">📍 Little Elm</span>
              <Badge variant="info">{((littleElmRevenue / totalRevenue) * 100).toFixed(0)}%</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(littleElmRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">📍 Prosper</span>
              <Badge variant="info">{((prosperRevenue / totalRevenue) * 100).toFixed(0)}%</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(prosperRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Spend Chart */}
      <div className="mb-6">
        <RevenueVsSpend data={correlationData} />
      </div>

      {/* Location Revenue Chart */}
      <div className="mb-6">
        <LocationComparison data={locationData} />
      </div>

      {/* Avg Ticket Trend */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Ticket & Transaction Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ticketTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => format(parseISO(d), 'MMM d')}
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="ticket"
                    orientation="left"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(v) => `$${v.toFixed(0)}`}
                  />
                  <YAxis
                    yAxisId="txns"
                    orientation="right"
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(v: unknown, name: unknown) => {
                      if (name === 'avgTicket') return [`$${Number(v).toFixed(2)}`, 'Avg Ticket'];
                      return [String(v), 'Transactions'];
                    }}
                    labelFormatter={(d) => format(parseISO(d as string), 'EEEE, MMM d')}
                  />
                  <Legend />
                  <Line yAxisId="ticket" type="monotone" dataKey="avgTicket" stroke="#92400e" strokeWidth={2} dot={false} name="Avg Ticket" />
                  <Line yAxisId="txns" type="monotone" dataKey="transactions" stroke="#d97706" strokeWidth={2} dot={false} name="Transactions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>☕ Top Products (from Toast POS)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topProducts.map(([name, data], i) => (
              <div key={name} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-gray-400">#{i + 1}</span>
                  <span className="font-medium text-gray-900 truncate">{name}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {formatCurrency(data.revenue)} • {formatNumber(data.quantity)} sold
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
