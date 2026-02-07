'use client';

import { Signal } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

interface SignalLogProps {
  signals: Signal[];
}

export default function SignalLog({ signals }: SignalLogProps) {
  const actionColor = (action: string) => {
    if (action === 'BUY') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (action === 'SELL') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  };

  const confidenceBar = (confidence: number) => {
    const color = confidence >= 0.7 ? 'bg-emerald-500' : confidence >= 0.4 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="w-16 h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${confidence * 100}%` }} />
      </div>
    );
  };

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
      <div className="px-5 py-4 border-b border-[#1e1e2e]">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Signal Log</h3>
      </div>
      <div className="divide-y divide-[#1a1a2a]">
        {signals.map((signal) => (
          <div key={signal.id} className="px-5 py-3 hover:bg-[#161622] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-sm">{signal.symbol}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${actionColor(signal.action)}`}>
                  {signal.action}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Conf</span>
                  {confidenceBar(signal.confidence)}
                  <span className="text-xs text-zinc-400">{(signal.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className={`${signal.indicators.rsi < 30 ? 'text-red-400' : signal.indicators.rsi > 70 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                RSI: {signal.indicators.rsi}
              </span>
              <span className={`${signal.indicators.ema_signal === 'bullish' ? 'text-emerald-400' : signal.indicators.ema_signal === 'bearish' ? 'text-red-400' : 'text-zinc-500'}`}>
                EMA: {signal.indicators.ema_signal}
              </span>
              <span className={`${signal.indicators.macd_signal === 'bullish' ? 'text-emerald-400' : signal.indicators.macd_signal === 'bearish' ? 'text-red-400' : 'text-zinc-500'}`}>
                MACD: {signal.indicators.macd_signal}
              </span>
              <span className={`${signal.indicators.bb_signal === 'oversold' ? 'text-red-400' : signal.indicators.bb_signal === 'overbought' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                BB: {signal.indicators.bb_signal}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
