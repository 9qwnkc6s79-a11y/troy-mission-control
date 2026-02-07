import { NextRequest, NextResponse } from 'next/server';
import {
  getSampleDashboardSummary,
  getSampleDailyTrends,
  getSampleRushHourData,
  getSampleRadiusData,
  getSampleMetaCampaigns,
  getSampleGoogleAdsCampaigns,
  getSampleSeasonalCampaigns,
} from '@/lib/sample-data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const view = searchParams.get('view') || 'summary';

  try {
    switch (view) {
      case 'summary':
        return NextResponse.json({
          source: 'sample',
          data: getSampleDashboardSummary(),
        });

      case 'trends':
        return NextResponse.json({
          source: 'sample',
          data: getSampleDailyTrends(),
        });

      case 'rush-hours':
        return NextResponse.json({
          source: 'sample',
          data: getSampleRushHourData(),
        });

      case 'radius':
        return NextResponse.json({
          source: 'sample',
          data: getSampleRadiusData(),
        });

      case 'campaigns':
        return NextResponse.json({
          source: 'sample',
          data: {
            meta: getSampleMetaCampaigns(),
            google: getSampleGoogleAdsCampaigns(),
          },
        });

      case 'seasonal':
        return NextResponse.json({
          source: 'sample',
          data: getSampleSeasonalCampaigns(),
        });

      default:
        return NextResponse.json({
          source: 'sample',
          data: getSampleDashboardSummary(),
        });
    }
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
