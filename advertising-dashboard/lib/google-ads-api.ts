// ============================================
// Google Ads API Integration
// ============================================
// Docs: https://developers.google.com/google-ads/api/docs/start
// Required: GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET,
//           GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_CUSTOMER_ID,
//           GOOGLE_ADS_DEVELOPER_TOKEN
// ============================================

import { GoogleAdsCampaign, GoogleAdsLocationMetric } from '@/types';

const API_VERSION = 'v16';
const BASE_URL = `https://googleads.googleapis.com/${API_VERSION}`;

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  return data.access_token;
}

function getHeaders(accessToken: string) {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    'Content-Type': 'application/json',
  };
}

function getCustomerId() {
  return (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/-/g, '');
}

// ---------- Campaign Performance ----------
export async function getGoogleAdsCampaigns(
  dateRange: { start: string; end: string }
): Promise<GoogleAdsCampaign[]> {
  const accessToken = await getAccessToken();
  const customerId = getCustomerId();

  const query = `
    SELECT 
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign_budget.amount_micros,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_per_conversion
    FROM campaign
    WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
  `;

  const res = await fetch(
    `${BASE_URL}/customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: getHeaders(accessToken),
      body: JSON.stringify({ query }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    console.error('Google Ads campaigns error:', error);
    throw new Error(`Google Ads API error: ${JSON.stringify(error)}`);
  }

  const data = await res.json();
  const results = data[0]?.results || [];

  return results.map((r: Record<string, Record<string, string | number>>) => ({
    id: String(r.campaign.id),
    name: String(r.campaign.name),
    status: String(r.campaign.status),
    type: String(r.campaign.advertisingChannelType),
    budget: Number(r.campaignBudget?.amountMicros || 0) / 1_000_000,
    spend: Number(r.metrics.costMicros) / 1_000_000,
    impressions: Number(r.metrics.impressions),
    clicks: Number(r.metrics.clicks),
    conversions: Number(r.metrics.conversions),
    cost_per_conversion: Number(r.metrics.costPerConversion) / 1_000_000,
  }));
}

// ---------- Store Visits ----------
export async function getGoogleAdsStoreVisits(
  dateRange: { start: string; end: string }
): Promise<number> {
  const accessToken = await getAccessToken();
  const customerId = getCustomerId();

  const query = `
    SELECT 
      metrics.store_visits
    FROM campaign
    WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
  `;

  try {
    const res = await fetch(
      `${BASE_URL}/customers/${customerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers: getHeaders(accessToken),
        body: JSON.stringify({ query }),
      }
    );

    if (!res.ok) return 0;

    const data = await res.json();
    const results = data[0]?.results || [];
    return results.reduce(
      (sum: number, r: Record<string, Record<string, number>>) => sum + (Number(r.metrics?.storeVisits) || 0),
      0
    );
  } catch {
    console.warn('Store visits metric not available');
    return 0;
  }
}

// ---------- Location/Distance Performance ----------
export async function getGoogleAdsLocationMetrics(
  dateRange: { start: string; end: string }
): Promise<GoogleAdsLocationMetric[]> {
  const accessToken = await getAccessToken();
  const customerId = getCustomerId();

  const query = `
    SELECT 
      campaign.id,
      distance_view.distance_bucket,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM distance_view
    WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
  `;

  try {
    const res = await fetch(
      `${BASE_URL}/customers/${customerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers: getHeaders(accessToken),
        body: JSON.stringify({ query }),
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const results = data[0]?.results || [];

    const bucketMap: Record<string, string> = {
      'WITHIN_5': '5mi',
      'WITHIN_10': '10mi',
      'WITHIN_15': '15mi',
      'BEYOND_40': '20mi+',
    };

    return results.map((r: Record<string, Record<string, string | number>>) => ({
      campaign_id: String(r.campaign.id),
      distance_bucket: bucketMap[String(r.distanceView?.distanceBucket)] || '20mi+',
      impressions: Number(r.metrics.impressions),
      clicks: Number(r.metrics.clicks),
      conversions: Number(r.metrics.conversions),
      store_visits: 0,
      spend: Number(r.metrics.costMicros) / 1_000_000,
    }));
  } catch {
    console.warn('Distance view not available');
    return [];
  }
}

// ---------- Hourly Performance ----------
export async function getGoogleAdsHourlyPerformance(
  dateRange: { start: string; end: string }
) {
  const accessToken = await getAccessToken();
  const customerId = getCustomerId();

  const query = `
    SELECT 
      segments.hour,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM campaign
    WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
  `;

  try {
    const res = await fetch(
      `${BASE_URL}/customers/${customerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers: getHeaders(accessToken),
        body: JSON.stringify({ query }),
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data[0]?.results || [];
  } catch {
    return [];
  }
}

// ---------- Total Spend ----------
export async function getGoogleAdsTotalSpend(
  dateRange: { start: string; end: string }
): Promise<{ spend: number; impressions: number; clicks: number; conversions: number }> {
  const campaigns = await getGoogleAdsCampaigns(dateRange);

  return campaigns.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend,
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      conversions: acc.conversions + c.conversions,
    }),
    { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
  );
}
