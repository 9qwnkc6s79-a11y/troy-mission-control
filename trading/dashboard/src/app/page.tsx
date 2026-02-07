'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import StatCard from '@/components/StatCard';
import PositionsTable from '@/components/PositionsTable';
import FearGreedGauge from '@/components/FearGreedGauge';
import SignalLog from '@/components/SignalLog';
import PerformanceChart from '@/components/PerformanceChart';
import TradeLog from '@/components/TradeLog';
import AllocationChart from '@/components/AllocationChart';
import QueuedTrades from '@/components/QueuedTrades';
import { CongressFindings, PoliticianLeaderboard } from '@/components/CongressFindings';
import BenchmarkChart from '@/components/BenchmarkChart';
import DailyReturnsChart from '@/components/DailyReturnsChart';
import MetricsTable from '@/components/MetricsTable';
import { OverviewAlphaCards, AlphaBadge } from '@/components/AlphaIndicator';
import OptionsBot from '@/components/OptionsBot';
import { getNormalizedData } from '@/lib/benchmark-data';
import type { BenchmarkData } from '@/lib/benchmark-data';
import { formatCurrency, formatPL, formatPercent, plColor } from '@/lib/utils';
import type { DashboardData } from '@/lib/types';

// Default empty data matching the DashboardData type
function getEmptyDashboardData(): DashboardData {
  const now = new Date().toISOString();
  return {
    crypto: {
      equity: 0, dailyPL: 0, dailyPLPercent: 0, totalPL: 0, totalPLPercent: 0,
      positions: [], recentTrades: [], signals: [],
      sentiment: { fearGreedIndex: 50, label: 'Loading...', trend: 'stable' },
      lastUpdated: now,
    },
    congress: {
      equity: 0, equityUsed: 0, dailyPL: 0, dailyPLPercent: 0, totalPL: 0, totalPLPercent: 0,
      positions: [], queuedTrades: [], recentFindings: [], topPoliticians: [], recentTrades: [],
      lastUpdated: now,
    },
    options: {
      equity: 0, dailyPL: 0, dailyPLPercent: 0, totalPL: 0, totalPLPercent: 0,
      positions: [], greeks: {
        netDelta: 0, netTheta: 0, netGamma: 0, netVega: 0,
        deltaLimit: 50, thetaLimit: 100, gammaLimit: 10, vegaLimit: 50,
      },
      vix: 0, scannerResults: [], strategies: [], earnings: [], watchlist: [],
      recentTrades: [], lastUpdated: now,
    },
    performance: [],
    totalPortfolioValue: 0,
    totalPL: 0,
    totalPLPercent: 0,
  };
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<DashboardData>(getEmptyDashboardData());
  const [alpacaExtra, setAlpacaExtra] = useState<any>(null);
  const [circuitBreaker, setCircuitBreaker] = useState<any>(null);
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizedData = useMemo(() => {
    if (!benchmark || benchmark.daily.length === 0) return [];
    return getNormalizedData(benchmark.daily);
  }, [benchmark]);

  const allTrades = useMemo(() => {
    return [
      ...data.crypto.recentTrades,
      ...data.congress.recentTrades,
      ...data.options.recentTrades,
    ].sort(
      (a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
    );
  }, [data]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      
      const dashboardData: DashboardData = {
        crypto: json.crypto,
        congress: json.congress,
        options: json.options,
        performance: json.performance || [],
        totalPortfolioValue: json.totalPortfolioValue,
        totalPL: json.totalPL,
        totalPLPercent: json.totalPLPercent,
      };
      
      setData(dashboardData);
      setAlpacaExtra(json.alpacaAccount || null);
      setCircuitBreaker(json.circuitBreaker || null);
      setLastRefresh(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBenchmarkData = useCallback(async () => {
    try {
      const res = await fetch('/api/benchmark');
      if (!res.ok) {
        console.warn('Benchmark API returned', res.status);
        return;
      }
      const json: BenchmarkData = await res.json();
      setBenchmark(json);
    } catch (err) {
      console.warn('Failed to fetch benchmark data:', err);
    }
  }, []);

  // Initial fetch + auto-refresh every 30 seconds
  useEffect(() => {
    fetchDashboardData();
    fetchBenchmarkData();
    const interval = setInterval(fetchDashboardData, 30000);
    // Refresh benchmark less often (every 5 minutes)
    const benchmarkInterval = setInterval(fetchBenchmarkData, 300000);
    return () => {
      clearInterval(interval);
      clearInterval(benchmarkInterval);
    };
  }, [fetchDashboardData, fetchBenchmarkData]);

  // Loading screen
  if (loading && data.totalPortfolioValue === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-zinc-700 border-t-blue-500 rounded-full mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Loading live data from Alpaca...</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => {
    // Compute portfolio alpha if benchmark data is available
    const portfolioAlpha = benchmark?.portfolio?.alpha ?? null;

    return (
      <div className="space-y-6">
        {/* Circuit breaker warning */}
        {circuitBreaker?.active && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <span className="text-red-400 font-bold text-sm">Circuit Breaker Active</span>
              <p className="text-red-400/70 text-xs mt-0.5">
                Trading paused until {new Date(circuitBreaker.until).toLocaleString()}
                {' '}· Daily loss limit triggered
              </p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <span className="text-amber-400 font-bold text-sm">Data Error</span>
              <p className="text-amber-400/70 text-xs mt-0.5">{error} · Showing last known data</p>
            </div>
          </div>
        )}

        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <StatCard
              title="Total Portfolio"
              value={data.totalPortfolioValue}
              change={data.totalPL}
              changePercent={data.totalPLPercent}
              variant="large"
            />
            {portfolioAlpha !== null && (
              <div className="absolute top-3 right-3">
                <AlphaBadge alpha={portfolioAlpha} />
              </div>
            )}
          </div>
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">⚡ Crypto Bot</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1 tracking-tight">
              {formatCurrency(data.crypto.equity)}
            </div>
            <div className={`text-sm font-medium ${plColor(data.crypto.dailyPL)}`}>
              {formatPL(data.crypto.dailyPL)} ({formatPercent(data.crypto.dailyPLPercent)})
            </div>
          </div>
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">🏛️ Congress Bot</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1 tracking-tight">
              {formatCurrency(data.congress.equity)}
            </div>
            <div className={`text-sm font-medium ${plColor(data.congress.dailyPL)}`}>
              {formatPL(data.congress.dailyPL)} ({formatPercent(data.congress.dailyPLPercent)})
            </div>
          </div>
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">🎯 Options Bot</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1 tracking-tight">
              {formatCurrency(data.options.equity)}
            </div>
            <div className={`text-sm font-medium ${plColor(data.options.dailyPL)}`}>
              {formatPL(data.options.dailyPL)} ({formatPercent(data.options.dailyPLPercent)})
            </div>
          </div>
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
            <div className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-2">Bot Status</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">⚡ Crypto</span>
                <div className="flex items-center gap-2">
                  {circuitBreaker?.active ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-red-500 pulse-dot" />
                      <span className="text-xs text-red-400 font-medium">Circuit Breaker</span>
                    </>
                  ) : data.crypto.positions.length > 0 ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
                      <span className="text-xs text-emerald-400 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-zinc-500" />
                      <span className="text-xs text-zinc-400 font-medium">Idle</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">🏛️ Congress</span>
                <div className="flex items-center gap-2">
                  {data.congress.positions.length > 0 ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
                      <span className="text-xs text-emerald-400 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-zinc-500" />
                      <span className="text-xs text-zinc-400 font-medium">Monitoring</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">🎯 Options</span>
                <div className="flex items-center gap-2">
                  {data.options.positions.length > 0 ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
                      <span className="text-xs text-emerald-400 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-zinc-500" />
                      <span className="text-xs text-zinc-400 font-medium">Scanning</span>
                    </>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-[#1e1e2e]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Open Positions</span>
                  <span className="text-sm font-bold text-white">
                    {data.crypto.positions.length + data.congress.positions.length + data.options.positions.filter(p => p.status === 'open').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alpaca Account Details */}
        {alpacaExtra && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 card-glow">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Account Equity</span>
              <div className="text-lg font-bold text-white mt-1">{formatCurrency(alpacaExtra.equity)}</div>
            </div>
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 card-glow">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Cash</span>
              <div className="text-lg font-bold text-white mt-1">{formatCurrency(alpacaExtra.cash)}</div>
            </div>
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 card-glow">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Buying Power</span>
              <div className="text-lg font-bold text-white mt-1">{formatCurrency(alpacaExtra.buyingPower)}</div>
            </div>
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 card-glow">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Today&apos;s P&L</span>
              <div className={`text-lg font-bold mt-1 ${plColor(alpacaExtra.dailyPL)}`}>
                {formatPL(alpacaExtra.dailyPL)} ({formatPercent(alpacaExtra.dailyPLPercent)})
              </div>
            </div>
          </div>
        )}

        {/* Chart and vs Market */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {data.performance.length > 0 ? (
              <PerformanceChart data={data.performance} />
            ) : (
              <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-8 card-glow h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-zinc-400 text-sm">Performance chart building...</p>
                  <p className="text-zinc-600 text-xs mt-1">Historical daily snapshots will populate over time</p>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <OverviewAlphaCards data={benchmark?.daily ?? []} />
            <AllocationChart
              cryptoEquity={data.crypto.equity}
              congressEquity={data.congress.equity}
              optionsEquity={data.options.equity}
            />
          </div>
        </div>

        {/* Positions overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PositionsTable positions={data.crypto.positions} title="Crypto Positions" />
          <PositionsTable positions={data.congress.positions} title="Congress Positions" />
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
            <div className="px-5 py-4 border-b border-[#1e1e2e]">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Options Positions</h3>
            </div>
            <div className="divide-y divide-[#1a1a2a]">
              {data.options.positions.filter(p => p.status === 'open').length > 0 ? (
                data.options.positions.filter(p => p.status === 'open').map((pos) => (
                  <div key={pos.id} className="px-5 py-3 hover:bg-[#161622] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{pos.symbol}</span>
                        <span className="text-[10px] text-zinc-500">{pos.positionType}</span>
                      </div>
                      <span className={`text-sm font-bold font-mono ${plColor(pos.currentPL)}`}>
                        {formatPL(pos.currentPL)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                        {pos.strategyType}
                      </span>
                      <span className="text-[10px] text-zinc-600">{pos.daysToExpiry}d to expiry</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="text-zinc-500 text-sm">No open positions</p>
                  <p className="text-zinc-600 text-xs mt-1">Bot is scanning for opportunities</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.congress.queuedTrades.length > 0 ? (
            <QueuedTrades trades={data.congress.queuedTrades} />
          ) : (
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
              <div className="px-5 py-4 border-b border-[#1e1e2e]">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Congress Trade Queue</h3>
              </div>
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-500 text-sm">No queued trades</p>
                <p className="text-zinc-600 text-xs mt-1">Monitoring congressional filings...</p>
              </div>
            </div>
          )}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
            <div className="px-5 py-4 border-b border-[#1e1e2e]">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Recent Trades</h3>
            </div>
            <div className="divide-y divide-[#1a1a2a]">
              {allTrades.length > 0 ? (
                allTrades.slice(0, 6).map((trade) => {
                  const isOptions = trade.strategy.startsWith('options-');
                  return (
                    <div key={trade.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#161622] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          trade.strategy === 'crypto-momentum'
                            ? 'bg-blue-500/10 text-blue-400'
                            : isOptions
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-purple-500/10 text-purple-400'
                        }`}>
                          {trade.strategy === 'crypto-momentum' ? '⚡' : isOptions ? '🎯' : '🏛️'}
                        </span>
                        <div>
                          <span className="text-white font-bold text-sm">{trade.symbol}</span>
                          {isOptions && trade.positionType && (
                            <span className="text-[10px] text-zinc-500 ml-2">{trade.positionType}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${plColor(trade.realizedPL)}`}>
                          {formatPL(trade.realizedPL)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="text-zinc-500 text-sm">No closed trades yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCrypto = () => {
    const winCount = data.crypto.recentTrades.filter(t => t.realizedPL > 0).length;
    const totalCount = data.crypto.recentTrades.length;
    const winRate = totalCount > 0 ? Math.round((winCount / totalCount) * 100) : 0;

    return (
      <div className="space-y-6">
        {/* Circuit breaker warning */}
        {circuitBreaker?.active && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <span className="text-red-400 font-bold text-sm">Circuit Breaker Active</span>
              <p className="text-red-400/70 text-xs mt-0.5">
                Trading paused until {new Date(circuitBreaker.until).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Crypto Equity"
            value={data.crypto.equity}
            change={data.crypto.totalPL}
            changePercent={data.crypto.totalPLPercent}
            variant="large"
          />
          <StatCard
            title="Daily P&L"
            value={formatPL(data.crypto.dailyPL)}
            changePercent={data.crypto.dailyPLPercent}
          />
          <StatCard
            title="Open Positions"
            value={data.crypto.positions.length.toString()}
          />
          <StatCard
            title="Win Rate (Recent)"
            value={totalCount > 0 ? `${winRate}%` : '—'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <PositionsTable positions={data.crypto.positions} title="Open Positions" />
          </div>
          <FearGreedGauge
            value={data.crypto.sentiment.fearGreedIndex}
            label={data.crypto.sentiment.label}
            trend={data.crypto.sentiment.trend}
          />
        </div>

        {data.crypto.signals.length > 0 && (
          <SignalLog signals={data.crypto.signals} />
        )}

        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
          <div className="px-5 py-4 border-b border-[#1e1e2e]">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Recent Closed Trades</h3>
          </div>
          {data.crypto.recentTrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-zinc-500 uppercase tracking-wider">
                    <th className="text-left px-5 py-3 font-medium">Symbol</th>
                    <th className="text-right px-3 py-3 font-medium">Entry</th>
                    <th className="text-right px-3 py-3 font-medium">Exit</th>
                    <th className="text-left px-3 py-3 font-medium">Duration</th>
                    <th className="text-right px-5 py-3 font-medium">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {data.crypto.recentTrades.map((trade) => (
                    <tr key={trade.id} className="border-t border-[#1a1a2a] hover:bg-[#161622] transition-colors">
                      <td className="px-5 py-3 font-bold text-white">{trade.symbol}</td>
                      <td className="px-3 py-3 text-right text-zinc-300">{formatCurrency(trade.entryPrice)}</td>
                      <td className="px-3 py-3 text-right text-white">{formatCurrency(trade.exitPrice)}</td>
                      <td className="px-3 py-3 text-zinc-400 text-xs">{trade.duration}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`font-bold ${plColor(trade.realizedPL)}`}>{formatPL(trade.realizedPL)}</span>
                        <span className={`text-xs ml-1 ${plColor(trade.realizedPLPercent)}`}>({formatPercent(trade.realizedPLPercent)})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-zinc-500 text-sm">No closed trades yet</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCongress = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Congress Equity"
          value={data.congress.equity}
          change={data.congress.totalPL}
          changePercent={data.congress.totalPLPercent}
          variant="large"
        />
        <StatCard
          title="Daily P&L"
          value={formatPL(data.congress.dailyPL)}
          changePercent={data.congress.dailyPLPercent}
        />
        <StatCard
          title="Equity Used"
          value={data.congress.equityUsed}
        />
        <StatCard
          title="Queued Trades"
          value={data.congress.queuedTrades.length.toString()}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.congress.positions.length > 0 ? (
          <PositionsTable positions={data.congress.positions} title="Open Positions" />
        ) : (
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
            <div className="px-5 py-4 border-b border-[#1e1e2e]">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Open Positions</h3>
            </div>
            <div className="px-5 py-8 text-center">
              <p className="text-zinc-500 text-sm">No open positions</p>
              <p className="text-zinc-600 text-xs mt-1">Bot is monitoring congressional trades</p>
            </div>
          </div>
        )}
        {data.congress.queuedTrades.length > 0 ? (
          <QueuedTrades trades={data.congress.queuedTrades} />
        ) : (
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden card-glow">
            <div className="px-5 py-4 border-b border-[#1e1e2e]">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Queued Trades</h3>
            </div>
            <div className="px-5 py-8 text-center">
              <p className="text-zinc-500 text-sm">No queued trades</p>
              <p className="text-zinc-600 text-xs mt-1">Waiting for high-confidence signals</p>
            </div>
          </div>
        )}
      </div>

      {data.congress.recentFindings.length > 0 && (
        <CongressFindings findings={data.congress.recentFindings} />
      )}
      {data.congress.topPoliticians.length > 0 && (
        <PoliticianLeaderboard politicians={data.congress.topPoliticians} />
      )}

      {data.congress.recentFindings.length === 0 && data.congress.topPoliticians.length === 0 && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-8 card-glow text-center">
          <p className="text-zinc-400 text-sm">Congress tracker is monitoring filings</p>
          <p className="text-zinc-600 text-xs mt-1">No trades have been triggered yet — waiting for high-confidence signals</p>
        </div>
      )}
    </div>
  );

  const renderOptions = () => (
    <OptionsBot data={data.options} />
  );

  const renderPerformance = () => {
    // If no benchmark data available, show empty state
    if (!benchmark || benchmark.daily.length === 0) {
      return (
        <div className="space-y-6">
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-12 card-glow text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-white mb-2">No Performance Data Yet</h3>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              Performance data will appear here once your portfolio has trading history.
              The dashboard fetches real data from your Alpaca paper trading account.
            </p>
          </div>
        </div>
      );
    }

    const portfolioAlpha = benchmark.portfolio.alpha;
    const isAlphaPositive = portfolioAlpha >= 0;
    const hasSpy = benchmark.daily.some(d => d.spyReturn !== 0);
    const days = benchmark.daily.length;

    return (
      <div className="space-y-6">
        {/* Hero Alpha Banner */}
        <div className={`relative overflow-hidden rounded-xl border p-6 ${
          isAlphaPositive
            ? 'bg-gradient-to-r from-emerald-950/40 to-[#111118] border-emerald-500/20'
            : 'bg-gradient-to-r from-red-950/40 to-[#111118] border-red-500/20'
        }`}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium">
                Portfolio Alpha · {days} Days · Real Data
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className={`text-5xl font-black font-mono tracking-tight ${
                isAlphaPositive ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {isAlphaPositive ? '+' : ''}{portfolioAlpha.toFixed(2)}%
              </span>
              {hasSpy && <span className="text-lg text-zinc-400">vs S&P 500</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              {hasSpy && (
                <div>
                  <span className="text-zinc-500">S&P 500: </span>
                  <span className="text-white font-medium">
                    {benchmark.spy.totalReturn >= 0 ? '+' : ''}{benchmark.spy.totalReturn.toFixed(2)}%
                  </span>
                </div>
              )}
              <div>
                <span className="text-zinc-500">Portfolio: </span>
                <span className={`font-medium ${benchmark.portfolio.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {benchmark.portfolio.totalReturn >= 0 ? '+' : ''}{benchmark.portfolio.totalReturn.toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Sharpe: </span>
                <span className="text-white font-medium">{benchmark.portfolio.sharpeRatio.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-zinc-500">Max DD: </span>
                <span className="text-red-400 font-medium">{benchmark.portfolio.maxDrawdown.toFixed(2)}%</span>
              </div>
            </div>
          </div>
          <div className={`absolute right-6 top-1/2 -translate-y-1/2 text-[120px] font-black opacity-[0.03] ${
            isAlphaPositive ? 'text-emerald-400' : 'text-red-400'
          }`}>
            α
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '📊 Portfolio Return', value: benchmark.portfolio.totalReturn, isReturn: true },
            { label: '📉 S&P 500 Return', value: hasSpy ? benchmark.spy.totalReturn : null, isReturn: true },
            { label: '⚡ Win Rate', value: benchmark.portfolio.winRate, suffix: '%' },
            { label: '📈 Profit Factor', value: benchmark.portfolio.profitFactor, suffix: 'x' },
          ].map((s) => (
            <div key={s.label} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 card-glow">
              <span className="text-xs text-zinc-400">{s.label}</span>
              <div className="mt-2">
                {s.value !== null ? (
                  <span className={`text-2xl font-bold font-mono ${
                    s.isReturn
                      ? (s.value >= 0 ? 'text-emerald-400' : 'text-red-400')
                      : 'text-white'
                  }`}>
                    {s.isReturn ? (s.value >= 0 ? '+' : '') : ''}{s.value.toFixed(2)}{s.suffix || '%'}
                  </span>
                ) : (
                  <span className="text-2xl font-bold font-mono text-zinc-600">—</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <BenchmarkChart data={normalizedData} />
        <DailyReturnsChart data={benchmark.daily} />
        <MetricsTable
          spy={benchmark.spy}
          portfolio={benchmark.portfolio}
          days={days}
        />
      </div>
    );
  };

  const renderTrades = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Trades" value={allTrades.length.toString()} />
        <StatCard
          title="Total Realized P&L"
          value={allTrades.length > 0 ? formatPL(allTrades.reduce((a, b) => a + b.realizedPL, 0)) : '—'}
        />
        <StatCard
          title="Win Rate"
          value={allTrades.length > 0 ? `${((allTrades.filter(t => t.realizedPL > 0).length / allTrades.length) * 100).toFixed(0)}%` : '—'}
        />
      </div>
      {allTrades.length > 0 ? (
        <TradeLog trades={allTrades} />
      ) : (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-8 card-glow text-center">
          <p className="text-zinc-400 text-sm">No closed trades to display</p>
          <p className="text-zinc-600 text-xs mt-1">Trades will appear here as bots close positions</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'crypto': return renderCrypto();
      case 'congress': return renderCongress();
      case 'options': return renderOptions();
      case 'performance': return renderPerformance();
      case 'trades': return renderTrades();
      default: return renderOverview();
    }
  };

  const tabTitles: Record<string, string> = {
    overview: 'Dashboard Overview',
    crypto: 'Crypto Momentum Bot',
    congress: 'Congress Tracker Bot',
    options: 'Options Trading Bot',
    performance: 'Performance vs S&P 500',
    trades: 'Trade Log',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="lg:ml-56 pt-24 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white">{tabTitles[activeTab]}</h1>
              <p className="text-xs text-zinc-500 mt-1">
                Last updated: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 30s
                {loading && ' · Refreshing...'}
              </p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                fetchDashboardData();
                fetchBenchmarkData();
              }}
              className="px-3 py-1.5 bg-[#111118] border border-[#1e1e2e] rounded-lg text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
            >
              ↻ Refresh
            </button>
          </div>

          {renderContent()}

          {/* Footer */}
          <div className="mt-8 pb-6 text-center text-xs text-zinc-700">
            TradeOps Dashboard · Live data from Alpaca Paper Trading · Built for monitoring
          </div>
        </div>
      </main>
    </div>
  );
}
