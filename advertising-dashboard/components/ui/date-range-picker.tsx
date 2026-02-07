'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const presets = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
];

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => {
              onChange(preset.value);
              setIsOpen(false);
            }}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              value === preset.value
                ? 'bg-amber-700 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-1.5 rounded-md text-gray-600 hover:bg-gray-100"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
