'use client'

import { useEffect, useRef } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { TrendingUpIcon } from 'lucide-react'
import { mockData } from '@/data/mockData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface SalesOverviewProps {
  location: 'all' | 'little-elm' | 'prosper'
}

export function SalesOverview({ location }: SalesOverviewProps) {
  const { salesData } = mockData

  // Prepare chart data based on location selection
  const getChartData = () => {
    const baseData = {
      labels: salesData.daily.labels,
      datasets: [],
    }

    if (location === 'all') {
      const combinedData = salesData.daily.littleElm.map((value, index) => 
        value + salesData.daily.prosper[index]
      )
      baseData.datasets = [
        {
          label: 'Combined Sales',
          data: combinedData,
          borderColor: '#6e886e',
          backgroundColor: '#6e886e20',
          tension: 0.4,
          fill: true,
        }
      ]
    } else if (location === 'little-elm') {
      baseData.datasets = [
        {
          label: 'Little Elm Sales',
          data: salesData.daily.littleElm,
          borderColor: '#6e886e',
          backgroundColor: '#6e886e20',
          tension: 0.4,
          fill: true,
        }
      ]
    } else {
      baseData.datasets = [
        {
          label: 'Prosper Sales',
          data: salesData.daily.prosper,
          borderColor: '#d4864a',
          backgroundColor: '#d4864a20',
          tension: 0.4,
          fill: true,
        }
      ]
    }

    return baseData
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value
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

  return (
    <div className="metric-card">
      <div className="coffee-card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Weekly Sales Overview</h3>
          <TrendingUpIcon className="h-5 w-5 opacity-80" />
        </div>
      </div>

      <div className="p-6">
        {/* Chart Container */}
        <div className="h-80">
          <Line data={getChartData()} options={chartOptions} />
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ${mockData.combinedStats.weeklyRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Week Total
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ${(mockData.combinedStats.weeklyRevenue / 7).toFixed(0)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Daily Average
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-lg font-bold text-green-600">
              +12.5%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              vs Last Week
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}