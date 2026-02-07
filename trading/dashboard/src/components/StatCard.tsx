'use client';

import { plColor, formatCurrency, formatPercent, formatPL } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changePercent?: number;
  icon?: React.ReactNode;
  variant?: 'default' | 'large';
}

export default function StatCard({ title, value, change, changePercent, icon, variant = 'default' }: StatCardProps) {
  const isLarge = variant === 'large';
  
  return (
    <div className={`bg-[#111118] border border-[#1e1e2e] rounded-xl p-${isLarge ? '6' : '5'} card-glow transition-all duration-200`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">{title}</span>
        {icon && <span className="text-zinc-600">{icon}</span>}
      </div>
      <div className={`${isLarge ? 'text-3xl' : 'text-2xl'} font-bold text-white mb-1 tracking-tight`}>
        {typeof value === 'number' ? formatCurrency(value) : value}
      </div>
      {(change !== undefined || changePercent !== undefined) && (
        <div className={`text-sm font-medium ${plColor(change ?? changePercent ?? 0)}`}>
          {change !== undefined && <span>{formatPL(change)}</span>}
          {changePercent !== undefined && <span> ({formatPercent(changePercent)})</span>}
        </div>
      )}
    </div>
  );
}
