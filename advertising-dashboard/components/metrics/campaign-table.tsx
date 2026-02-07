'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  objective?: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  store_visits: number;
  roas?: number;
  issues?: string[];
}

interface CampaignTableProps {
  campaigns: Campaign[];
  title?: string;
}

export function CampaignTable({ campaigns, title = 'Campaign Performance' }: CampaignTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge variant="info">{campaigns.length} campaigns</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Campaign</th>
                <th className="text-center py-3 px-2 font-medium text-gray-500">Status</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Spend</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Impressions</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Clicks</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">CTR</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Store Visits</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Issues</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 ${
                    campaign.issues && campaign.issues.length > 0 ? 'bg-red-50/50' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-xs">{campaign.name}</p>
                      <p className="text-xs text-gray-500">{campaign.platform} • {campaign.objective || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2">
                    <Badge variant={
                      campaign.status === 'ACTIVE' || campaign.status === 'ENABLED' ? 'success' :
                      campaign.status === 'PAUSED' ? 'warning' : 'default'
                    }>
                      {campaign.status}
                    </Badge>
                  </td>
                  <td className="text-right py-3 px-2 font-medium">{formatCurrency(campaign.spend)}</td>
                  <td className="text-right py-3 px-2">{formatNumber(campaign.impressions)}</td>
                  <td className="text-right py-3 px-2">{formatNumber(campaign.clicks)}</td>
                  <td className="text-right py-3 px-2">
                    <span className={campaign.ctr < 1 ? 'text-red-600 font-medium' : ''}>
                      {formatPercent(campaign.ctr)}
                    </span>
                  </td>
                  <td className="text-right py-3 px-2">{campaign.store_visits}</td>
                  <td className="text-right py-3 px-4">
                    {campaign.issues && campaign.issues.length > 0 && (
                      <div className="flex items-center justify-end gap-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-amber-700">{campaign.issues.join(', ')}</span>
                      </div>
                    )}
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
