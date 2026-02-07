'use client';

import { PerformanceData } from '@/lib/types';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Line,
} from 'recharts';

interface PerformanceChartProps {
  data: PerformanceData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a2a] border border-[#2a2a3a] rounded-lg p-3 shadow-xl">
        <p className="text-xs text-zinc-400 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-zinc-400">{entry.name}:</span>
            <span className="text-white font-medium">{entry.value.toFixed(2)}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Performance (7D)</h3>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-zinc-400">Crypto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-zinc-400">Congress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-zinc-400">Options</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-400">Combined</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-zinc-600" />
            <span className="text-zinc-400">S&P 500</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCrypto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCongress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOptions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCombined" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
          <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={{ stroke: '#1e1e2e' }} />
          <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={{ stroke: '#1e1e2e' }} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="cryptoReturn" stroke="#3b82f6" fill="url(#colorCrypto)" strokeWidth={2} name="Crypto" dot={false} />
          <Area type="monotone" dataKey="congressReturn" stroke="#a855f7" fill="url(#colorCongress)" strokeWidth={2} name="Congress" dot={false} />
          <Area type="monotone" dataKey="optionsReturn" stroke="#f59e0b" fill="url(#colorOptions)" strokeWidth={2} name="Options" dot={false} />
          <Area type="monotone" dataKey="combinedReturn" stroke="#10b981" fill="url(#colorCombined)" strokeWidth={2} name="Combined" dot={false} />
          <Line type="monotone" dataKey="benchmark" stroke="#52525b" strokeWidth={1.5} strokeDasharray="5 5" name="S&P 500" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
