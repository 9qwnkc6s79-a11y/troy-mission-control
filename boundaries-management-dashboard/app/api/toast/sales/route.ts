import { NextRequest, NextResponse } from 'next/server'
import { fetchTodaySales, fetchMonthlySalesChart, fetchStaffOnDuty, fetchAllLocationSales } from '@/services/toast'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const location = searchParams.get('location') as 'little-elm' | 'prosper' | 'all' || 'all'
  const type = searchParams.get('type') || 'today'
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
  const month = parseInt(searchParams.get('month') || new Date().getMonth().toString())

  try {
    switch (type) {
      case 'today':
        const todayData = await fetchTodaySales(location)
        if (!todayData) {
          return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 })
        }
        return NextResponse.json(todayData)

      case 'both-locations':
        const bothData = await fetchAllLocationSales()
        return NextResponse.json(bothData)

      case 'monthly-chart':
        const chartData = await fetchMonthlySalesChart(location, year, month)
        return NextResponse.json(chartData)

      case 'staff':
        const staffCount = await fetchStaffOnDuty(location)
        return NextResponse.json({ staffOnDuty: staffCount })

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Toast API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
