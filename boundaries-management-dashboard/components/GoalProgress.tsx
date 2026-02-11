'use client'

import { useEffect, useState } from 'react'
import { Target, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Calendar } from 'lucide-react'
import { mockData } from '@/data/mockData'
import {
  getForecast,
  getCurrentMonthTarget,
  calculateProgress,
  calculateDayOfMonthProgress,
  getTrackingStatus,
  MonthlyForecast,
} from '@/data/forecastStore'

interface GoalProgressProps {
  location: 'all' | 'little-elm' | 'prosper'
}

export function GoalProgress({ location }: GoalProgressProps) {
  const [monthTarget, setMonthTarget] = useState<MonthlyForecast | null>(null)
  const [hasForcast, setHasForecast] = useState(false)

  useEffect(() => {
    const forecast = getForecast()
    setHasForecast(!!forecast)
    setMonthTarget(getCurrentMonthTarget())
  }, [])

  // Get current actuals based on location
  const getActuals = () => {
    if (location === 'little-elm') {
      return {
        monthlyRevenue: mockData.locationStats.littleElm.monthlyRevenue,
        monthlyRevenueLastYear: mockData.locationStats.littleElm.monthlyRevenue * 0.89,
      }
    }
    if (location === 'prosper') {
      return {
        monthlyRevenue: mockData.locationStats.prosper.monthlyRevenue,
        monthlyRevenueLastYear: mockData.locationStats.prosper.monthlyRevenue * 0.87,
      }
    }
    return {
      monthlyRevenue: mockData.combinedStats.monthlyRevenue,
      monthlyRevenueLastYear: mockData.combinedStats.monthlyRevenueLastYear,
    }
  }

  const actuals = getActuals()
  const target = monthTarget?.salesTarget || 90000 // Default target if no forecast uploaded
  const progress = calculateProgress(actuals.monthlyRevenue, target)
  const expectedProgress = calculateDayOfMonthProgress() * 100
  const status = getTrackingStatus(actuals.monthlyRevenue, target)
  const yoyChange = ((actuals.monthlyRevenue - actuals.monthlyRevenueLastYear) / actuals.monthlyRevenueLastYear) * 100

  // Calculate days remaining in month
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysRemaining = daysInMonth - now.getDate()

  const statusConfig = {
    'on-track': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      bar: 'bg-boundaries-primary',
      icon: CheckCircle,
      label: 'On Track',
    },
    'at-risk': {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-300',
      bar: 'bg-yellow-500',
      icon: AlertTriangle,
      label: 'At Risk',
    },
    'off-track': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      bar: 'bg-red-500',
      icon: TrendingDown,
      label: 'Off Track',
    },
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="boundaries-gradient px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-white" />
            <h3 className="text-lg font-semibold text-white">Monthly Goal Progress</h3>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-white/20`}>
            <StatusIcon className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">{config.label}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Main Progress Section */}
        <div className="mb-6">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ${actuals.monthlyRevenue.toLocaleString()}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                of ${target.toLocaleString()}
              </span>
            </div>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {progress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${config.bar}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
            {/* Expected progress marker */}
            <div
              className="absolute top-0 w-0.5 h-4 bg-gray-600 dark:bg-gray-400"
              style={{ left: `${expectedProgress}%` }}
              title={`Expected: ${expectedProgress.toFixed(0)}%`}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Expected at this point: {expectedProgress.toFixed(0)}%
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">
                {daysRemaining} days remaining
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* YoY Comparison */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              {yoyChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">vs Last Year</span>
            </div>
            <span className={`text-xl font-bold ${yoyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {yoyChange >= 0 ? '+' : ''}{yoyChange.toFixed(1)}%
            </span>
          </div>

          {/* Needed to hit goal */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
              Needed to hit goal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ${Math.max(0, target - actuals.monthlyRevenue).toLocaleString()}
            </span>
          </div>
        </div>

        {/* No Forecast Warning */}
        {!hasForcast && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Using default targets. <a href="/settings" className="underline font-medium">Upload your forecast</a> in Settings for accurate tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
