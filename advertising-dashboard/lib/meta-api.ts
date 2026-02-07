// ============================================
// Meta Business API Integration
// ============================================
// Docs: https://developers.facebook.com/docs/marketing-apis/
// Required: META_ACCESS_TOKEN, META_AD_ACCOUNT_ID, META_BUSINESS_ID
// ============================================

import { MetaCampaign, MetaInsight, MetaAdSet } from '@/types';

const BASE_URL = 'https://graph.facebook.com/v19.0';

function getHeaders() {
  return {
    'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

function getAdAccountId() {
  return `act_${process.env.META_AD_ACCOUNT_ID || '468165461888446'}`;
}

// ---------- Campaigns ----------
export async function getMetaCampaigns(): Promise<MetaCampaign[]> {
  const accountId = getAdAccountId();
  const url = `${BASE_URL}/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,created_time,updated_time&limit=50`;

  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 300 } });
  if (!res.ok) {
    const error = await res.json();
    console.error('Meta campaigns error:', error);
    throw new Error(`Meta API error: ${error.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.data || [];
}

// ---------- Ad Sets (for targeting/radius data) ----------
export async function getMetaAdSets(campaignId?: string): Promise<MetaAdSet[]> {
  const accountId = getAdAccountId();
  const endpoint = campaignId
    ? `${BASE_URL}/${campaignId}/adsets`
    : `${BASE_URL}/${accountId}/adsets`;

  const url = `${endpoint}?fields=id,campaign_id,name,status,targeting,daily_budget&limit=50`;

  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 300 } });
  if (!res.ok) {
    const error = await res.json();
    console.error('Meta ad sets error:', error);
    throw new Error(`Meta API error: ${error.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.data || [];
}

// ---------- Campaign Insights ----------
export async function getMetaInsights(
  dateRange: { start: string; end: string },
  level: 'campaign' | 'adset' | 'ad' = 'campaign',
  breakdowns?: string
): Promise<MetaInsight[]> {
  const accountId = getAdAccountId();
  const fields = [
    'campaign_id', 'campaign_name', 'impressions', 'reach',
    'clicks', 'spend', 'cpc', 'cpm', 'ctr', 'actions',
  ].join(',');

  let url = `${BASE_URL}/${accountId}/insights?fields=${fields}&level=${level}&time_range={"since":"${dateRange.start}","until":"${dateRange.end}"}&time_increment=1&limit=500`;

  if (breakdowns) {
    url += `&breakdowns=${breakdowns}`;
  }

  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 300 } });
  if (!res.ok) {
    const error = await res.json();
    console.error('Meta insights error:', error);
    throw new Error(`Meta API error: ${error.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.data || [];
}

// ---------- Hourly Insights (for rush hour tracking) ----------
export async function getMetaHourlyInsights(
  dateRange: { start: string; end: string }
): Promise<MetaInsight[]> {
  return getMetaInsights(dateRange, 'campaign', 'hourly_stats_aggregated_by_advertiser_time_zone');
}

// ---------- Location Insights ----------
export async function getMetaLocationInsights(
  dateRange: { start: string; end: string }
): Promise<MetaInsight[]> {
  return getMetaInsights(dateRange, 'campaign', 'region');
}

// ---------- Aggregate Spend ----------
export async function getMetaTotalSpend(
  dateRange: { start: string; end: string }
): Promise<{ spend: number; impressions: number; clicks: number; reach: number }> {
  const insights = await getMetaInsights(dateRange);

  return insights.reduce(
    (acc, insight) => ({
      spend: acc.spend + parseFloat(String(insight.spend)),
      impressions: acc.impressions + parseInt(String(insight.impressions)),
      clicks: acc.clicks + parseInt(String(insight.clicks)),
      reach: acc.reach + parseInt(String(insight.reach)),
    }),
    { spend: 0, impressions: 0, clicks: 0, reach: 0 }
  );
}

// ---------- Store Visit Actions ----------
export function extractStoreVisits(insights: MetaInsight[]): number {
  return insights.reduce((total, insight) => {
    const storeVisitAction = insight.actions?.find(
      a => a.action_type === 'store_visit' || a.action_type === 'offline_conversion'
    );
    return total + (storeVisitAction ? Number(storeVisitAction.value) : 0);
  }, 0);
}

// ---------- Campaign Performance Summary ----------
export async function getMetaCampaignPerformance(dateRange: { start: string; end: string }) {
  const [campaigns, insights] = await Promise.all([
    getMetaCampaigns(),
    getMetaInsights(dateRange),
  ]);

  return campaigns.map(campaign => {
    const campaignInsights = insights.filter(i => i.campaign_id === campaign.id);
    const totalSpend = campaignInsights.reduce((sum, i) => sum + parseFloat(String(i.spend)), 0);
    const totalClicks = campaignInsights.reduce((sum, i) => sum + parseInt(String(i.clicks)), 0);
    const totalImpressions = campaignInsights.reduce((sum, i) => sum + parseInt(String(i.impressions)), 0);

    return {
      ...campaign,
      spend: totalSpend,
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
    };
  });
}
