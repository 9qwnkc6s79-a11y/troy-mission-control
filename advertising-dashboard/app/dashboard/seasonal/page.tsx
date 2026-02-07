'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { SeasonalCampaigns } from '@/components/charts/seasonal-campaigns';
import { RushHourChart } from '@/components/charts/rush-hour-chart';
import { MetricCard } from '@/components/metrics/metric-card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Calendar, Coffee, TrendingUp, Target } from 'lucide-react';

export default function SeasonalPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [seasonalData, setSeasonalData] = useState<Array<Record<string, unknown>>>([]);
  const [rushHourData, setRushHourData] = useState<Record<string, unknown> | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [seasonalRes, rushRes] = await Promise.all([
        fetch(`/api/dashboard?view=seasonal&period=${dateRange}`),
        fetch(`/api/dashboard?view=rush-hours&period=${dateRange}`),
      ]);
      const [seasonal, rush] = await Promise.all([
        seasonalRes.json(),
        rushRes.json(),
      ]);
      setSeasonalData(seasonal.data);
      setRushHourData(rush.data);
    } catch (error) {
      console.error('Failed to fetch seasonal data:', error);
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

  const activeCampaigns = seasonalData.filter(c => String(c.status) === 'active');
  const totalSeasonalRevenue = activeCampaigns.reduce((s, c) => s + Number(c.total_revenue || 0), 0);
  const totalSeasonalSpend = activeCampaigns.reduce((s, c) => s + Number(c.total_spend || 0), 0);
  const totalUnitsSold = activeCampaigns.reduce((s, c) => s + Number(c.units_sold || 0), 0);
  const avgROAS = totalSeasonalSpend > 0 ? totalSeasonalRevenue / totalSeasonalSpend : 0;

  return (
    <div>
      <Header
        title="Seasonal Tracking"
        subtitle="Product-specific campaign ROI & rush hour performance"
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      {/* Key Seasonal Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Active Campaigns"
          value={String(activeCampaigns.length)}
          icon={<Calendar className="w-5 h-5" />}
          subtitle={`${seasonalData.length} total`}
        />
        <MetricCard
          title="Seasonal Revenue"
          value={formatCurrency(totalSeasonalRevenue)}
          icon={<Coffee className="w-5 h-5" />}
        />
        <MetricCard
          title="Avg Seasonal ROAS"
          value={`${avgROAS.toFixed(1)}x`}
          icon={<TrendingUp className="w-5 h-5" />}
          valueClassName="text-emerald-600"
        />
        <MetricCard
          title="Units Sold"
          value={formatNumber(totalUnitsSold)}
          icon={<Target className="w-5 h-5" />}
          subtitle="Promotional products"
        />
      </div>

      {/* Seasonal Campaigns */}
      <div className="mb-6">
        <SeasonalCampaigns campaigns={seasonalData.map(c => ({
          name: String(c.name),
          product: String(c.product),
          start_date: String(c.start_date),
          end_date: String(c.end_date),
          status: String(c.status),
          total_spend: Number(c.total_spend || 0),
          total_revenue: Number(c.total_revenue || 0),
          units_sold: Number(c.units_sold || 0),
          roas: Number(c.roas || 0),
          impressions: Number(c.impressions || 0),
          clicks: Number(c.clicks || 0),
          store_visits: Number(c.store_visits || 0),
        }))} />
      </div>

      {/* Rush Hour Performance */}
      {rushHourData && (
        <div className="mb-6">
          <RushHourChart data={rushHourData as unknown as Parameters<typeof RushHourChart>[0]['data']} />
        </div>
      )}
    </div>
  );
}
