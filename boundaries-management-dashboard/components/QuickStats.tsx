'use client'

import { TrendingUpIcon, TrendingDownIcon, UsersIcon, DollarSignIcon, CoffeeIcon, ClockIcon } from 'lucide-react'
import { mockData } from '@/data/mockData'

interface QuickStatsProps {
  location: 'all' | 'little-elm' | 'prosper'
}

export function QuickStats({ location }: QuickStatsProps) {
  // Filter data based on location
  const stats = location === 'all' 
    ? mockData.combinedStats 
    : mockData.locationStats[location === 'little-elm' ? 'littleElm' : 'prosper']

  const statCards = [
    {
      title: 'Today\'s Sales',
      value: `$${stats.todaySales.toLocaleString()}`,
      change: '+12%',
      trend: 'up',
      icon: DollarSignIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Orders',
      value: stats.todayOrders.toString(),
      change: '+8%',
      trend: 'up', 
      icon: CoffeeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Avg Order Value',
      value: `$${stats.avgOrderValue.toFixed(2)}`,
      change: '+4%',
      trend: 'up',
      icon: TrendingUpIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Staff On Duty',
      value: stats.staffOnDuty.toString(),
      change: 'Full team',
      trend: 'neutral',
      icon: UsersIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <div className="flex items-center mt-2">
                {stat.trend === 'up' && (
                  <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                )}
                {stat.trend === 'down' && (
                  <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                } dark:text-gray-400`}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}