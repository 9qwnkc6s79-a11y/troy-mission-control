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
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface LocationComparisonProps {
  data: Array<{
    date: string;
    little_elm_revenue: number;
    prosper_revenue: number;
  }>;
}

export function LocationComparison({ data }: LocationComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>📍 Revenue by Location</CardTitle>
          <div className="flex gap-3 text-sm">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-600" />
              Little Elm
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              Prosper
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
                formatter={(value: unknown, name: unknown) => [`$${Number(value).toFixed(0)}`, String(name)]}
                labelFormatter={(d) => format(parseISO(d as string), 'EEEE, MMM d')}
              />
              <Legend />
              <Bar
                dataKey="little_elm_revenue"
                name="Little Elm"
                fill="#92400e"
                radius={[2, 2, 0, 0]}
                stackId="revenue"
              />
              <Bar
                dataKey="prosper_revenue"
                name="Prosper"
                fill="#d97706"
                radius={[2, 2, 0, 0]}
                stackId="revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
