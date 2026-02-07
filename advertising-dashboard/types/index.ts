// ============================================
// Boundaries Coffee Advertising Dashboard Types
// ============================================

// ---------- Meta Ads Types ----------
export interface MetaCampaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  objective: string;
  daily_budget: number;
  lifetime_budget: number;
  created_time: string;
  updated_time: string;
}

export interface MetaAdSet {
  id: string;
  campaign_id: string;
  name: string;
  status: string;
  targeting: {
    geo_locations?: {
      cities?: Array<{ key: string; name: string; radius: number; distance_unit: string }>;
      custom_locations?: Array<{ latitude: number; longitude: number; radius: number }>;
    };
    age_min?: number;
    age_max?: number;
  };
  daily_budget: number;
}

export interface MetaInsight {
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  cpc: number;
  cpm: number;
  ctr: number;
  actions?: Array<{
    action_type: string;
    value: number;
  }>;
  date_start: string;
  date_stop: string;
}

// ---------- Google Ads Types ----------
export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: string;
  type: string;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  store_visits?: number;
  cost_per_conversion: number;
}

export interface GoogleAdsLocationMetric {
  campaign_id: string;
  distance_bucket: '5mi' | '10mi' | '15mi' | '20mi+';
  impressions: number;
  clicks: number;
  conversions: number;
  store_visits: number;
  spend: number;
}

// ---------- Toast POS Types ----------
export interface ToastSalesData {
  date: string;
  location: 'Little Elm' | 'Prosper';
  total_revenue: number;
  transaction_count: number;
  average_ticket: number;
  hourly_breakdown: HourlySales[];
  top_items: TopItem[];
}

export interface HourlySales {
  hour: number;
  revenue: number;
  transactions: number;
}

export interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
  category: string;
}

// ---------- Dashboard Aggregate Types ----------
export interface DashboardSummary {
  date_range: { start: string; end: string };
  total_ad_spend: number;
  total_revenue: number;
  roas: number;
  total_store_visits: number;
  total_impressions: number;
  total_clicks: number;
  cpa: number;
  platforms: {
    meta: PlatformSummary;
    google: PlatformSummary;
  };
  locations: {
    little_elm: LocationSummary;
    prosper: LocationSummary;
  };
}

export interface PlatformSummary {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  store_visits: number;
  roas: number;
  cpa: number;
}

export interface LocationSummary {
  revenue: number;
  transactions: number;
  ad_spend_allocated: number;
  roas: number;
  store_visits: number;
}

export interface RushHourPerformance {
  period: 'breakfast' | 'lunch';
  time_range: string;
  ad_impressions: number;
  ad_clicks: number;
  store_revenue: number;
  transactions: number;
  roas: number;
  best_platform: string;
}

export interface SeasonalCampaign {
  name: string;
  product: string;
  start_date: string;
  end_date: string;
  total_spend: number;
  total_revenue: number;
  units_sold: number;
  roas: number;
  impressions: number;
  store_visits: number;
}

export interface RadiusPerformance {
  radius: '5mi' | '10mi';
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  store_visits: number;
  spend: number;
  cpa: number;
  roas: number;
}

export interface DateRange {
  start: string;
  end: string;
  label: string;
}

export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}
