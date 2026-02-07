'use client';

import { DailyDataPoint } from '@/lib/benchmark-data';

interface AlphaBadgeProps {
  alpha: number;
  label?: string;
}

export function AlphaBadge({ alpha, label }: AlphaBadgeProps) {
  const isPositive = alpha >= 0;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      isPositive
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        : 'bg-red-500/10 text-red-400 border border-red-500/20'
    }`}>
      <span>{isPositive ? '▲' : '▼'}</span>
      <span>{isPositive ? '+' : ''}{alpha.toFixed(2)}% vs S&P</span>
    </div>
  );
}

interface SparklineProps {
  portfolioData: number[];
  spyData: number[];
  width?: number;
  height?: number;
  color: string;
}

export function MiniSparkline({ portfolioData, spyData, width = 120, height = 32, color }: SparklineProps) {
  if (portfolioData.length < 2 || spyData.length < 2) return null;
  
  const allVals = [...portfolioData, ...spyData];
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;
  
  const toY = (val: number) => height - ((val - min) / range) * (height - 4) - 2;
  const toX = (i: number, len: number) => (i / (len - 1)) * (width - 4) + 2;
  
  const portfolioPath = portfolioData
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i, portfolioData.length)},${toY(v)}`)
    .join(' ');
  
  const spyPath = spyData
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i, spyData.length)},${toY(v)}`)
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={spyPath} fill="none" stroke="#52525b" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
      <path d={portfolioPath} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

interface OverviewAlphaCardProps {
  data: DailyDataPoint[];
}

export function OverviewAlphaCards({ data }: OverviewAlphaCardProps) {
  if (data.length === 0) {
    return (
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">vs Market</h3>
        <p className="text-zinc-500 text-sm text-center py-4">No performance data yet</p>
      </div>
    );
  }

  const latest = data[data.length - 1];
  const spyReturns = data.map(d => d.spyReturn);
  const portfolioReturns = data.map(d => d.portfolioReturn);
  const alpha = latest.portfolioReturn - latest.spyReturn;
  const hasSpy = spyReturns.some(r => r !== 0);
  const days = data.length;

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">vs Market ({days}D)</h3>
        {hasSpy && (
          <span className="text-[10px] text-zinc-600 font-medium">
            S&P 500: {latest.spyReturn >= 0 ? '+' : ''}{latest.spyReturn.toFixed(2)}%
          </span>
        )}
      </div>
      <div className="space-y-4">
        {/* Portfolio vs SPY */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MiniSparkline
              portfolioData={portfolioReturns}
              spyData={spyReturns}
              color="#10b981"
              width={80}
              height={24}
            />
            <div>
              <div className="text-xs text-zinc-400">📊 Portfolio</div>
              <div className="text-sm font-bold text-white">
                {latest.portfolioReturn >= 0 ? '+' : ''}{latest.portfolioReturn.toFixed(2)}%
              </div>
            </div>
          </div>
          {hasSpy && (
            <div className={`text-right px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
              alpha >= 0
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {alpha >= 0 ? '+' : ''}{alpha.toFixed(2)}% α
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
