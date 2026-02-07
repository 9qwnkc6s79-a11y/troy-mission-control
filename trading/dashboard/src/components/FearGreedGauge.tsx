'use client';

interface FearGreedGaugeProps {
  value: number;
  label: string;
  trend: string;
}

export default function FearGreedGauge({ value, label, trend }: FearGreedGaugeProps) {
  // Color based on value
  const getColor = (val: number) => {
    if (val <= 20) return '#ef4444';
    if (val <= 40) return '#f97316';
    if (val <= 60) return '#eab308';
    if (val <= 80) return '#84cc16';
    return '#22c55e';
  };

  const color = getColor(value);
  const rotation = (value / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Fear & Greed Index</h3>
      
      <div className="flex flex-col items-center">
        {/* Gauge */}
        <div className="relative w-48 h-24 mb-4">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 10 95 A 85 85 0 0 1 190 95"
              fill="none"
              stroke="#1e1e2e"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Gradient segments */}
            <path d="M 10 95 A 85 85 0 0 1 46 30" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
            <path d="M 46 30 A 85 85 0 0 1 100 10" fill="none" stroke="#f97316" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
            <path d="M 100 10 A 85 85 0 0 1 154 30" fill="none" stroke="#eab308" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
            <path d="M 154 30 A 85 85 0 0 1 190 95" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
            
            {/* Needle */}
            <g transform={`rotate(${rotation}, 100, 95)`}>
              <line x1="100" y1="95" x2="100" y2="25" stroke={color} strokeWidth="3" strokeLinecap="round" />
              <circle cx="100" cy="95" r="6" fill={color} />
              <circle cx="100" cy="95" r="3" fill="#0a0a0f" />
            </g>
          </svg>
        </div>

        {/* Value */}
        <div className="text-center">
          <div className="text-4xl font-bold" style={{ color }}>{value}</div>
          <div className="text-lg font-semibold mt-1" style={{ color }}>{label}</div>
          <div className="text-xs text-zinc-500 mt-1">
            Trend: <span className={trend === 'declining' ? 'text-red-400' : 'text-emerald-400'}>{trend}</span>
          </div>
        </div>

        {/* Scale labels */}
        <div className="flex justify-between w-full mt-3 text-xs text-zinc-500">
          <span>Extreme Fear</span>
          <span>Neutral</span>
          <span>Extreme Greed</span>
        </div>
      </div>
    </div>
  );
}
