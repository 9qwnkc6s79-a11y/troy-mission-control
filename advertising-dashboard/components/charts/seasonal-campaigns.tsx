'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface SeasonalCampaign {
  name: string;
  product: string;
  start_date: string;
  end_date: string;
  status: string;
  total_spend: number;
  total_revenue: number;
  units_sold: number;
  roas: number;
  impressions: number;
  clicks: number;
  store_visits: number;
}

interface SeasonalCampaignsProps {
  campaigns: SeasonalCampaign[];
}

export function SeasonalCampaigns({ campaigns }: SeasonalCampaignsProps) {
  const chartData = campaigns
    .filter(c => c.status !== 'planned')
    .map(c => ({
      name: c.product,
      revenue: c.total_revenue,
      spend: c.total_spend,
      roas: c.roas,
    }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🎃 Seasonal Campaign Tracking</CardTitle>
          <Badge variant="info">{campaigns.filter(c => c.status === 'active').length} active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Campaign Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.name}
              className={`p-4 rounded-lg border ${
                campaign.status === 'active' ? 'bg-amber-50 border-amber-200' :
                campaign.status === 'completed' ? 'bg-gray-50 border-gray-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                  <p className="text-xs text-gray-500">
                    {campaign.start_date} → {campaign.end_date}
                  </p>
                </div>
                <Badge variant={
                  campaign.status === 'active' ? 'success' :
                  campaign.status === 'completed' ? 'default' : 'info'
                }>
                  {campaign.status}
                </Badge>
              </div>

              {campaign.status !== 'planned' ? (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div>
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(campaign.total_revenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Units Sold</p>
                    <p className="text-sm font-bold text-gray-900">{formatNumber(campaign.units_sold)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ROAS</p>
                    <p className="text-sm font-bold text-emerald-600">{campaign.roas.toFixed(1)}x</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ad Spend</p>
                    <p className="text-sm font-medium text-gray-700">{formatCurrency(campaign.total_spend)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Store Visits</p>
                    <p className="text-sm font-medium text-gray-700">{formatNumber(campaign.store_visits)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Clicks</p>
                    <p className="text-sm font-medium text-gray-700">{formatNumber(campaign.clicks)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2 italic">Campaign scheduled — no data yet</p>
              )}
            </div>
          ))}
        </div>

        {/* Comparison Chart */}
        {chartData.length > 0 && (
          <div className="h-64">
            <p className="text-sm font-medium text-gray-600 mb-2">Revenue vs Spend by Product</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" fontSize={12} stroke="#9ca3af" />
                <YAxis fontSize={12} stroke="#9ca3af" tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: unknown) => [`$${Number(v).toFixed(0)}`]} />
                <Bar dataKey="revenue" name="Revenue" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spend" name="Ad Spend" fill="#9ca3af" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
