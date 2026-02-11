'use client'

import { useState, useEffect, useCallback } from 'react'

interface ReviewData {
  rating: number
  totalReviews: number
  thisMonthCount: number
}

interface LocationReviewData {
  littleElm: ReviewData | null
  prosper: ReviewData | null
}

interface UseReviewsOptions {
  refreshInterval?: number // in milliseconds
}

interface UseReviewsResult {
  data: LocationReviewData
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useReviews({ refreshInterval = 300000 }: UseReviewsOptions = {}): UseReviewsResult {
  const [data, setData] = useState<LocationReviewData>({
    littleElm: null,
    prosper: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/reviews?location=all')

      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }

      const reviewData = await response.json()
      setData(reviewData)
      setError(null)
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Set up polling interval (default: 5 minutes)
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refreshInterval])

  return { data, loading, error, refetch: fetchData }
}

// Hook for single location reviews
interface UseSingleLocationReviewsResult {
  data: ReviewData | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useSingleLocationReviews(
  location: 'little-elm' | 'prosper',
  { refreshInterval = 300000 }: UseReviewsOptions = {}
): UseSingleLocationReviewsResult {
  const [data, setData] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/reviews?location=${location}`)

      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }

      const reviewData = await response.json()
      setData(reviewData)
      setError(null)
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [location])

  useEffect(() => {
    fetchData()

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refreshInterval])

  return { data, loading, error, refetch: fetchData }
}
