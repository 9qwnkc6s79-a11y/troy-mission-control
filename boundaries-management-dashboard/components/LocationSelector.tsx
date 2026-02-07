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
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value as 'all' | 'little-elm' | 'prosper')}
        className="appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-boundaries-primary focus:outline-none focus:ring-1 focus:ring-boundaries-primary"
      >
        {locations.map((location) => (
          <option key={location.value} value={location.value}>
            {location.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}