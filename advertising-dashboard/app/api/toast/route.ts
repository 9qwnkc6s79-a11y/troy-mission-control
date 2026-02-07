import { NextRequest, NextResponse } from 'next/server';
import { getToastOrders } from '@/lib/toast-api';
import { isApiConfigured, getDateRange } from '@/lib/utils';
import { getSampleToastData } from '@/lib/sample-data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || '30d';

  const dateRange = getDateRange(period);

  // Use sample data if API not configured
  if (!isApiConfigured('toast')) {
    const sampleData = getSampleToastData().filter(
      d => d.date >= dateRange.start && d.date <= dateRange.end
    );

    return NextResponse.json({
      source: 'sample',
      message: 'Using sample data. Upload Toast CSV or configure Toast API for live data.',
      data: sampleData,
    });
  }

  try {
    const data = await getToastOrders(dateRange);
    return NextResponse.json({ source: 'live', data });
  } catch (error) {
    console.error('Toast API error:', error);
    const sampleData = getSampleToastData().filter(
      d => d.date >= dateRange.start && d.date <= dateRange.end
    );
    return NextResponse.json({
      source: 'sample',
      message: `API error: ${error instanceof Error ? error.message : 'Unknown error'}. Using sample data.`,
      data: sampleData,
    });
  }
}
