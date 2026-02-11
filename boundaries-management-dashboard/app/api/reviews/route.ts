import { NextRequest, NextResponse } from 'next/server'
import { fetchPlaceDetails, fetchAllLocationReviews } from '@/services/googleReviews'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const location = searchParams.get('location') as 'little-elm' | 'prosper' | 'all' || 'all'

  try {
    if (location === 'all') {
      const data = await fetchAllLocationReviews()
      return NextResponse.json(data)
    } else {
      const data = await fetchPlaceDetails(location)
      if (!data) {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
      }
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('Reviews API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
