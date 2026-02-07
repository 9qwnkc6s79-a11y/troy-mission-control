'use client'

import { ChevronDownIcon } from 'lucide-react'

interface LocationSelectorProps {
  selected: 'all' | 'little-elm' | 'prosper'
  onChange: (location: 'all' | 'little-elm' | 'prosper') => void
}

export function LocationSelector({ selected, onChange }: LocationSelectorProps) {
  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'little-elm', label: 'Little Elm' },
    { value: 'prosper', label: 'Prosper' },
  ]

  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value as 'all' | 'little-elm' | 'prosper')}
        className="appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-3 pr-8 sm:px-4 sm:py-2 w-full sm:w-auto text-sm sm:text-base font-medium text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-boundaries-primary focus:outline-none focus:ring-2 focus:ring-boundaries-primary transition-colors touch-target"
      >
        {locations.map((location) => (
          <option key={location.value} value={location.value}>
            {location.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="absolute right-2 sm:right-3 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}