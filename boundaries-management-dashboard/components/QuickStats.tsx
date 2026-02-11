'use client'

import { TrendingUp, TrendingDown, Users, DollarSign, Coffee, Loader2 } from 'lucide-react'
import { useSalesData, useStaffOnDuty } from '@/hooks/useSalesData'
import { mockData } from '@/data/mockData'

interface QuickStatsProps {
  location: 'all' | 'little-elm' | 'prosper'
}

export function QuickStats({ location }: QuickStatsProps) {
  // Fetch real data
  const { data: salesData, loading: salesLoading } = useSalesData({ location })
  const { count: staffOnDuty, loading: staffLoading } = useStaffOnDuty(location)

  // Fallback to mock data if API is not configured
  const mockStats = location === 'all'
    ? mockData.combinedStats
    : mockData.locationStats[location === 'little-elm' ? 'littleElm' : 'prosper']

  // Use real data if available, otherwise fall back to mock
  const stats = {
    todaySales: salesData?.todaySales ?? mockStats.todaySales,
    todayOrders: salesData?.todayOrders ?? mockStats.todayOrders,
    avgOrderValue: salesData?.avgOrderValue ?? mockStats.avgOrderValue,
    staffOnDuty: staffOnDuty || mockStats.staffOnDuty,
  }

  // Calculate YoY changes if we have real data
  const yoyData = salesData?.todaySalesLastYear ? {
    salesYoY: salesData.todaySalesLastYear > 0
      ? Math.round(((stats.todaySales - salesData.todaySalesLastYear) / salesData.todaySalesLastYear) * 100 * 10) / 10
      : null,
    ordersYoY: null, // We'd need last year's order count
    avgOrderYoY: null, // We'd need last year's AOV
  } : (location === 'all' ? {
    salesYoY: mockData.combinedStats.todaySalesYoY,
    ordersYoY: mockData.combinedStats.todayOrdersYoY,
    avgOrderYoY: mockData.combinedStats.avgOrderValueYoY,
  } : null)

  const isLoading = salesLoading || staffLoading

  const statCards = [
    {
      title: 'Today\'s Sales',
      value: `$${stats.todaySales.toLocaleString()}`,
      change: '+12%',
      trend: 'up' as const,
      yoyChange: yoyData?.salesYoY,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Orders',
      value: stats.todayOrders.toString(),
      change: '+8%',
      trend: 'up' as const,
      yoyChange: yoyData?.ordersYoY,
      icon: Coffee,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Avg Order Value',
      value: `$${stats.avgOrderValue.toFixed(2)}`,
      change: '+4%',
      trend: 'up' as const,
      yoyChange: yoyData?.avgOrderYoY,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Staff On Duty',
      value: stats.staffOnDuty.toString(),
      change: 'Clocked in now',
      trend: 'neutral' as const,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="metric-card">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                {stat.title}
              </p>
              {isLoading ? (
                <div className="flex items-center mt-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' && (
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1 flex-shrink-0" />
                    )}
                    {stat.trend === 'down' && (
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1 flex-shrink-0" />
                    )}
                    <span className={`text-xs sm:text-sm truncate ${
                      stat.trend === 'up' ? 'text-green-600' :
                      stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    } dark:text-gray-400`}>
                      {stat.change}
                    </span>
                  </div>
                  {stat.yoyChange !== undefined && stat.yoyChange !== null && (
                    <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>vs last year: </span>
                      <span className={`ml-1 ${stat.yoyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.yoyChange >= 0 ? '+' : ''}{stat.yoyChange}%
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor} flex-shrink-0 ml-2`}>
              <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
