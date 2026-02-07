'use client';

import { Position } from '@/lib/types';
import { formatCurrency, formatPercent, formatPL, plColor, formatDate } from '@/lib/utils';

interface PositionsTableProps {
  positions: Position[];
  title?: string;
}

export default function PositionsTable({ positions, title = 'Open Positions' }: PositionsTableProps) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
      <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h3>
        <span className="text-xs text-zinc-500">{positions.length} active</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-zinc-500 uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-medium">Symbol</th>
              <th className="text-left px-3 py-3 font-medium">Side</th>
              <th className="text-right px-3 py-3 font-medium">Qty</th>
              <th className="text-right px-3 py-3 font-medium">Entry</th>
              <th className="text-right px-3 py-3 font-medium">Current</th>
              <th className="text-right px-3 py-3 font-medium">Stop</th>
              <th className="text-right px-3 py-3 font-medium">Target</th>
              <th className="text-right px-5 py-3 font-medium">P&L</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr key={pos.symbol} className="border-t border-[#1a1a2a] hover:bg-[#161622] transition-colors">
                <td className="px-5 py-3">
                  <span className="font-bold text-white">{pos.symbol}</span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    pos.side === 'long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {pos.side}
                  </span>
                </td>
                <td className="px-3 py-3 text-right text-zinc-300">{pos.qty}</td>
                <td className="px-3 py-3 text-right text-zinc-300">{formatCurrency(pos.entryPrice)}</td>
                <td className="px-3 py-3 text-right text-white font-medium">{formatCurrency(pos.currentPrice)}</td>
                <td className="px-3 py-3 text-right text-red-400/70">{formatCurrency(pos.stopLoss)}</td>
                <td className="px-3 py-3 text-right text-emerald-400/70">{formatCurrency(pos.takeProfit)}</td>
                <td className="px-5 py-3 text-right">
                  <div className={`font-bold ${plColor(pos.unrealizedPL)}`}>
                    {formatPL(pos.unrealizedPL)}
                  </div>
                  <div className={`text-xs ${plColor(pos.unrealizedPLPercent)}`}>
                    {formatPercent(pos.unrealizedPLPercent)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
