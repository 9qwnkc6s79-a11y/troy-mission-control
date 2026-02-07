'use client';

import { StrategyMetrics } from '@/lib/benchmark-data';

interface MetricsTableProps {
  spy: StrategyMetrics;
  portfolio: StrategyMetrics;
  days?: number;
}

function AlphaCell({ value }: { value: number }) {
  const isPositive = value > 0;
  return (
    <span className={`font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
      {isPositive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

function MetricValue({ value, suffix = '', isPercent = false, colorCode = false, inverse = false }: {
  value: number;
  suffix?: string;
  isPercent?: boolean;
  colorCode?: boolean;
  inverse?: boolean;
}) {
  const displayVal = isPercent ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%` : `${value.toFixed(2)}${suffix}`;
  let color = 'text-white';
  if (colorCode) {
    if (inverse) {
      color = value < 0 ? 'text-emerald-400' : value > 0 ? 'text-red-400' : 'text-zinc-400';
    } else {
      color = value > 0 ? 'text-emerald-400' : value < 0 ? 'text-red-400' : 'text-zinc-400';
    }
  }
  return <span className={`font-mono font-medium ${color}`}>{displayVal}</span>;
}

export default function MetricsTable({ spy, portfolio, days }: MetricsTableProps) {
  const rows = [
    {
      label: 'Total Return',
      spy: spy.totalReturn,
      portfolio: portfolio.totalReturn,
      isPercent: true,
      colorCode: true,
    },
    {
      label: 'Alpha vs S&P',
      spy: null,
      portfolio: portfolio.alpha,
      isAlpha: true,
    },
    {
      label: 'Sharpe Ratio',
      spy: spy.sharpeRatio,
      portfolio: portfolio.sharpeRatio,
      suffix: '',
      colorCode: true,
    },
    {
      label: 'Max Drawdown',
      spy: spy.maxDrawdown,
      portfolio: portfolio.maxDrawdown,
      isPercent: true,
      colorCode: true,
      inverse: true,
    },
    {
      label: 'Win Rate',
      spy: spy.winRate,
      portfolio: portfolio.winRate,
      isPercent: false,
      suffix: '%',
      colorCode: false,
    },
    {
      label: 'Profit Factor',
      spy: spy.profitFactor,
      portfolio: portfolio.profitFactor,
      suffix: 'x',
      colorCode: false,
    },
    {
      label: 'Best Day',
      spy: spy.bestDay,
      portfolio: portfolio.bestDay,
      isPercent: true,
      colorCode: true,
    },
    {
      label: 'Worst Day',
      spy: spy.worstDay,
      portfolio: portfolio.worstDay,
      isPercent: true,
      colorCode: true,
    },
    {
      label: 'Volatility (Ann.)',
      spy: spy.volatility,
      portfolio: portfolio.volatility,
      isPercent: false,
      suffix: '%',
      colorCode: false,
    },
  ];

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
      <div className="px-5 py-4 border-b border-[#1e1e2e]">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Key Performance Metrics</h3>
        <p className="text-xs text-zinc-500 mt-1">
          {days ? `${days}-day` : 'Rolling'} statistics · Real Alpaca data
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-zinc-500 uppercase tracking-wider border-b border-[#1e1e2e]">
              <th className="text-left px-5 py-3 font-medium">Metric</th>
              <th className="text-right px-4 py-3 font-medium">
                <span className="text-zinc-500">📉 S&P 500</span>
              </th>
              <th className="text-right px-5 py-3 font-medium">
                <span className="text-emerald-400">📊 Portfolio</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className={`border-t border-[#1a1a2a] hover:bg-[#161622] transition-colors ${
                  row.label === 'Alpha vs S&P' ? 'bg-[#0d1117]' : ''
                }`}
              >
                <td className={`px-5 py-3 text-zinc-300 font-medium ${
                  row.label === 'Alpha vs S&P' ? 'text-yellow-300/80' : ''
                }`}>
                  {row.label}
                </td>
                <td className="px-4 py-3 text-right">
                  {row.isAlpha ? (
                    <span className="text-zinc-600">—</span>
                  ) : (
                    <MetricValue
                      value={row.spy!}
                      isPercent={row.isPercent}
                      suffix={row.suffix}
                      colorCode={row.colorCode}
                      inverse={row.inverse}
                    />
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {row.isAlpha ? (
                    <AlphaCell value={row.portfolio!} />
                  ) : (
                    <MetricValue
                      value={row.portfolio!}
                      isPercent={row.isPercent}
                      suffix={row.suffix}
                      colorCode={row.colorCode}
                      inverse={row.inverse}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
