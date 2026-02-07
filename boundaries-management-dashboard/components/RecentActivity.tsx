'use client'

import { 
  DollarSignIcon, 
  UserCheckIcon, 
  AlertTriangleIcon, 
  StarIcon, 
  CalendarIcon,
  ActivityIcon 
} from 'lucide-react'
import { mockData } from '@/data/mockData'

const iconMap = {
  'dollar-sign': DollarSignIcon,
  'user-check': UserCheckIcon,
  'alert-triangle': AlertTriangleIcon,
  'star': StarIcon,
  'calendar': CalendarIcon,
}

const colorMap = {
  sale: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  staff: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  inventory: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  review: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  interview: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
}

export function RecentActivity() {
  return (
    <div className="metric-card">
      <div className="coffee-card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <ActivityIcon className="h-5 w-5 opacity-80" />
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {mockData.recentActivity.map((activity, index) => {
            const IconComponent = iconMap[activity.icon as keyof typeof iconMap]
            const colorClass = colorMap[activity.type as keyof typeof colorMap]

            return (
              <div key={index} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 p-2 rounded-full ${colorClass}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {activity.time}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* View All Button */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-sm text-boundaries-primary hover:text-boundaries-primary/80 font-medium transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  )
}