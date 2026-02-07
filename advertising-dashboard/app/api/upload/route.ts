import { NextRequest, NextResponse } from 'next/server';
import { parseToastCSV } from '@/lib/toast-api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const location = formData.get('location') as 'Little Elm' | 'Prosper';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!location) {
      return NextResponse.json({ error: 'Location required (Little Elm or Prosper)' }, { status: 400 });
    }

    const csvContent = await file.text();
    const parsedData = parseToastCSV(csvContent, location);

    return NextResponse.json({
      success: true,
      message: `Parsed ${parsedData.length} days of data for ${location}`,
      data: parsedData,
      summary: {
        days: parsedData.length,
        total_revenue: parsedData.reduce((sum, d) => sum + d.total_revenue, 0),
        total_transactions: parsedData.reduce((sum, d) => sum + d.transaction_count, 0),
        date_range: {
          start: parsedData[0]?.date,
          end: parsedData[parsedData.length - 1]?.date,
        },
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
