'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface NormalizedPoint {
  date: string;
  fullDate: string;
  spy: number;
  portfolio: number;
}

interface BenchmarkChartProps {
  data: NormalizedPoint[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a2a] border border-[#2a2a3a] rounded-lg p-3 shadow-xl">
        <p className="text-xs text-zinc-400 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const value = entry.value;
          const diff = (value - 100).toFixed(2);
          const sign = Number(diff) >= 0 ? '+' : '';
          return (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-zinc-400">{entry.name}</span>
              </div>
              <span className={`font-mono font-medium ${Number(diff) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {sign}{diff}%
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function BenchmarkChart({ data, title = 'Portfolio vs S&P 500 (Normalized)' }: BenchmarkChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h3>
        <div className="flex items-center justify-center h-[380px]">
          <p className="text-zinc-500 text-sm">No performance data available yet</p>
        </div>
      </div>
    );
  }

  const hasSpy = data.some(d => d.spy !== 100);

  const allValues = data.flatMap(d => {
    const vals = [d.portfolio];
    if (hasSpy) vals.push(d.spy);
    return vals;
  });
  const minVal = Math.floor(Math.min(...allValues) - 0.5);
  const maxVal = Math.ceil(Math.max(...allValues) + 0.5);

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Normalized to $100 starting value · {data.length} trading days · Real Alpaca data
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {hasSpy && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded bg-zinc-500" style={{ borderBottom: '2px dashed #71717a' }} />
              <span className="text-zinc-400">S&P 500</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded bg-emerald-500" />
            <span className="text-zinc-400">Portfolio</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={{ stroke: '#1e1e2e' }}
            interval={Math.max(1, Math.floor(data.length / 7))}
          />
          <YAxis
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={{ stroke: '#1e1e2e' }}
            domain={[minVal, maxVal]}
            tickFormatter={(v) => v.toFixed(1)}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={100} stroke="#333" strokeDasharray="3 3" />
          {hasSpy && (
            <Line
              type="monotone"
              dataKey="spy"
              stroke="#71717a"
              strokeWidth={2}
              strokeDasharray="6 3"
              name="S&P 500"
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="portfolio"
            stroke="#10b981"
            strokeWidth={2.5}
            name="Portfolio"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
