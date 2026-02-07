'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface RevenueVsSpendProps {
  data: Array<{
    date: string;
    total_revenue: number;
    meta_spend: number;
    google_spend: number;
    total_spend: number;
  }>;
}

export function RevenueVsSpend({ data }: RevenueVsSpendProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Revenue vs Ad Spend</CardTitle>
          <span className="text-sm text-gray-500">Daily correlation</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => format(parseISO(d), 'MMM d')}
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis
                yAxisId="revenue"
                orientation="left"
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              />
              <YAxis
                yAxisId="spend"
                orientation="right"
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
                formatter={(value: unknown, name: unknown) => {
                  return [`$${Number(value).toFixed(2)}`, String(name)];
                }}
                labelFormatter={(d) => format(parseISO(d as string), 'EEEE, MMM d')}
              />
              <Legend />
              <Bar
                yAxisId="revenue"
                dataKey="total_revenue"
                fill="#d97706"
                opacity={0.8}
                name="Total Revenue"
                radius={[2, 2, 0, 0]}
              />
              <Line
                yAxisId="spend"
                type="monotone"
                dataKey="meta_spend"
                stroke="#1877F2"
                strokeWidth={2}
                dot={false}
                name="Meta Spend"
              />
              <Line
                yAxisId="spend"
                type="monotone"
                dataKey="google_spend"
                stroke="#34A853"
                strokeWidth={2}
                dot={false}
                name="Google Spend"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
