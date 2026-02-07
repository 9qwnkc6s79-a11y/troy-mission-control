'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { CampaignTable } from '@/components/metrics/campaign-table';
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
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#92400e', '#d97706', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export default function CampaignsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Record<string, Array<Record<string, unknown>>> | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard?view=campaigns&period=${dateRange}`);
      const data = await res.json();
      setCampaigns(data.data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    }
    setIsLoading(false);
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading || !campaigns) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto" />
      </div>
    );
  }

  const metaCampaigns = (campaigns.meta || []).map((c: Record<string, unknown>) => ({
    id: String(c.id),
    name: String(c.name),
    platform: 'Meta',
    status: String(c.status),
    objective: String(c.objective || ''),
    spend: Number(c.spend_today || c.spend || 0),
    impressions: Number(c.impressions_today || c.impressions || 0),
    clicks: Number(c.clicks_today || c.clicks || 0),
    ctr: Number(c.ctr || 0),
    store_visits: Number(c.store_visits || 0),
    daily_budget: Number(c.daily_budget || 0),
    issues: detectIssues(c),
  }));

  const googleCampaigns = (campaigns.google || []).map((c: Record<string, unknown>) => ({
    id: String(c.id),
    name: String(c.name),
    platform: 'Google',
    status: String(c.status),
    objective: String(c.type || ''),
    spend: Number(c.spend || 0),
    impressions: Number(c.impressions || 0),
    clicks: Number(c.clicks || 0),
    ctr: Number(c.impressions) > 0 ? (Number(c.clicks) / Number(c.impressions)) * 100 : 0,
    store_visits: Number(c.store_visits || 0),
    daily_budget: Number(c.budget || 0),
    issues: [],
  }));

  const allCampaigns = [...metaCampaigns, ...googleCampaigns];
  const totalSpend = allCampaigns.reduce((s, c) => s + c.spend, 0);

  // Spend distribution for pie chart
  const spendByPlatform = [
    { name: 'Meta Ads', value: metaCampaigns.reduce((s, c) => s + c.spend, 0) },
    { name: 'Google Ads', value: googleCampaigns.reduce((s, c) => s + c.spend, 0) },
  ];

  // Budget utilization
  const budgetData = allCampaigns
    .filter(c => c.daily_budget > 0)
    .map(c => ({
      name: c.name.replace('Boundaries Coffee - ', '').substring(0, 20),
      budget: c.daily_budget,
      spent: c.spend,
      utilization: c.daily_budget > 0 ? (c.spend / c.daily_budget) * 100 : 0,
    }));

  // Issues summary
  const campaignsWithIssues = allCampaigns.filter(c => c.issues.length > 0);

  return (
    <div>
      <Header
        title="Campaign Performance"
        subtitle="Detailed metrics across Meta Ads & Google Ads"
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      {/* Issues Alert */}
      {campaignsWithIssues.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <h3 className="font-semibold text-red-800 mb-2">⚠️ Campaign Issues Detected</h3>
          <div className="space-y-2">
            {campaignsWithIssues.map(c => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-red-700">{c.name}</span>
                <div className="flex gap-2">
                  {c.issues.map((issue: string, i: number) => (
                    <Badge key={i} variant="danger">{issue}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-red-600 mt-3">
            💡 Recommendation: Pause duplicate campaigns and switch engagement objectives to STORE_TRAFFIC for better ROI.
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Total Campaigns</p>
            <p className="text-2xl font-bold text-gray-900">{allCampaigns.length}</p>
            <p className="text-xs text-gray-400 mt-1">
              {metaCampaigns.length} Meta • {googleCampaigns.length} Google
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Total Spend</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpend)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Total Clicks</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(allCampaigns.reduce((s, c) => s + c.clicks, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Total Store Visits</p>
            <p className="text-2xl font-bold text-emerald-600">
              {allCampaigns.reduce((s, c) => s + c.store_visits, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Spend Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Spend Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendByPlatform}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                  >
                    {spendByPlatform.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Budget Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" tickFormatter={(v) => `$${v}`} fontSize={12} />
                  <YAxis type="category" dataKey="name" fontSize={11} width={120} />
                  <Tooltip formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`]} />
                  <Legend />
                  <Bar dataKey="budget" name="Daily Budget" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="spent" name="Spent" fill="#d97706" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meta Campaigns */}
      <div className="mb-6">
        <CampaignTable campaigns={metaCampaigns} title="Meta Ad Campaigns" />
      </div>

      {/* Google Campaigns */}
      <div className="mb-6">
        <CampaignTable campaigns={googleCampaigns} title="Google Ad Campaigns" />
      </div>
    </div>
  );
}

function detectIssues(campaign: Record<string, unknown>): string[] {
  const issues: string[] = [];
  const name = String(campaign.name || '').toLowerCase();
  const objective = String(campaign.objective || '');
  const ctr = Number(campaign.ctr || 0);
  const storeVisits = Number(campaign.store_visits || 0);

  if (name.includes('duplicate')) issues.push('Duplicate');
  if (objective === 'ENGAGEMENT' && storeVisits === 0) issues.push('Wrong objective');
  if (ctr < 0.5) issues.push('Low CTR');

  return issues;
}
