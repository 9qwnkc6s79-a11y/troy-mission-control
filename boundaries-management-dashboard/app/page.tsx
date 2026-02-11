'use client'

import { useState } from 'react'
import { SalesOverview } from '@/components/SalesOverview'
import { LocationStats } from '@/components/LocationStats'
import { QuickStats } from '@/components/QuickStats'
import { MarketingHighlights } from '@/components/MarketingHighlights'
import { OperationsHealth } from '@/components/OperationsHealth'
import { ChecklistTrends } from '@/components/ChecklistTrends'
import { RecentActivity } from '@/components/RecentActivity'
import { LocationSelector } from '@/components/LocationSelector'

export default function Dashboard() {
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'little-elm' | 'prosper'>('all')

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Executive Dashboard
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Overview of Boundaries Coffee operations
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <LocationSelector
            selected={selectedLocation}
            onChange={setSelectedLocation}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats location={selectedLocation} />

      {/* Sales Overview */}
      <SalesOverview location={selectedLocation} />

      {/* Location Comparison (now includes Customer Pulse) */}
      <LocationStats />

      {/* Operations & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <OperationsHealth />
        <ChecklistTrends location={selectedLocation} />
        <MarketingHighlights />
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  )
}
