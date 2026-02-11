'use client'

import { BarChart3, TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react'
import { useChecklistTrends } from '@/hooks/useChecklists'

interface ChecklistTrendsProps {
  location?: 'all' | 'little-elm' | 'prosper'
}

export function ChecklistTrends({ location = 'all' }: ChecklistTrendsProps) {
  const { trends, missedTasks, weeklyData, loading } = useChecklistTrends(4)

  // Filter missed tasks by location if needed
  const filteredMissedTasks = location === 'all'
    ? missedTasks
    : missedTasks.filter(t =>
        t.location.toLowerCase().replace(' ', '-') === location
      )

  const avgCompletion = trends.length > 0
    ? Math.round(trends.reduce((sum, t) => sum + t.completionRate, 0) / trends.length)
    : 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full">
      <div className="boundaries-gradient px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Checklist Trends</h3>
          <BarChart3 className="h-5 w-5 text-white opacity-80" />
        </div>
        <p className="text-sm text-white/70 mt-1">Last 4 weeks</p>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading trends...</span>
          </div>
        ) : (
          <>
            {/* Overall Completion */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Completion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgCompletion}%</p>
              </div>
              {/* Mini bar chart */}
              <div className="flex items-end gap-1 h-10">
                {weeklyData.map((value, i) => (
                  <div
                    key={i}
                    className="w-4 bg-boundaries-primary rounded-t"
                    style={{ height: `${Math.max(value * 0.4, 4)}px` }}
                    title={`Week ${i + 1}: ${value}%`}
                  />
                ))}
              </div>
            </div>

            {/* By Type */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">By Checklist Type</p>
              {trends.length > 0 ? (
                trends.map((trend) => (
                  <div key={trend.type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{trend.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {trend.completionRate}%
                      </span>
                      <div className={`flex items-center text-xs ${
                        trend.trend === 'up' ? 'text-green-600' :
                        trend.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {trend.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 mr-0.5" />
                        ) : trend.trend === 'down' ? (
                          <TrendingDown className="h-3 w-3 mr-0.5" />
                        ) : null}
                        {trend.trend !== 'stable' && `${trend.trendValue}%`}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No trend data available</p>
              )}
            </div>

            {/* Most Missed Tasks */}
            {filteredMissedTasks.length > 0 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Commonly Missed
                  </p>
                </div>
                <div className="space-y-1">
                  {filteredMissedTasks.slice(0, 3).map((task, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                        {task.task}
                      </span>
                      <span className="text-gray-500 ml-2">
                        {task.count}x · {task.location}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
