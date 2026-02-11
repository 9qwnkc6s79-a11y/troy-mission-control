'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, Trash2, Check, AlertCircle, DollarSign, Plus } from 'lucide-react'
import {
  ForecastData,
  MonthlyForecast,
  LocationForecast,
  saveForecast,
  getForecast,
  clearForecast,
  initializeEmptyForecast,
} from '@/data/forecastStore'

export default function SettingsPage() {
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [editingForecasts, setEditingForecasts] = useState<MonthlyForecast[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const stored = getForecast()
    if (stored) {
      // Ensure all months have location data
      const updatedForecasts = stored.forecasts.map(f => ({
        ...f,
        locations: f.locations || { littleElm: 0, prosper: 0, other: 0 }
      }))
      setForecast({ ...stored, forecasts: updatedForecasts })
      setEditingForecasts(updatedForecasts)
    } else {
      // Initialize with empty 24-month forecast
      const initial = initializeEmptyForecast()
      setForecast(initial)
      setEditingForecasts(initial.forecasts)
    }
  }, [])

  const handleLocationChange = useCallback((index: number, location: keyof LocationForecast, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0

    setEditingForecasts(prev => {
      const updated = [...prev]
      const locations = updated[index].locations || { littleElm: 0, prosper: 0, other: 0 }
      locations[location] = numValue
      updated[index] = {
        ...updated[index],
        locations,
        salesTarget: locations.littleElm + locations.prosper + locations.other
      }
      return updated
    })
    setHasChanges(true)
  }, [])

  const handleSaveChanges = useCallback(() => {
    const updated: ForecastData = {
      uploadedAt: new Date().toISOString(),
      fileName: 'manual_entry',
      forecasts: editingForecasts,
    }

    saveForecast(updated)
    setForecast(updated)
    setHasChanges(false)
    setMessage({ type: 'success', text: 'Forecast saved successfully.' })
    setTimeout(() => setMessage(null), 3000)
  }, [editingForecasts])

  const handleClearForecast = useCallback(() => {
    if (confirm('Are you sure you want to clear all forecast data?')) {
      clearForecast()
      const initial = initializeEmptyForecast()
      setForecast(initial)
      setEditingForecasts(initial.forecasts)
      setHasChanges(false)
      setMessage({ type: 'success', text: 'Forecast data cleared.' })
      setTimeout(() => setMessage(null), 3000)
    }
  }, [])

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  }

  const formatCurrency = (value: number) => {
    if (value === 0) return ''
    return value.toLocaleString()
  }

  const getRowTotal = (forecast: MonthlyForecast) => {
    const locations = forecast.locations || { littleElm: 0, prosper: 0, other: 0 }
    return locations.littleElm + locations.prosper + locations.other
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your revenue forecasts and dashboard preferences
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Revenue Forecast Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-boundaries-primary" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Revenue Forecast (24 Months)
              </h2>
              <p className="text-sm text-gray-500">
                Enter projected monthly revenue for each location
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearForecast}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={!hasChanges}
              className={`flex items-center gap-1 px-4 py-2 text-sm rounded-lg ${
                hasChanges
                  ? 'bg-boundaries-primary text-white hover:bg-boundaries-primary/90'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700'
              }`}
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Forecast Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 sticky left-0 bg-gray-50 dark:bg-gray-700/50 min-w-[120px]">
                  Month
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 min-w-[140px]">
                  <div className="flex items-center justify-end gap-2">
                    <span className="w-2 h-2 rounded-full bg-boundaries-primary"></span>
                    Little Elm
                  </div>
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 min-w-[140px]">
                  <div className="flex items-center justify-end gap-2">
                    <span className="w-2 h-2 rounded-full bg-boundaries-secondary"></span>
                    Prosper
                  </div>
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 min-w-[140px]">
                  <div className="flex items-center justify-end gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Other
                  </div>
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 min-w-[140px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {editingForecasts.map((f, index) => (
                <tr
                  key={f.month}
                  className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                    index === 0 ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <td className="py-2 px-4 text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800">
                    {formatMonth(f.month)}
                    {index === 0 && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(Current)</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="text"
                        value={formatCurrency(f.locations?.littleElm || 0)}
                        onChange={(e) => handleLocationChange(index, 'littleElm', e.target.value)}
                        placeholder="0"
                        className="w-full text-right bg-transparent border border-gray-200 dark:border-gray-600 rounded px-3 py-1.5 pl-7 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-boundaries-primary"
                      />
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="text"
                        value={formatCurrency(f.locations?.prosper || 0)}
                        onChange={(e) => handleLocationChange(index, 'prosper', e.target.value)}
                        placeholder="0"
                        className="w-full text-right bg-transparent border border-gray-200 dark:border-gray-600 rounded px-3 py-1.5 pl-7 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-boundaries-secondary"
                      />
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="text"
                        value={formatCurrency(f.locations?.other || 0)}
                        onChange={(e) => handleLocationChange(index, 'other', e.target.value)}
                        placeholder="0"
                        className="w-full text-right bg-transparent border border-gray-200 dark:border-gray-600 rounded px-3 py-1.5 pl-7 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right font-medium text-gray-900 dark:text-white">
                    ${getRowTotal(f).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 dark:bg-gray-700/50 font-semibold">
                <td className="py-3 px-4 text-gray-900 dark:text-white sticky left-0 bg-gray-50 dark:bg-gray-700/50">
                  24-Month Total
                </td>
                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                  ${editingForecasts.reduce((sum, f) => sum + (f.locations?.littleElm || 0), 0).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                  ${editingForecasts.reduce((sum, f) => sum + (f.locations?.prosper || 0), 0).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                  ${editingForecasts.reduce((sum, f) => sum + (f.locations?.other || 0), 0).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                  ${editingForecasts.reduce((sum, f) => sum + getRowTotal(f), 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Quick Tips */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Tip:</strong> Enter your projected monthly revenue for each location.
            The "Other" column is for additional revenue streams like catering, merchandise, or new locations.
            Totals are calculated automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
