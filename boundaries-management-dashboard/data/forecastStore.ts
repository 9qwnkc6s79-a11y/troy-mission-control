'use client'

export interface LocationForecast {
  littleElm: number
  prosper: number
  other: number
}

export interface MonthlyForecast {
  month: string // Format: '2026-01', '2026-02', etc.
  salesTarget: number // Combined total (for backwards compatibility)
  locations?: LocationForecast // Per-location breakdown
}

export interface ForecastData {
  uploadedAt: string
  fileName: string
  forecasts: MonthlyForecast[]
}

const STORAGE_KEY = 'boundaries_forecast'

export function saveForecast(data: ForecastData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

export function getForecast(): ForecastData | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as ForecastData
  } catch {
    return null
  }
}

export function getMonthTarget(month: string): MonthlyForecast | null {
  const forecast = getForecast()
  if (!forecast) return null

  return forecast.forecasts.find(f => f.month === month) || null
}

export function getCurrentMonthTarget(): MonthlyForecast | null {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return getMonthTarget(currentMonth)
}

export function calculateProgress(actual: number, target: number): number {
  if (target <= 0) return 0
  return Math.round((actual / target) * 100 * 10) / 10
}

export function calculateDayOfMonthProgress(): number {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return now.getDate() / daysInMonth
}

export function getTrackingStatus(actual: number, target: number): 'on-track' | 'at-risk' | 'off-track' {
  const progress = calculateProgress(actual, target)
  const expectedProgress = calculateDayOfMonthProgress() * 100

  const variance = progress - expectedProgress

  if (variance >= -5) return 'on-track'
  if (variance >= -15) return 'at-risk'
  return 'off-track'
}

export function clearForecast(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

// Generate 24 months starting from current month
export function generate24MonthsFromNow(): string[] {
  const months: string[] = []
  const now = new Date()

  for (let i = 0; i < 24; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months.push(month)
  }

  return months
}

// Initialize empty forecast data with 24 months
export function initializeEmptyForecast(): ForecastData {
  const months = generate24MonthsFromNow()

  return {
    uploadedAt: new Date().toISOString(),
    fileName: 'manual_entry',
    forecasts: months.map(month => ({
      month,
      salesTarget: 0,
      locations: {
        littleElm: 0,
        prosper: 0,
        other: 0
      }
    }))
  }
}
