'use client'

import { useState, useEffect, useCallback } from 'react'
import { SalesData } from '@/services/toast'

interface UseSalesDataOptions {
  location: 'all' | 'little-elm' | 'prosper'
  refreshInterval?: number // in milliseconds
}

interface UseSalesDataResult {
  data: SalesData | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// Hook for fetching both locations in a single request
interface LocationSalesData {
  littleElm: SalesData | null
  prosper: SalesData | null
}

interface UseBothLocationsSalesResult {
  data: LocationSalesData
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useBothLocationsSales({ refreshInterval = 60000 }: { refreshInterval?: number } = {}): UseBothLocationsSalesResult {
  const [data, setData] = useState<LocationSalesData>({ littleElm: null, prosper: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/toast/sales?type=both-locations')

      if (!response.ok) {
        throw new Error('Failed to fetch sales data')
      }

      const salesData = await response.json()
      setData(salesData)
      setError(null)
    } catch (err) {
      console.error('Error fetching sales data:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refreshInterval])

  return { data, loading, error, refetch: fetchData }
}

export function useSalesData({ location, refreshInterval = 60000 }: UseSalesDataOptions): UseSalesDataResult {
  const [data, setData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/toast/sales?location=${location}&type=today`)

      if (!response.ok) {
        throw new Error('Failed to fetch sales data')
      }

      const salesData = await response.json()
      setData(salesData)
      setError(null)
    } catch (err) {
      console.error('Error fetching sales data:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [location])

  useEffect(() => {
    fetchData()

    // Set up polling interval
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refreshInterval])

  return { data, loading, error, refetch: fetchData }
}

// Hook for monthly chart data
interface MonthlySalesPoint {
  date: string
  sales: number
  orders: number
}

interface UseMonthlyChartOptions {
  location: 'all' | 'little-elm' | 'prosper'
  year?: number
  month?: number
}

interface UseMonthlyChartResult {
  data: MonthlySalesPoint[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useMonthlyChart({ location, year, month }: UseMonthlyChartOptions): UseMonthlyChartResult {
  const [data, setData] = useState<MonthlySalesPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const currentYear = year || new Date().getFullYear()
  const currentMonth = month !== undefined ? month : new Date().getMonth()

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/toast/sales?location=${location}&type=monthly-chart&year=${currentYear}&month=${currentMonth}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch chart data')
      }

      const chartData = await response.json()
      setData(chartData)
      setError(null)
    } catch (err) {
      console.error('Error fetching chart data:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [location, currentYear, currentMonth])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Hook for staff on duty
interface UseStaffOnDutyResult {
  count: number
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useStaffOnDuty(location: 'all' | 'little-elm' | 'prosper'): UseStaffOnDutyResult {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/toast/sales?location=${location}&type=staff`)

      if (!response.ok) {
        throw new Error('Failed to fetch staff data')
      }

      const data = await response.json()
      setCount(data.staffOnDuty || 0)
      setError(null)
    } catch (err) {
      console.error('Error fetching staff data:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [location])

  useEffect(() => {
    fetchData()

    // Poll every 5 minutes for staff updates
    const interval = setInterval(fetchData, 300000)
    return () => clearInterval(interval)
  }, [fetchData])

  return { count, loading, error, refetch: fetchData }
}
