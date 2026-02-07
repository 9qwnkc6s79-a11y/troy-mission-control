'use client';

import { CongressTrade, PoliticianAlpha } from '@/lib/types';

interface CongressFindingsProps {
  findings: CongressTrade[];
}

export function CongressFindings({ findings }: CongressFindingsProps) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
      <div className="px-5 py-4 border-b border-[#1e1e2e]">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Recent Congressional Trades Found</h3>
      </div>
      <div className="divide-y divide-[#1a1a2a]">
        {findings.map((f, i) => (
          <div key={i} className="px-5 py-3 hover:bg-[#161622] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    f.party === 'D' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {f.party}
                  </span>
                  <span className="text-white font-medium text-sm">{f.politician}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  f.action === 'Purchase' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {f.action}
                </span>
                <span className="text-white font-bold">{f.symbol}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-zinc-500">{f.amount}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-zinc-500">Score:</span>
                  <span className={`text-sm font-bold ${
                    f.score >= 80 ? 'text-emerald-400' : f.score >= 60 ? 'text-yellow-400' : 'text-zinc-400'
                  }`}>
                    {f.score}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Traded: {f.tradeDate} · Reported: {f.reportDate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PoliticianLeaderboardProps {
  politicians: PoliticianAlpha[];
}

export function PoliticianLeaderboard({ politicians }: PoliticianLeaderboardProps) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
      <div className="px-5 py-4 border-b border-[#1e1e2e]">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Top Politicians by Alpha</h3>
      </div>
      <div className="divide-y divide-[#1a1a2a]">
        {politicians.map((p, i) => (
          <div key={i} className="px-5 py-4 hover:bg-[#161622] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-zinc-600">#{i + 1}</span>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  p.party === 'D' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {p.party}
                </span>
                <span className="text-white font-semibold">{p.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-zinc-500">Win Rate</div>
                  <div className="text-sm font-bold text-emerald-400">{p.winRate}%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">Avg Return</div>
                  <div className="text-sm font-bold text-emerald-400">+{p.avgReturn}%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">Trades</div>
                  <div className="text-sm font-bold text-white">{p.totalTrades}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {p.topHoldings.map((h) => (
                <span key={h} className="px-2 py-0.5 bg-[#1a1a2a] rounded text-xs text-zinc-400">{h}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
