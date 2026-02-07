import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAdsCampaigns, getGoogleAdsLocationMetrics } from '@/lib/google-ads-api';
import { isApiConfigured, getDateRange } from '@/lib/utils';
import { getSampleGoogleAdsCampaigns, getSampleRadiusData } from '@/lib/sample-data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || '30d';
  const type = searchParams.get('type') || 'campaigns';

  const dateRange = getDateRange(period);

  // Use sample data if API not configured
  if (!isApiConfigured('google')) {
    return NextResponse.json({
      source: 'sample',
      message: 'Using sample data. Configure Google Ads API credentials to use live data.',
      data: type === 'campaigns' ? getSampleGoogleAdsCampaigns() : getSampleRadiusData(),
    });
  }

  try {
    let data;
    switch (type) {
      case 'campaigns':
        data = await getGoogleAdsCampaigns(dateRange);
        break;
      case 'location':
        data = await getGoogleAdsLocationMetrics(dateRange);
        break;
      default:
        data = await getGoogleAdsCampaigns(dateRange);
    }

    return NextResponse.json({ source: 'live', data });
  } catch (error) {
    console.error('Google Ads API error:', error);
    return NextResponse.json({
      source: 'sample',
      message: `API error: ${error instanceof Error ? error.message : 'Unknown error'}. Using sample data.`,
      data: type === 'campaigns' ? getSampleGoogleAdsCampaigns() : getSampleRadiusData(),
    });
  }
}
