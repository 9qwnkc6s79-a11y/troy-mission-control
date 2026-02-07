'use client';

import { useState } from 'react';
import { Trade } from '@/lib/types';
import { formatCurrency, formatPL, formatPercent, plColor, formatDate } from '@/lib/utils';

interface TradeLogProps {
  trades: Trade[];
}

type SortKey = 'closedAt' | 'symbol' | 'strategy' | 'realizedPL';
type SortDir = 'asc' | 'desc';

function getStrategyLabel(strategy: Trade['strategy']): { icon: string; label: string; colorClass: string } {
  switch (strategy) {
    case 'crypto-momentum':
      return { icon: '⚡', label: 'Crypto', colorClass: 'bg-blue-500/10 text-blue-400' };
    case 'congress-tracker':
      return { icon: '🏛️', label: 'Congress', colorClass: 'bg-purple-500/10 text-purple-400' };
    case 'options-iv-crush':
      return { icon: '🎯', label: 'IV Crush', colorClass: 'bg-amber-500/10 text-amber-400' };
    case 'options-mean-reversion':
      return { icon: '🎯', label: 'Mean Rev', colorClass: 'bg-amber-500/10 text-amber-400' };
    case 'options-vol-arb':
      return { icon: '🎯', label: 'Vol Arb', colorClass: 'bg-amber-500/10 text-amber-400' };
    case 'options-momentum':
      return { icon: '🎯', label: 'Momentum', colorClass: 'bg-amber-500/10 text-amber-400' };
    default:
      return { icon: '📊', label: strategy, colorClass: 'bg-zinc-500/10 text-zinc-400' };
  }
}

export default function TradeLog({ trades }: TradeLogProps) {
  const [sortKey, setSortKey] = useState<SortKey>('closedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...trades].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'closedAt':
        cmp = new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime();
        break;
      case 'symbol':
        cmp = a.symbol.localeCompare(b.symbol);
        break;
      case 'strategy':
        cmp = a.strategy.localeCompare(b.strategy);
        break;
      case 'realizedPL':
        cmp = a.realizedPL - b.realizedPL;
        break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="text-zinc-600 ml-1">↕</span>;
    return <span className="text-blue-400 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
      <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Trade Log</h3>
        <span className="text-xs text-zinc-500">{trades.length} trades</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-zinc-500 uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-medium cursor-pointer hover:text-zinc-300" onClick={() => toggleSort('closedAt')}>
                Date <SortIcon col="closedAt" />
              </th>
              <th className="text-left px-3 py-3 font-medium cursor-pointer hover:text-zinc-300" onClick={() => toggleSort('symbol')}>
                Symbol <SortIcon col="symbol" />
              </th>
              <th className="text-left px-3 py-3 font-medium">Side</th>
              <th className="text-right px-3 py-3 font-medium">Qty</th>
              <th className="text-right px-3 py-3 font-medium">Entry</th>
              <th className="text-right px-3 py-3 font-medium">Exit</th>
              <th className="text-left px-3 py-3 font-medium cursor-pointer hover:text-zinc-300" onClick={() => toggleSort('strategy')}>
                Strategy <SortIcon col="strategy" />
              </th>
              <th className="text-left px-3 py-3 font-medium">Details</th>
              <th className="text-left px-3 py-3 font-medium">Duration</th>
              <th className="text-right px-5 py-3 font-medium cursor-pointer hover:text-zinc-300" onClick={() => toggleSort('realizedPL')}>
                P&L <SortIcon col="realizedPL" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((trade) => {
              const strat = getStrategyLabel(trade.strategy);
              const isOptions = trade.strategy.startsWith('options-');
              return (
                <tr key={trade.id} className="border-t border-[#1a1a2a] hover:bg-[#161622] transition-colors">
                  <td className="px-5 py-3 text-zinc-400 text-xs">{formatDate(trade.closedAt)}</td>
                  <td className="px-3 py-3">
                    <span className="font-bold text-white">{trade.symbol}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      trade.side === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-zinc-300">{trade.qty}</td>
                  <td className="px-3 py-3 text-right text-zinc-300">{formatCurrency(trade.entryPrice)}</td>
                  <td className="px-3 py-3 text-right text-white">{formatCurrency(trade.exitPrice)}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${strat.colorClass}`}>
                      {strat.icon} {strat.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-zinc-400">
                    {isOptions && trade.positionType ? (
                      <div>
                        <div className="text-zinc-300">{trade.positionType}</div>
                        {trade.legs && <div className="text-zinc-500 text-[10px]">{trade.legs}</div>}
                      </div>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-zinc-400 text-xs">{trade.duration}</td>
                  <td className="px-5 py-3 text-right">
                    <div className={`font-bold ${plColor(trade.realizedPL)}`}>
                      {formatPL(trade.realizedPL)}
                    </div>
                    <div className={`text-xs ${plColor(trade.realizedPLPercent)}`}>
                      {formatPercent(trade.realizedPLPercent)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
