'use client'

import { MapPinIcon, ClockIcon, UserIcon, TrendingUpIcon } from 'lucide-react'
import { mockData } from '@/data/mockData'

export function LocationStats() {
  const { locationStats } = mockData

  const locations = [
    {
      name: 'Little Elm',
      data: locationStats.littleElm,
      color: 'bg-boundaries-primary',
      accent: 'text-boundaries-primary',
      bgAccent: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      name: 'Prosper',
      data: locationStats.prosper,
      color: 'bg-boundaries-secondary',
      accent: 'text-boundaries-secondary',
      bgAccent: 'bg-orange-50 dark:bg-orange-900/20',
    }
  ]

  return (
    <div className="metric-card">
      <div className="coffee-card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Location Comparison</h3>
          <MapPinIcon className="h-5 w-5 opacity-80" />
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {locations.map((location) => (
            <div key={location.name} className="space-y-4">
              {/* Location Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${location.color}`} />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {location.name}
                  </h4>
                  <span className="status-indicator status-open">
                    {location.data.status}
                  </span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg ${location.bgAccent}`}>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Today's Sales
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ${location.data.todaySales.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${location.bgAccent}`}>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Orders
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {location.data.todayOrders}
                  </p>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUpIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Avg Order Value
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${location.data.avgOrderValue.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Staff on Duty
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {location.data.staffOnDuty}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Hours Today
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {location.data.hoursToday}
                  </span>
                </div>
              </div>

              {/* Manager Info */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Manager:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {location.data.manager}
                  </span>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Monthly Revenue
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${location.data.monthlyRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${location.color}`}
                    style={{ 
                      width: `${(location.data.monthlyRevenue / 60000) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}