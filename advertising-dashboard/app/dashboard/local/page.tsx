'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { RadiusPerformance } from '@/components/charts/radius-performance';
import { MetricCard } from '@/components/metrics/metric-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { MapPin, Target, Users, TrendingUp } from 'lucide-react';

export default function LocalPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [radiusData, setRadiusData] = useState<Array<Record<string, unknown>>>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard?view=radius&period=${dateRange}`);
      const data = await res.json();
      setRadiusData(data.data);
    } catch (error) {
      console.error('Failed to fetch local data:', error);
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

  const totalVisits = radiusData.reduce((s, d) => s + Number(d.store_visits || 0), 0);
  const totalSpend = radiusData.reduce((s, d) => s + Number(d.spend || 0), 0);
  const totalConversions = radiusData.reduce((s, d) => s + Number(d.conversions || 0), 0);

  // 5mi data
  const within5 = radiusData.find(d => String(d.radius).includes('5')) || {};
  const within10 = radiusData.find(d => String(d.radius).includes('10') && !String(d.radius).includes('15')) || {};

  return (
    <div>
      <Header
        title="Local Performance"
        subtitle="Store visit radius & geographic targeting analysis"
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      {/* Store Locations */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-amber-600">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">📍 Little Elm Location</h3>
                <p className="text-sm text-gray-500 mt-1">Little Elm, TX</p>
                <p className="text-xs text-gray-400 mt-1">Serving: Cross Roads, Hackberry, The Colony</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-400">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">📍 Prosper Location</h3>
                <p className="text-sm text-gray-500 mt-1">Prosper, TX</p>
                <p className="text-xs text-gray-400 mt-1">Serving: Celina, McKinney, Frisco</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Local Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Store Visits"
          value={String(totalVisits)}
          icon={<MapPin className="w-5 h-5" />}
          change={{ value: 18.5, isPositive: true, label: '+18.5%' }}
        />
        <MetricCard
          title="5mi ROAS"
          value={`${Number(within5.roas || 0).toFixed(1)}x`}
          icon={<Target className="w-5 h-5" />}
          valueClassName="text-emerald-600"
        />
        <MetricCard
          title="Total Conversions"
          value={formatNumber(totalConversions)}
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          title="Avg CPA"
          value={formatCurrency(totalConversions > 0 ? totalSpend / totalConversions : 0)}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Radius Performance */}
      <div className="mb-6">
        <RadiusPerformance data={radiusData.map(d => ({
          radius: String(d.radius || ''),
          impressions: Number(d.impressions || 0),
          clicks: Number(d.clicks || 0),
          ctr: Number(d.ctr || 0),
          conversions: Number(d.conversions || 0),
          store_visits: Number(d.store_visits || 0),
          spend: Number(d.spend || 0),
          cpa: Number(d.cpa || 0),
          roas: Number(d.roas || 0),
          color: String(d.color || '#6b7280'),
        }))} />
      </div>

      {/* 5mi vs 10mi Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 5mi vs 10mi Targeting Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-emerald-900">Within 5 Miles</h4>
                <Badge variant="success">Recommended</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Store Visits</span>
                  <span className="font-bold text-emerald-900">{Number(within5.store_visits || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">CTR</span>
                  <span className="font-bold text-emerald-900">{formatPercent(Number(within5.ctr || 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">CPA</span>
                  <span className="font-bold text-emerald-900">{formatCurrency(Number(within5.cpa || 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">ROAS</span>
                  <span className="font-bold text-emerald-900">{Number(within5.roas || 0).toFixed(1)}x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Spend</span>
                  <span className="font-bold text-emerald-900">{formatCurrency(Number(within5.spend || 0))}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-900">5-10 Miles</h4>
                <Badge variant="info">Secondary</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Store Visits</span>
                  <span className="font-bold text-blue-900">{Number(within10.store_visits || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">CTR</span>
                  <span className="font-bold text-blue-900">{formatPercent(Number(within10.ctr || 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">CPA</span>
                  <span className="font-bold text-blue-900">{formatCurrency(Number(within10.cpa || 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">ROAS</span>
                  <span className="font-bold text-blue-900">{Number(within10.roas || 0).toFixed(1)}x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Spend</span>
                  <span className="font-bold text-blue-900">{formatCurrency(Number(within10.spend || 0))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-sm font-medium text-amber-800">💡 Optimization Recommendation</p>
            <p className="text-xs text-amber-700 mt-1">
              The 0-5mi radius delivers significantly higher ROAS ({Number(within5.roas || 0).toFixed(1)}x) 
              compared to 5-10mi ({Number(within10.roas || 0).toFixed(1)}x). Consider allocating 70% of 
              budget to the 5mi radius and 30% to 10mi for maximum efficiency. CPA within 5mi 
              is {formatCurrency(Number(within5.cpa || 0))} vs {formatCurrency(Number(within10.cpa || 0))} for 5-10mi.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
