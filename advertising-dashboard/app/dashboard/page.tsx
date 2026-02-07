'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { MetricCard } from '@/components/metrics/metric-card';
import { PlatformComparison } from '@/components/metrics/platform-comparison';
import { CampaignTable } from '@/components/metrics/campaign-table';
import { ROASTrend } from '@/components/charts/roas-trend';
import { RevenueVsSpend } from '@/components/charts/revenue-vs-spend';
import { RushHourChart } from '@/components/charts/rush-hour-chart';
import { LocationComparison } from '@/components/charts/location-comparison';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber, formatROAS } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  MousePointerClick,
  Eye,
  MapPin,
} from 'lucide-react';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<Record<string, Record<string, number>> | null>(null);
  const [trends, setTrends] = useState<Array<Record<string, string | number>>>([]);
  const [rushHours, setRushHours] = useState<Record<string, unknown> | null>(null);
  const [campaigns, setCampaigns] = useState<Record<string, Array<Record<string, unknown>>> | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryRes, trendsRes, rushRes, campaignsRes] = await Promise.all([
        fetch(`/api/dashboard?view=summary&period=${dateRange}`),
        fetch(`/api/dashboard?view=trends&period=${dateRange}`),
        fetch(`/api/dashboard?view=rush-hours&period=${dateRange}`),
        fetch(`/api/dashboard?view=campaigns&period=${dateRange}`),
      ]);

      const [summaryData, trendsData, rushData, campaignsData] = await Promise.all([
        summaryRes.json(),
        trendsRes.json(),
        rushRes.json(),
        campaignsRes.json(),
      ]);

      setSummary(summaryData.data);
      setTrends(trendsData.data);
      setRushHours(rushData.data);
      setCampaigns(campaignsData.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
    setIsLoading(false);
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto" />
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const today = summary.today;
  const last30 = summary.last_30_days;

  // Build campaign list with issues
  const allCampaigns = [
    ...(campaigns?.meta || []).map((c: Record<string, unknown>) => ({
      id: String(c.id),
      name: String(c.name),
      platform: 'Meta',
      status: String(c.status),
      objective: String(c.objective || ''),
      spend: Number(c.spend_today || 0),
      impressions: Number(c.impressions_today || 0),
      clicks: Number(c.clicks_today || 0),
      ctr: Number(c.ctr || 0),
      store_visits: Number(c.store_visits || 0),
      issues: detectCampaignIssues(c),
    })),
    ...(campaigns?.google || []).map((c: Record<string, unknown>) => ({
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
      issues: [],
    })),
  ];

  // Platform comparison data
  const platformData = [
    {
      name: 'Meta Ads',
      icon: '📘',
      color: '#1877F2',
      spend: (campaigns?.meta || []).reduce((s: number, c: Record<string, unknown>) => s + Number(c.spend_today || 0), 0),
      impressions: (campaigns?.meta || []).reduce((s: number, c: Record<string, unknown>) => s + Number(c.impressions_today || 0), 0),
      clicks: (campaigns?.meta || []).reduce((s: number, c: Record<string, unknown>) => s + Number(c.clicks_today || 0), 0),
      ctr: 1.8,
      conversions: 19,
      store_visits: (campaigns?.meta || []).reduce((s: number, c: Record<string, unknown>) => s + Number(c.store_visits || 0), 0),
      roas: 42.3,
      cpa: 2.58,
    },
    {
      name: 'Google Ads',
      icon: '🔍',
      color: '#34A853',
      spend: (campaigns?.google || []).reduce((s: number, c: Record<string, unknown>) => s + Number(c.spend || 0), 0),
      impressions: (campaigns?.google || []).reduce((s: number, c: Record<string, unknown>) => s + Number(c.impressions || 0), 0),
      clicks: (campaigns?.google || []).reduce((s: number, c: Record<string, unknown>) => s + Number(c.clicks || 0), 0),
      ctr: 1.2,
      conversions: 23,
      store_visits: (campaigns?.google || []).reduce((s: number, c: Record<string, unknown>) => s + Number(c.store_visits || 0), 0),
      roas: 47.8,
      cpa: 1.95,
    },
  ];

  // Trend data for charts
  const roasTrendData = trends.map(t => ({
    date: String(t.date),
    roas: Number(t.roas),
    total_revenue: Number(t.total_revenue),
    total_spend: Number(t.total_spend),
  }));

  const revenueSpendData = trends.map(t => ({
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

  return (
    <div>
      <Header
        title="Executive Summary"
        subtitle="Boundaries Coffee — All locations combined"
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      {/* Sample Data Notice */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
        <Badge variant="info">Demo Mode</Badge>
        <span className="text-sm text-blue-700">
          Showing sample data. Configure API credentials in environment variables for live data.
        </span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard
          title="Today&apos;s ROAS"
          value={formatROAS(today.roas)}
          icon={<TrendingUp className="w-5 h-5" />}
          change={{ value: 12.3, isPositive: true, label: '+12.3%' }}
        />
        <MetricCard
          title="Revenue"
          value={formatCurrency(today.revenue)}
          icon={<DollarSign className="w-5 h-5" />}
          change={{ value: 8.1, isPositive: true, label: '+8.1%' }}
        />
        <MetricCard
          title="Ad Spend"
          value={formatCurrency(today.ad_spend)}
          icon={<DollarSign className="w-5 h-5" />}
          subtitle="Meta + Google"
        />
        <MetricCard
          title="Store Visits"
          value={String(today.store_visits)}
          icon={<MapPin className="w-5 h-5" />}
          change={{ value: 15.0, isPositive: true, label: '+15%' }}
        />
        <MetricCard
          title="Impressions"
          value={formatNumber(today.impressions)}
          icon={<Eye className="w-5 h-5" />}
        />
        <MetricCard
          title="Clicks"
          value={formatNumber(today.clicks)}
          icon={<MousePointerClick className="w-5 h-5" />}
          subtitle={`${((today.clicks / today.impressions) * 100).toFixed(2)}% CTR`}
        />
      </div>

      {/* 30-Day Summary Bar */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-800">30-Day Summary</p>
            <p className="text-xs text-amber-600">All platforms combined</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-amber-600">Revenue</p>
              <p className="text-lg font-bold text-amber-900">{formatCurrency(last30.revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-amber-600">Ad Spend</p>
              <p className="text-lg font-bold text-amber-900">{formatCurrency(last30.ad_spend)}</p>
            </div>
            <div>
              <p className="text-xs text-amber-600">ROAS</p>
              <p className="text-lg font-bold text-emerald-700">{formatROAS(last30.roas)}</p>
            </div>
            <div>
              <p className="text-xs text-amber-600">Store Visits</p>
              <p className="text-lg font-bold text-amber-900">{formatNumber(last30.store_visits)}</p>
            </div>
            <div>
              <p className="text-xs text-amber-600">CPA</p>
              <p className="text-lg font-bold text-amber-900">{formatCurrency(last30.cpa)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1: ROAS + Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ROASTrend data={roasTrendData} />
        <RevenueVsSpend data={revenueSpendData} />
      </div>

      {/* Platform Comparison */}
      <div className="mb-6">
        <PlatformComparison platforms={platformData} />
      </div>

      {/* Rush Hours */}
      {rushHours && (
        <div className="mb-6">
          <RushHourChart data={rushHours as unknown as Parameters<typeof RushHourChart>[0]['data']} />
        </div>
      )}

      {/* Location Comparison */}
      <div className="mb-6">
        <LocationComparison data={locationData} />
      </div>

      {/* Campaign Table */}
      <div className="mb-6">
        <CampaignTable campaigns={allCampaigns} title="All Campaigns — Today" />
      </div>
    </div>
  );
}

function detectCampaignIssues(campaign: Record<string, unknown>): string[] {
  const issues: string[] = [];
  const name = String(campaign.name || '').toLowerCase();
  const objective = String(campaign.objective || '');
  const ctr = Number(campaign.ctr || 0);
  const storeVisits = Number(campaign.store_visits || 0);

  if (name.includes('duplicate')) {
    issues.push('Duplicate campaign');
  }
  if (objective === 'ENGAGEMENT' && storeVisits === 0) {
    issues.push('Wrong objective — use STORE_TRAFFIC');
  }
  if (ctr < 0.5) {
    issues.push('Low CTR');
  }

  return issues;
}
