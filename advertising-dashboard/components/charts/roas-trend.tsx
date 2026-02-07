'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface ROASTrendProps {
  data: Array<{
    date: string;
    roas: number;
    total_revenue: number;
    total_spend: number;
  }>;
}

export function ROASTrend({ data }: ROASTrendProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>ROAS Trend</CardTitle>
          <span className="text-sm text-gray-500">Revenue / Ad Spend</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="roasGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#92400e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#92400e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => format(parseISO(d), 'MMM d')}
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(v) => `${v}x`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
                formatter={(value: unknown, name: unknown) => {
                  const v = Number(value);
                  if (name === 'roas') return [`${v.toFixed(1)}x`, 'ROAS'];
                  if (name === 'total_revenue') return [`$${v.toFixed(0)}`, 'Revenue'];
                  if (name === 'total_spend') return [`$${v.toFixed(2)}`, 'Ad Spend'];
                  return [String(value), String(name)];
                }}
                labelFormatter={(d) => format(parseISO(d as string), 'EEEE, MMM d')}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="roas"
                stroke="#92400e"
                fill="url(#roasGradient)"
                strokeWidth={2}
                name="ROAS"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
