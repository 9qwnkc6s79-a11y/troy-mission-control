'use client'

import { MapPin, Clock, Users, TrendingUp, Star, Loader2 } from 'lucide-react'
import { mockData } from '@/data/mockData'
import { useReviews } from '@/hooks/useReviews'
import { useBothLocationsSales, useStaffOnDuty } from '@/hooks/useSalesData'

export function LocationStats() {
  const { locationStats } = mockData

  // Fetch real review data
  const { data: reviewsData, loading: reviewsLoading } = useReviews()

  // Fetch real sales data for both locations in a single request
  const { data: salesData, loading: salesLoading } = useBothLocationsSales({ refreshInterval: 120000 })

  // Fetch staff on duty for each location
  const { count: littleElmStaff } = useStaffOnDuty('little-elm')
  const { count: prosperStaff } = useStaffOnDuty('prosper')

  const isLoading = reviewsLoading || salesLoading

  const locations = [
    {
      name: 'Little Elm',
      data: {
        ...locationStats.littleElm,
        todaySales: salesData.littleElm?.todaySales ?? locationStats.littleElm.todaySales,
        todayOrders: salesData.littleElm?.todayOrders ?? locationStats.littleElm.todayOrders,
        avgOrderValue: salesData.littleElm?.avgOrderValue ?? locationStats.littleElm.avgOrderValue,
        monthlyRevenue: salesData.littleElm?.monthlyRevenue ?? locationStats.littleElm.monthlyRevenue,
        staffOnDuty: littleElmStaff || locationStats.littleElm.staffOnDuty,
      },
      color: 'bg-boundaries-primary',
      accent: 'text-boundaries-primary',
      bgAccent: 'bg-green-50 dark:bg-green-900/20',
      reviews: reviewsData.littleElm ? {
        rating: reviewsData.littleElm.rating,
        total: reviewsData.littleElm.totalReviews,
        thisMonth: reviewsData.littleElm.thisMonthCount,
      } : { rating: 4.8, total: 156, thisMonth: 12 },
    },
    {
      name: 'Prosper',
      data: {
        ...locationStats.prosper,
        todaySales: salesData.prosper?.todaySales ?? locationStats.prosper.todaySales,
        todayOrders: salesData.prosper?.todayOrders ?? locationStats.prosper.todayOrders,
        avgOrderValue: salesData.prosper?.avgOrderValue ?? locationStats.prosper.avgOrderValue,
        monthlyRevenue: salesData.prosper?.monthlyRevenue ?? locationStats.prosper.monthlyRevenue,
        staffOnDuty: prosperStaff || locationStats.prosper.staffOnDuty,
      },
      color: 'bg-boundaries-secondary',
      accent: 'text-boundaries-secondary',
      bgAccent: 'bg-orange-50 dark:bg-orange-900/20',
      reviews: reviewsData.prosper ? {
        rating: reviewsData.prosper.rating,
        total: reviewsData.prosper.totalReviews,
        thisMonth: reviewsData.prosper.thisMonthCount,
      } : { rating: 4.7, total: 186, thisMonth: 16 },
    }
  ]

  return (
    <div className="metric-card">
      <div className="coffee-card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Location Comparison</h3>
          <MapPin className="h-5 w-5 opacity-80" />
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
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400 mt-1" />
                  ) : (
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ${location.data.todaySales.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${location.bgAccent}`}>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Orders
                  </p>
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400 mt-1" />
                  ) : (
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {location.data.todayOrders}
                    </p>
                  )}
                </div>
              </div>

              {/* Customer Reviews */}
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <div>
                    {reviewsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : (
                      <>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {location.reviews.rating}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({location.reviews.total} reviews)
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {!reviewsLoading && (
                  <span className="text-sm text-green-600 font-medium">
                    +{location.reviews.thisMonth} this month
                  </span>
                )}
              </div>

              {/* Additional Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
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
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Staff On Duty
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {location.data.staffOnDuty}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
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
