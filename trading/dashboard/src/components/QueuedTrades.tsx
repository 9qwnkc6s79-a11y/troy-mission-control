'use client';

import { CongressTrade } from '@/lib/types';

interface QueuedTradesProps {
  trades: CongressTrade[];
}

export default function QueuedTrades({ trades }: QueuedTradesProps) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
      <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          Queued Trades 
          <span className="ml-2 text-yellow-400 text-xs font-normal">⏳ Monday Open</span>
        </h3>
        <span className="text-xs text-zinc-500">{trades.length} queued</span>
      </div>
      <div className="divide-y divide-[#1a1a2a]">
        {trades.map((trade, i) => (
          <div key={i} className="px-5 py-3 hover:bg-[#161622] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 text-sm">
                  ⏳
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{trade.symbol}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      trade.action === 'Purchase' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {trade.action.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {trade.politician} ({trade.party}) · {trade.amount}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  trade.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  trade.score >= 60 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                  'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                }`}>
                  Score: {trade.score}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
