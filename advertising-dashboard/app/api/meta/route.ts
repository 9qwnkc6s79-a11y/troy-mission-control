import { NextRequest, NextResponse } from 'next/server';
import { getMetaCampaignPerformance, getMetaInsights, getMetaHourlyInsights } from '@/lib/meta-api';
import { isApiConfigured, getDateRange } from '@/lib/utils';
import { getSampleMetaCampaigns, getSampleMetaInsights } from '@/lib/sample-data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || '30d';
  const type = searchParams.get('type') || 'campaigns';

  const dateRange = getDateRange(period);

  // Use sample data if API not configured
  if (!isApiConfigured('meta')) {
    return NextResponse.json({
      source: 'sample',
      message: 'Using sample data. Configure META_ACCESS_TOKEN to use live data.',
      data: type === 'campaigns' ? getSampleMetaCampaigns() : getSampleMetaInsights(),
    });
  }

  try {
    let data;
    switch (type) {
      case 'campaigns':
        data = await getMetaCampaignPerformance(dateRange);
        break;
      case 'insights':
        data = await getMetaInsights(dateRange);
        break;
      case 'hourly':
        data = await getMetaHourlyInsights(dateRange);
        break;
      default:
        data = await getMetaCampaignPerformance(dateRange);
    }

    return NextResponse.json({ source: 'live', data });
  } catch (error) {
    console.error('Meta API error:', error);
    return NextResponse.json({
      source: 'sample',
      message: `API error: ${error instanceof Error ? error.message : 'Unknown error'}. Using sample data.`,
      data: type === 'campaigns' ? getSampleMetaCampaigns() : getSampleMetaInsights(),
    });
  }
}
