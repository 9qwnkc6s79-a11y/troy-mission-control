'use client';

import { OptionsBotStatus } from '@/lib/types';
import { formatCurrency, formatPL, plColor } from '@/lib/utils';

interface OptionsBotProps {
  data: OptionsBotStatus;
}

/* ── VIX Gauge ──────────────────────────────────────────────── */
function VixGauge({ value }: { value: number }) {
  // zones: 0-12 Low, 12-20 Normal, 20-30 High, 30+ Extreme
  const getZone = (v: number) => {
    if (v < 12) return { label: 'LOW', color: 'text-emerald-400', bg: 'bg-emerald-500', zone: 'Calm markets' };
    if (v < 20) return { label: 'NORMAL', color: 'text-blue-400', bg: 'bg-blue-500', zone: 'Typical vol' };
    if (v < 30) return { label: 'HIGH', color: 'text-amber-400', bg: 'bg-amber-500', zone: 'Elevated fear' };
    return { label: 'EXTREME', color: 'text-red-400', bg: 'bg-red-500', zone: 'Panic territory' };
  };
  const zone = getZone(value);
  const pct = Math.min((value / 50) * 100, 100);

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">VIX Index</h3>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${zone.bg}/20 ${zone.color}`}>
          {zone.label}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-4xl font-black font-mono tracking-tight ${zone.color}`}>
          {value.toFixed(2)}
        </span>
      </div>
      <p className="text-xs text-zinc-500 mb-3">{zone.zone}</p>
      {/* Gauge bar */}
      <div className="relative h-2.5 bg-[#1a1a2a] rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-[24%] bg-emerald-500/30" />
          <div className="w-[16%] bg-blue-500/30" />
          <div className="w-[20%] bg-amber-500/30" />
          <div className="w-[40%] bg-red-500/30" />
        </div>
        <div
          className={`absolute top-0 left-0 h-full ${zone.bg} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%`, opacity: 0.8 }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[9px] text-zinc-600">
        <span>0</span>
        <span>12</span>
        <span>20</span>
        <span>30</span>
        <span>50+</span>
      </div>
    </div>
  );
}

/* ── Greeks Panel ──────────────────────────────────────────── */
function GreeksPanel({ greeks }: { greeks: OptionsBotStatus['greeks'] }) {
  const items = [
    { label: 'Net Delta', value: greeks.netDelta, limit: greeks.deltaLimit, unit: '', color: '#3b82f6', desc: 'Directional exposure' },
    { label: 'Theta', value: greeks.netTheta, limit: greeks.thetaLimit, unit: '/day', color: '#10b981', desc: 'Time decay income', prefix: '$' },
    { label: 'Gamma', value: greeks.netGamma, limit: greeks.gammaLimit, unit: '', color: '#f59e0b', desc: 'Delta sensitivity' },
    { label: 'Vega', value: greeks.netVega, limit: greeks.vegaLimit, unit: '', color: '#a855f7', desc: 'Volatility exposure' },
  ];

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Portfolio Greeks</h3>
      <div className="space-y-4">
        {items.map((item) => {
          const absVal = Math.abs(item.value);
          const pct = Math.min((absVal / item.limit) * 100, 100);
          const isNeg = item.value < 0;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-sm text-zinc-300 font-medium">{item.label}</span>
                  <span className="text-[10px] text-zinc-600 ml-2">{item.desc}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-white">
                    {item.prefix || ''}{isNeg ? '' : '+'}{item.value.toFixed(1)}{item.unit}
                  </span>
                  <span className="text-[10px] text-zinc-600 ml-1">/ ±{item.limit}</span>
                </div>
              </div>
              <div className="h-1.5 bg-[#1a1a2a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct > 80 ? '#ef4444' : item.color,
                    opacity: 0.8,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Active Positions ──────────────────────────────────────── */
function ActivePositions({ positions }: { positions: OptionsBotStatus['positions'] }) {
  const openPositions = positions.filter(p => p.status === 'open');

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
      <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Active Positions</h3>
        <span className="text-xs text-zinc-500">{openPositions.length} open</span>
      </div>
      <div className="divide-y divide-[#1a1a2a]">
        {openPositions.map((pos) => (
          <div key={pos.id} className="px-5 py-4 hover:bg-[#161622] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white">{pos.symbol}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">
                  {pos.strategyType}
                </span>
                <span className="text-xs text-zinc-400">{pos.positionType}</span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold font-mono ${plColor(pos.currentPL)}`}>
                  {formatPL(pos.currentPL)}
                </div>
                <div className="text-[10px] text-zinc-500">{pos.daysToExpiry}d to expiry</div>
              </div>
            </div>
            {/* Legs */}
            <div className="flex flex-wrap gap-2 mb-2">
              {pos.legs.map((leg, i) => (
                <span key={i} className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                  leg.action === 'sell'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/10'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                }`}>
                  {leg.action.toUpperCase()} {leg.strike} {leg.type.toUpperCase()} {leg.expiry.slice(5)}
                </span>
              ))}
            </div>
            <div className="flex gap-4 text-xs text-zinc-500">
              {pos.entryCredit != null && (
                <span>Credit: <span className="text-emerald-400 font-mono">${pos.entryCredit}</span></span>
              )}
              {pos.entryDebit != null && (
                <span>Debit: <span className="text-red-400 font-mono">${pos.entryDebit}</span></span>
              )}
              <span>Max Risk: <span className="text-white font-mono">${pos.maxRisk}</span></span>
            </div>
          </div>
        ))}
        {openPositions.length === 0 && (
          <div className="px-5 py-8 text-center text-zinc-600 text-sm">No open positions</div>
        )}
      </div>
    </div>
  );
}

/* ── Scanner Results ──────────────────────────────────────── */
function ScannerResults({ results }: { results: OptionsBotStatus['scannerResults'] }) {
  const actionColors: Record<string, string> = {
    ENTERED: 'bg-emerald-500/10 text-emerald-400',
    PASSED: 'bg-zinc-500/10 text-zinc-400',
    WATCHING: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
      <div className="px-5 py-4 border-b border-[#1e1e2e]">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Scanner Results</h3>
        <p className="text-xs text-zinc-500 mt-1">Latest scan findings & decisions</p>
      </div>
      <div className="divide-y divide-[#1a1a2a]">
        {results.map((r) => (
          <div key={r.id} className="px-5 py-3 hover:bg-[#161622] transition-colors">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{r.symbol}</span>
                <span className="text-[10px] text-zinc-500 font-mono">{r.strategyType}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${actionColors[r.action]}`}>
                {r.action}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mb-0.5">{r.signal}</div>
            <div className="text-[10px] text-zinc-600">{r.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Strategy Breakdown ──────────────────────────────────── */
function StrategyBreakdown({ strategies }: { strategies: OptionsBotStatus['strategies'] }) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
      <div className="px-5 py-4 border-b border-[#1e1e2e]">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Strategy Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-zinc-500 uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-medium">Strategy</th>
              <th className="text-right px-3 py-3 font-medium">Trades</th>
              <th className="text-right px-3 py-3 font-medium">Win Rate</th>
              <th className="text-right px-3 py-3 font-medium">Total P&L</th>
              <th className="text-right px-5 py-3 font-medium">Avg Return</th>
            </tr>
          </thead>
          <tbody>
            {strategies.map((s) => (
              <tr key={s.name} className="border-t border-[#1a1a2a] hover:bg-[#161622] transition-colors">
                <td className="px-5 py-3 font-bold text-white">{s.name}</td>
                <td className="px-3 py-3 text-right text-zinc-300">{s.trades}</td>
                <td className="px-3 py-3 text-right">
                  <span className={`font-mono font-medium ${s.winRate >= 60 ? 'text-emerald-400' : s.winRate >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                    {s.winRate.toFixed(1)}%
                  </span>
                </td>
                <td className={`px-3 py-3 text-right font-bold font-mono ${plColor(s.totalPL)}`}>
                  {formatPL(s.totalPL)}
                </td>
                <td className={`px-5 py-3 text-right font-mono ${plColor(s.avgReturn)}`}>
                  {formatCurrency(s.avgReturn)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Upcoming Earnings ────────────────────────────────────── */
function UpcomingEarnings({ earnings }: { earnings: OptionsBotStatus['earnings'] }) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
      <div className="px-5 py-4 border-b border-[#1e1e2e]">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Upcoming Earnings</h3>
        <p className="text-xs text-zinc-500 mt-1">Watchlist stocks reporting soon</p>
      </div>
      <div className="divide-y divide-[#1a1a2a]">
        {earnings.map((e) => (
          <div key={e.symbol} className="px-5 py-3 flex items-center justify-between hover:bg-[#161622] transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white text-sm">{e.symbol}</span>
              <span className="text-xs text-zinc-500">{e.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-400 font-mono">{e.estimatedMove}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                e.daysUntil <= 3
                  ? 'bg-red-500/10 text-red-400'
                  : e.daysUntil <= 7
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-zinc-500/10 text-zinc-400'
              }`}>
                {e.daysUntil}d
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Watchlist ────────────────────────────────────────────── */
function Watchlist({ symbols }: { symbols: string[] }) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Watchlist</h3>
      <div className="flex flex-wrap gap-2">
        {symbols.map((s) => (
          <span key={s} className="px-2.5 py-1 rounded-lg bg-[#1a1a2a] border border-[#2a2a3a] text-xs font-mono font-bold text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors cursor-default">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Recently Closed ─────────────────────────────────────── */
function RecentlyClosed({ positions }: { positions: OptionsBotStatus['positions'] }) {
  const closed = positions.filter(p => p.status === 'closed');
  if (closed.length === 0) return null;

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
      <div className="px-5 py-4 border-b border-[#1e1e2e]">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Recently Closed</h3>
      </div>
      <div className="divide-y divide-[#1a1a2a]">
        {closed.map((pos) => (
          <div key={pos.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#161622] transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white">{pos.symbol}</span>
              <span className="text-[10px] text-zinc-500">{pos.positionType}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">
                {pos.strategyType}
              </span>
            </div>
            <span className={`text-sm font-bold font-mono ${plColor(pos.currentPL)}`}>
              {formatPL(pos.currentPL)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Options Bot Page ───────────────────────────────── */
export default function OptionsBot({ data }: OptionsBotProps) {
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Options Equity</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
              <span className="text-[10px] text-emerald-400 font-medium">ACTIVE</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1 tracking-tight font-mono">
            {formatCurrency(data.equity)}
          </div>
          <div className={`text-sm font-medium ${plColor(data.totalPL)}`}>
            {formatPL(data.totalPL)} ({data.totalPLPercent >= 0 ? '+' : ''}{data.totalPLPercent.toFixed(2)}%)
          </div>
        </div>

        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Daily P&L</span>
          <div className={`text-2xl font-bold mb-1 tracking-tight font-mono ${plColor(data.dailyPL)}`}>
            {formatPL(data.dailyPL)}
          </div>
          <div className={`text-sm font-medium ${plColor(data.dailyPLPercent)}`}>
            {data.dailyPLPercent >= 0 ? '+' : ''}{data.dailyPLPercent.toFixed(2)}% today
          </div>
        </div>

        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Open Positions</span>
          <div className="text-2xl font-bold text-white mb-1 tracking-tight font-mono">
            {data.positions.filter(p => p.status === 'open').length}
          </div>
          <div className="text-sm text-zinc-500">
            Capital at risk: <span className="text-white font-mono">
              {formatCurrency(data.positions.filter(p => p.status === 'open').reduce((a, p) => a + p.maxRisk, 0))}
            </span>
          </div>
        </div>

        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Theta Income</span>
          <div className="text-2xl font-bold text-emerald-400 mb-1 tracking-tight font-mono">
            +${data.greeks.netTheta.toFixed(0)}/day
          </div>
          <div className="text-sm text-zinc-500">
            Net Delta: <span className="text-white font-mono">{data.greeks.netDelta >= 0 ? '+' : ''}{data.greeks.netDelta}</span>
          </div>
        </div>
      </div>

      {/* Greeks + VIX row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GreeksPanel greeks={data.greeks} />
        </div>
        <VixGauge value={data.vix} />
      </div>

      {/* Active Positions */}
      <ActivePositions positions={data.positions} />

      {/* Recently Closed */}
      <RecentlyClosed positions={data.positions} />

      {/* Scanner + Strategy row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScannerResults results={data.scannerResults} />
        <StrategyBreakdown strategies={data.strategies} />
      </div>

      {/* Earnings + Watchlist row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UpcomingEarnings earnings={data.earnings} />
        <Watchlist symbols={data.watchlist} />
      </div>
    </div>
  );
}
