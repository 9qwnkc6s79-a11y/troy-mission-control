'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon?: ReactNode;
  subtitle?: string;
  className?: string;
  valueClassName?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  subtitle,
  className,
  valueClassName,
}: MetricCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className={cn('mt-2 text-3xl font-bold text-gray-900', valueClassName)}>{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {change && (
            <div className="mt-2 flex items-center gap-1">
              {change.value === 0 ? (
                <Minus className="w-4 h-4 text-gray-400" />
              ) : change.isPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={cn(
                'text-sm font-medium',
                change.value === 0 ? 'text-gray-400' :
                change.isPositive ? 'text-emerald-600' : 'text-red-600'
              )}>
                {change.label}
              </span>
              <span className="text-xs text-gray-400">vs prev period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-amber-50 rounded-lg text-amber-700">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
