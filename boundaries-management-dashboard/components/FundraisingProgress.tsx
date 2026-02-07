'use client'

import { TrendingUpIcon, CalendarIcon, UsersIcon } from 'lucide-react'
import { mockData } from '@/data/mockData'

export function FundraisingProgress() {
  const { fundraising } = mockData.financialData
  const daysUntilDeadline = Math.ceil((new Date(fundraising.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="metric-card">
      <div className="coffee-card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Fundraising Progress</h3>
          <TrendingUpIcon className="h-5 w-5 opacity-80" />
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                ${fundraising.raised.toLocaleString()} raised
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                ${fundraising.target.toLocaleString()} goal
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-boundaries-primary to-boundaries-secondary h-3 rounded-full transition-all duration-500"
                style={{ width: `${fundraising.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {fundraising.percentage}% complete
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <CalendarIcon className="h-4 w-4 text-boundaries-secondary mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {daysUntilDeadline}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Days left
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <UsersIcon className="h-4 w-4 text-boundaries-secondary mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {fundraising.investors}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Investors
              </p>
            </div>
          </div>

          {/* Recent Investments */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Recent Investments
            </h4>
            <div className="space-y-2">
              {fundraising.recentInvestments.map((investment, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {investment.investor}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {investment.date}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-boundaries-secondary">
                    ${investment.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full bg-boundaries-primary hover:bg-boundaries-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              View Full Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}