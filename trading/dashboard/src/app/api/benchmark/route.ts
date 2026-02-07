import { NextResponse } from 'next/server';
import { computeMetrics, emptyMetrics } from '@/lib/benchmark-data';
import type { DailyDataPoint, BenchmarkData } from '@/lib/benchmark-data';

/**
 * API Route: /api/benchmark
 * 
 * Fetches REAL data:
 *   - Alpaca portfolio history (actual account equity over time)
 *   - SPY bars from Alpaca market data (real S&P 500 prices)
 * 
 * Computes real alpha, sharpe ratio, max drawdown, etc.
 * Returns empty data if not available — NEVER returns fake/mock numbers.
 */

const ALPACA_KEY = process.env.ALPACA_API_KEY || '';
const ALPACA_SECRET = process.env.ALPACA_API_SECRET || '';
const ALPACA_BASE = 'https://paper-api.alpaca.markets';
const ALPACA_DATA = 'https://data.alpaca.markets';

const alpacaHeaders = {
  'APCA-API-KEY-ID': ALPACA_KEY,
  'APCA-API-SECRET-KEY': ALPACA_SECRET,
};

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!ALPACA_KEY || !ALPACA_SECRET) {
      return NextResponse.json({
        daily: [],
        spy: emptyMetrics(),
        portfolio: emptyMetrics(),
        lastUpdated: new Date().toISOString(),
        error: 'Alpaca credentials not configured',
      });
    }

    // 1. Fetch portfolio history from Alpaca
    const portfolioRes = await fetch(
      `${ALPACA_BASE}/v2/portfolio/history?period=1M&timeframe=1D`,
      { headers: alpacaHeaders, cache: 'no-store' }
    );

    if (!portfolioRes.ok) {
      const errText = await portfolioRes.text().catch(() => '');
      throw new Error(`Portfolio history API returned ${portfolioRes.status}: ${errText}`);
    }

    const portfolio = await portfolioRes.json();

    if (!portfolio.timestamp || portfolio.timestamp.length === 0) {
      return NextResponse.json({
        daily: [],
        spy: emptyMetrics(),
        portfolio: emptyMetrics(),
        lastUpdated: new Date().toISOString(),
        note: 'No portfolio history available yet',
      } satisfies BenchmarkData & { note: string });
    }

    const timestamps: number[] = portfolio.timestamp;
    const equities: number[] = portfolio.equity;

    // 2. Get date range and fetch SPY bars for the same period
    const startDate = new Date(timestamps[0] * 1000).toISOString().split('T')[0];
    const endDate = new Date(
      timestamps[timestamps.length - 1] * 1000 + 2 * 86400000
    ).toISOString().split('T')[0];

    let spyPriceMap: Record<string, number> = {};

    try {
      const spyRes = await fetch(
        `${ALPACA_DATA}/v2/stocks/SPY/bars?timeframe=1Day&start=${startDate}&end=${endDate}&limit=60&adjustment=split`,
        { headers: alpacaHeaders, cache: 'no-store' }
      );

      if (spyRes.ok) {
        const spyData = await spyRes.json();
        const bars: Array<{ t: string; c: number }> = spyData.bars || [];
        for (const bar of bars) {
          const date = bar.t.split('T')[0];
          spyPriceMap[date] = bar.c;
        }
      }
    } catch {
      // If SPY data fails, we still show portfolio data without SPY comparison
      console.warn('Failed to fetch SPY data, showing portfolio only');
    }

    // 3. Build daily data points
    const baseEquity = equities[0];

    // Find SPY base price for the first available date
    let spyBase = 0;
    for (const ts of timestamps) {
      const date = new Date(ts * 1000).toISOString().split('T')[0];
      if (spyPriceMap[date]) {
        spyBase = spyPriceMap[date];
        break;
      }
    }

    const daily: DailyDataPoint[] = [];
    const portfolioDailyReturns: number[] = [];
    const spyDailyReturns: number[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const date = new Date(timestamps[i] * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(date.getUTCDate()).padStart(2, '0');

      const equity = equities[i];
      const portfolioReturn = baseEquity > 0
        ? ((equity - baseEquity) / baseEquity) * 100
        : 0;

      const spyClose = spyPriceMap[dateStr] || 0;
      const spyReturn = spyBase > 0 && spyClose > 0
        ? ((spyClose - spyBase) / spyBase) * 100
        : 0;

      // Daily returns
      let portfolioDailyReturn = 0;
      let spyDailyReturn = 0;

      if (i === 0) {
        portfolioDailyReturn = 0;
        spyDailyReturn = 0;
      } else {
        const prevEquity = equities[i - 1];
        portfolioDailyReturn = prevEquity > 0
          ? ((equity - prevEquity) / prevEquity) * 100
          : 0;

        const prevDate = new Date(timestamps[i - 1] * 1000).toISOString().split('T')[0];
        const prevSpy = spyPriceMap[prevDate] || 0;
        spyDailyReturn = prevSpy > 0 && spyClose > 0
          ? ((spyClose - prevSpy) / prevSpy) * 100
          : 0;
      }

      portfolioDailyReturns.push(portfolioDailyReturn);
      spyDailyReturns.push(spyDailyReturn);

      daily.push({
        date: `${mm}/${dd}`,
        fullDate: dateStr,
        spyClose: Number(spyClose.toFixed(2)),
        spyReturn: Number(spyReturn.toFixed(2)),
        spyDaily: Number(spyDailyReturn.toFixed(4)),
        portfolioEquity: Number(equity.toFixed(2)),
        portfolioReturn: Number(portfolioReturn.toFixed(2)),
        portfolioDaily: Number(portfolioDailyReturn.toFixed(4)),
      });
    }

    // 4. Compute metrics from real daily returns
    const spyMetrics = computeMetrics(spyDailyReturns);
    const portfolioMetrics = computeMetrics(portfolioDailyReturns);

    spyMetrics.alpha = 0;
    portfolioMetrics.alpha = Number(
      (portfolioMetrics.totalReturn - spyMetrics.totalReturn).toFixed(2)
    );

    const result: BenchmarkData = {
      daily,
      spy: spyMetrics,
      portfolio: portfolioMetrics,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Benchmark API error:', error);
    return NextResponse.json(
      {
        daily: [],
        spy: emptyMetrics(),
        portfolio: emptyMetrics(),
        lastUpdated: new Date().toISOString(),
        error: error.message || 'Failed to fetch benchmark data',
      },
      { status: 500 }
    );
  }
}
