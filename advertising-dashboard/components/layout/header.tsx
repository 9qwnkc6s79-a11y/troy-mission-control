'use client';

import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function Header({
  title,
  subtitle,
  dateRange,
  onDateRangeChange,
  onRefresh,
  isLoading,
}: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
        <Badge variant="success">🟢 Live</Badge>
      </div>
    </div>
  );
}
