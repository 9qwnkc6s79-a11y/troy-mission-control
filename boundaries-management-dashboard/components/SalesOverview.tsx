'use client'

import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { TrendingUp, CheckCircle, AlertTriangle, TrendingDown, Calendar } from 'lucide-react'
import { mockData } from '@/data/mockData'
import { getCurrentMonthTarget, getTrackingStatus, calculateProgress, calculateDayOfMonthProgress, getForecast } from '@/data/forecastStore'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface SalesOverviewProps {
  location: 'all' | 'little-elm' | 'prosper'
}

export function SalesOverview({ location }: SalesOverviewProps) {
  const [hasForecast, setHasForecast] = useState(false)
  const [monthTarget, setMonthTarget] = useState<number>(90000)

  useEffect(() => {
    const forecast = getForecast()
    setHasForecast(!!forecast)
    const currentTarget = getCurrentMonthTarget()
    if (currentTarget) {
      setMonthTarget(currentTarget.salesTarget)
    }
  }, [])

  // Get monthly data based on location
  const getMonthlyStats = () => {
    if (location === 'little-elm') {
      return {
        revenue: mockData.locationStats.littleElm.monthlyRevenue,
        lastYear: mockData.locationStats.littleElm.monthlyRevenue * 0.89,
      }
    }
    if (location === 'prosper') {
      return {
        revenue: mockData.locationStats.prosper.monthlyRevenue,
        lastYear: mockData.locationStats.prosper.monthlyRevenue * 0.87,
      }
    }
    return {
      revenue: mockData.combinedStats.monthlyRevenue,
      lastYear: mockData.combinedStats.monthlyRevenueLastYear,
    }
  }

  const monthlyStats = getMonthlyStats()
  const status = getTrackingStatus(monthlyStats.revenue, monthTarget)
  const progress = calculateProgress(monthlyStats.revenue, monthTarget)
  const expectedProgress = calculateDayOfMonthProgress() * 100
  const yoyChange = ((monthlyStats.revenue - monthlyStats.lastYear) / monthlyStats.lastYear) * 100

  // Days remaining calculation
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysRemaining = daysInMonth - now.getDate()
  const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Generate monthly chart data (days of the month)
  const getChartData = () => {
    const currentDay = now.getDate()
    const labels: string[] = []
    const dailyData: number[] = []

    // Generate labels and data for each day up to today
    const avgDaily = monthlyStats.revenue / currentDay
    for (let day = 1; day <= currentDay; day++) {
      labels.push(day.toString())
      // Simulate daily variation around the average
      const variance = 0.7 + Math.random() * 0.6 // 70% to 130% of average
      dailyData.push(Math.round(avgDaily * variance))
    }

    const color = location === 'prosper' ? '#d4864a' : '#6e886e'

    return {
      labels,
      datasets: [
        {
          label: 'Daily Sales',
          data: dailyData,
          borderColor: color,
          backgroundColor: color + '20',
          tension: 0.3,
          fill: true,
        }
      ]
    }
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + Number(value).toLocaleString()
          }
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      }
    }
  }

  const statusConfig = {
    'on-track': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      icon: CheckCircle,
      label: 'On Track',
    },
    'at-risk': {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: AlertTriangle,
      label: 'At Risk',
    },
    'off-track': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      icon: TrendingDown,
      label: 'Off Track',
    },
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className="metric-card">
      <div className="coffee-card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Monthly Sales Overview</h3>
            <p className="text-sm text-white/80">{currentMonth}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20`}>
            <StatusIcon className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">{config.label}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Chart Container */}
        <div className="h-64">
          <Line data={getChartData()} options={chartOptions} />
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              ${monthlyStats.revenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Month to Date
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              ${monthTarget.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Monthly Target
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {progress.toFixed(0)}% <span className="text-sm font-normal text-gray-500">/ {expectedProgress.toFixed(0)}%</span>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Actual vs Expected
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {daysRemaining}
              </p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Days Remaining
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className={`text-xl font-bold ${yoyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {yoyChange >= 0 ? '+' : ''}{yoyChange.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              vs Last Year
            </p>
          </div>
        </div>

        {/* No Forecast Notice */}
        {!hasForecast && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Using default target. <a href="/settings" className="text-boundaries-primary underline">Upload your forecast</a> for accurate tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
