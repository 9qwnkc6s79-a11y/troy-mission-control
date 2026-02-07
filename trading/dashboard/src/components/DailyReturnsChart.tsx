'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { DailyDataPoint } from '@/lib/benchmark-data';

interface DailyReturnsChartProps {
  data: DailyDataPoint[];
}

type Strategy = 'portfolio' | 'spy';

const strategyConfig: Record<Strategy, { label: string; key: keyof DailyDataPoint; color: string; negColor: string }> = {
  portfolio: { label: '📊 Portfolio', key: 'portfolioDaily', color: '#10b981', negColor: '#047857' },
  spy: { label: '📉 S&P 500', key: 'spyDaily', color: '#71717a', negColor: '#3f3f46' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const sign = val >= 0 ? '+' : '';
    return (
      <div className="bg-[#1a1a2a] border border-[#2a2a3a] rounded-lg p-3 shadow-xl">
        <p className="text-xs text-zinc-400 mb-1">{label}</p>
        <p className={`text-sm font-bold font-mono ${val >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {sign}{val.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

export default function DailyReturnsChart({ data }: DailyReturnsChartProps) {
  const [activeStrategy, setActiveStrategy] = useState<Strategy>('portfolio');

  if (data.length < 2) {
    return (
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Daily Returns</h3>
        <div className="flex items-center justify-center h-[240px]">
          <p className="text-zinc-500 text-sm">Not enough data for daily returns chart</p>
        </div>
      </div>
    );
  }

  const config = strategyConfig[activeStrategy];
  
  // Skip day 0 (no return)
  const chartData = data.slice(1).map(d => ({
    date: d.date,
    value: Number(d[config.key]),
  }));

  const hasSpy = data.some(d => d.spyDaily !== 0);

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Daily Returns</h3>
          <p className="text-xs text-zinc-500 mt-1">Day-over-day performance · Real data</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveStrategy('portfolio')}
            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
              activeStrategy === 'portfolio'
                ? 'bg-white/10 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            📊 Portfolio
          </button>
          {hasSpy && (
            <button
              onClick={() => setActiveStrategy('spy')}
              className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
                activeStrategy === 'spy'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              📉 S&P 500
            </button>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#71717a', fontSize: 10 }}
            axisLine={{ stroke: '#1e1e2e' }}
            interval={Math.max(1, Math.floor(chartData.length / 7))}
          />
          <YAxis
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={{ stroke: '#1e1e2e' }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#333" />
          <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={18}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value >= 0 ? config.color : config.negColor}
                fillOpacity={entry.value >= 0 ? 0.85 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
