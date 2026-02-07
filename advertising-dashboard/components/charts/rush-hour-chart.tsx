'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface RushHourData {
  breakfast: {
    hours: Array<{ hour: number; label: string; impressions: number; clicks: number; revenue: number; transactions: number }>;
    total_revenue: number;
    total_transactions: number;
    ad_spend: number;
    roas: number;
    best_platform: string;
  };
  lunch: {
    hours: Array<{ hour: number; label: string; impressions: number; clicks: number; revenue: number; transactions: number }>;
    total_revenue: number;
    total_transactions: number;
    ad_spend: number;
    roas: number;
    best_platform: string;
  };
}

interface RushHourChartProps {
  data: RushHourData;
}

export function RushHourChart({ data }: RushHourChartProps) {
  const allHours = [
    ...data.breakfast.hours.map(h => ({ ...h, period: 'Breakfast' })),
    { hour: 9, label: '9 AM', impressions: 0, clicks: 0, revenue: 280, transactions: 42, period: 'Mid-Morning' },
    { hour: 10, label: '10 AM', impressions: 0, clicks: 0, revenue: 310, transactions: 48, period: 'Mid-Morning' },
    ...data.lunch.hours.map(h => ({ ...h, period: 'Lunch' })),
    { hour: 14, label: '2 PM', impressions: 0, clicks: 0, revenue: 220, transactions: 35, period: 'Afternoon' },
    { hour: 15, label: '3 PM', impressions: 0, clicks: 0, revenue: 180, transactions: 28, period: 'Afternoon' },
    { hour: 16, label: '4 PM', impressions: 0, clicks: 0, revenue: 150, transactions: 24, period: 'Afternoon' },
    { hour: 17, label: '5 PM', impressions: 0, clicks: 0, revenue: 120, transactions: 19, period: 'Evening' },
  ];

  const getBarColor = (period: string) => {
    switch (period) {
      case 'Breakfast': return '#92400e';
      case 'Lunch': return '#d97706';
      case 'Mid-Morning': return '#e5e7eb';
      case 'Afternoon': return '#e5e7eb';
      case 'Evening': return '#e5e7eb';
      default: return '#e5e7eb';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rush Hour Performance</CardTitle>
          <div className="flex gap-2">
            <Badge variant="success">☀️ Breakfast 6-9am</Badge>
            <Badge variant="warning">🍽️ Lunch 11am-2pm</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-800">☀️ Breakfast Rush</span>
              <Badge variant="success">{data.breakfast.roas.toFixed(0)}x ROAS</Badge>
            </div>
            <p className="text-2xl font-bold text-amber-900">{formatCurrency(data.breakfast.total_revenue)}</p>
            <p className="text-xs text-amber-700 mt-1">
              {data.breakfast.total_transactions} transactions • {formatCurrency(data.breakfast.ad_spend)} ad spend
            </p>
            <p className="text-xs text-amber-600 mt-1">Best: {data.breakfast.best_platform}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-800">🍽️ Lunch Rush</span>
              <Badge variant="success">{data.lunch.roas.toFixed(0)}x ROAS</Badge>
            </div>
            <p className="text-2xl font-bold text-orange-900">{formatCurrency(data.lunch.total_revenue)}</p>
            <p className="text-xs text-orange-700 mt-1">
              {data.lunch.total_transactions} transactions • {formatCurrency(data.lunch.ad_spend)} ad spend
            </p>
            <p className="text-xs text-orange-600 mt-1">Best: {data.lunch.best_platform}</p>
          </div>
        </div>

        {/* Hourly Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={allHours} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="label"
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
                formatter={(value: unknown) => [`$${Number(value).toFixed(0)}`, 'Revenue']}
              />
              <Legend />
              <Bar dataKey="revenue" name="Hourly Revenue" radius={[4, 4, 0, 0]}>
                {allHours.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.period)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
