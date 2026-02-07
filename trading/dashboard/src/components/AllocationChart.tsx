'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface AllocationChartProps {
  cryptoEquity: number;
  congressEquity: number;
  optionsEquity?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a2a] border border-[#2a2a3a] rounded-lg p-3 shadow-xl">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
          <span className="text-zinc-400">{payload[0].name}:</span>
          <span className="text-white font-medium">{formatCurrency(payload[0].value)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function AllocationChart({ cryptoEquity, congressEquity, optionsEquity }: AllocationChartProps) {
  const total = cryptoEquity + congressEquity + (optionsEquity || 0);
  const data = [
    { name: 'Crypto Bot', value: cryptoEquity, fill: '#3b82f6' },
    { name: 'Congress Bot', value: congressEquity, fill: '#a855f7' },
    ...(optionsEquity ? [{ name: 'Options Bot', value: optionsEquity, fill: '#f59e0b' }] : []),
  ];

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Allocation</h3>
      <div className="flex items-center gap-6">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3 flex-1">
          {data.map((item) => (
            <div key={item.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm text-zinc-300">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-white">{((item.value / total) * 100).toFixed(1)}%</span>
              </div>
              <div className="text-xs text-zinc-500">{formatCurrency(item.value)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
