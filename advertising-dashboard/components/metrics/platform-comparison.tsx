'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

interface PlatformData {
  name: string;
  icon: string;
  color: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  store_visits: number;
  roas: number;
  cpa: number;
}

interface PlatformComparisonProps {
  platforms: PlatformData[];
}

export function PlatformComparison({ platforms }: PlatformComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 font-medium text-gray-500">Platform</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Spend</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Impressions</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Clicks</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">CTR</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Store Visits</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">CPA</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((platform) => (
                <tr key={platform.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{platform.icon}</span>
                      <span className="font-medium text-gray-900">{platform.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-2 font-medium">{formatCurrency(platform.spend)}</td>
                  <td className="text-right py-3 px-2">{formatNumber(platform.impressions)}</td>
                  <td className="text-right py-3 px-2">{formatNumber(platform.clicks)}</td>
                  <td className="text-right py-3 px-2">{formatPercent(platform.ctr)}</td>
                  <td className="text-right py-3 px-2">
                    <Badge variant="info">{platform.store_visits}</Badge>
                  </td>
                  <td className="text-right py-3 px-2">{formatCurrency(platform.cpa)}</td>
                  <td className="text-right py-3 px-2">
                    <Badge variant={platform.roas >= 5 ? 'success' : platform.roas >= 2 ? 'warning' : 'danger'}>
                      {platform.roas.toFixed(1)}x
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
