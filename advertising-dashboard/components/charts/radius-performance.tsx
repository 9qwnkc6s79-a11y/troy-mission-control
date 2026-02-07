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
  PieChart,
  Pie,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface RadiusData {
  radius: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  store_visits: number;
  spend: number;
  cpa: number;
  roas: number;
  color: string;
}

interface RadiusPerformanceProps {
  data: RadiusData[];
}

export function RadiusPerformance({ data }: RadiusPerformanceProps) {
  const storeVisitData = data.map(d => ({
    name: d.radius,
    value: d.store_visits,
    fill: d.color,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>📍 Local Radius Performance</CardTitle>
          <span className="text-sm text-gray-500">Distance from stores</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Table */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-500">Radius</th>
                  <th className="text-right py-2 font-medium text-gray-500">Spend</th>
                  <th className="text-right py-2 font-medium text-gray-500">CTR</th>
                  <th className="text-right py-2 font-medium text-gray-500">Visits</th>
                  <th className="text-right py-2 font-medium text-gray-500">CPA</th>
                  <th className="text-right py-2 font-medium text-gray-500">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.radius} className="border-b border-gray-50">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />
                        <span className="font-medium">{row.radius}</span>
                      </div>
                    </td>
                    <td className="text-right py-2">{formatCurrency(row.spend)}</td>
                    <td className="text-right py-2">{formatPercent(row.ctr)}</td>
                    <td className="text-right py-2">
                      <Badge variant="info">{row.store_visits}</Badge>
                    </td>
                    <td className="text-right py-2">{formatCurrency(row.cpa)}</td>
                    <td className="text-right py-2">
                      <Badge variant={row.roas >= 5 ? 'success' : row.roas >= 2 ? 'warning' : 'danger'}>
                        {row.roas.toFixed(1)}x
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Insight */}
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-sm font-medium text-emerald-800">💡 Insight</p>
              <p className="text-xs text-emerald-700 mt-1">
                0-5mi radius delivers {data[0]?.roas.toFixed(1)}x ROAS vs {data[data.length - 1]?.roas.toFixed(1)}x for 15mi+. 
                Consider concentrating budget within 10mi for optimal store visits.
              </p>
            </div>
          </div>

          {/* Right: Charts */}
          <div className="space-y-4">
            {/* Store Visits Pie */}
            <div className="h-48">
              <p className="text-sm font-medium text-gray-600 mb-2">Store Visits by Distance</p>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={storeVisitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {storeVisitData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* CPA by Radius */}
            <div className="h-48">
              <p className="text-sm font-medium text-gray-600 mb-2">CPA by Distance</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="radius" fontSize={12} stroke="#9ca3af" />
                  <YAxis fontSize={12} stroke="#9ca3af" tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`, 'CPA']} />
                  <Bar dataKey="cpa" name="Cost per Acquisition" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
