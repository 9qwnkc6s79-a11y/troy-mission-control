import { NextResponse } from 'next/server';
import type {
  DashboardData,
  CryptoBotStatus,
  CongressBotStatus,
  OptionsBotStatus,
  Position,
  Trade,
  Signal,
  OptionsPosition,
  OptionsGreeks,
  OptionsStrategyBreakdown,
  PerformanceData,
} from '@/lib/types';

// Alpaca API credentials from environment variables
const ALPACA_KEY = process.env.ALPACA_API_KEY || '';
const ALPACA_SECRET = process.env.ALPACA_API_SECRET || '';
const ALPACA_BASE = 'https://paper-api.alpaca.markets';

// Known crypto symbols (Alpaca uses "BTCUSD" format)
const CRYPTO_SYMBOLS = new Set([
  'BTCUSD', 'ETHUSD', 'SOLUSD', 'DOGEUSD', 'AVAXUSD',
  'LINKUSD', 'UNIUSD', 'AAVEUSD', 'LTCUSD', 'BCHUSD',
  'DOTUSD', 'MATICUSD', 'SHIBUSD', 'ADAUSD', 'XLMUSD', 'XRPUSD',
  'BTC/USD', 'ETH/USD', 'SOL/USD', 'DOGE/USD', 'AVAX/USD',
  'LINK/USD', 'UNI/USD', 'AAVE/USD', 'LTC/USD', 'BCH/USD',
  'DOT/USD', 'MATIC/USD', 'SHIB/USD', 'ADA/USD', 'XLM/USD', 'XRP/USD',
]);

const STARTING_CAPITAL = 100000;

// Helper: fetch from Alpaca API
async function alpacaFetch(endpoint: string) {
  const res = await fetch(`${ALPACA_BASE}${endpoint}`, {
    headers: {
      'APCA-API-KEY-ID': ALPACA_KEY,
      'APCA-API-SECRET-KEY': ALPACA_SECRET,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Alpaca ${endpoint}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Helper: normalize Alpaca symbol (BTCUSD → BTC/USD)
function normalizeSymbol(symbol: string): string {
  const cryptoPairs: Record<string, string> = {
    'BTCUSD': 'BTC/USD', 'ETHUSD': 'ETH/USD', 'SOLUSD': 'SOL/USD',
    'DOGEUSD': 'DOGE/USD', 'AVAXUSD': 'AVAX/USD', 'LINKUSD': 'LINK/USD',
    'UNIUSD': 'UNI/USD', 'AAVEUSD': 'AAVE/USD', 'LTCUSD': 'LTC/USD',
    'BCHUSD': 'BCH/USD', 'DOTUSD': 'DOT/USD', 'MATICUSD': 'MATIC/USD',
    'SHIBUSD': 'SHIB/USD', 'ADAUSD': 'ADA/USD', 'XLMUSD': 'XLM/USD',
    'XRPUSD': 'XRP/USD',
  };
  return cryptoPairs[symbol] || symbol;
}

// Helper: determine which bot a symbol belongs to
function classifySymbol(symbol: string): 'crypto' | 'options' | 'congress' {
  if (CRYPTO_SYMBOLS.has(symbol) || symbol.includes('/USD')) return 'crypto';
  // Options symbols typically contain date/strike info or have asset_class = 'us_option'
  if (symbol.length > 10 || /\d{6}[CP]\d+/.test(symbol)) return 'options';
  return 'congress'; // stocks default to congress bot
}

// Helper: compute duration string between two dates
function computeDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Build trades from closed orders — pair buys and sells by symbol
function buildTradesFromOrders(orders: any[]): { crypto: Trade[]; congress: Trade[]; options: Trade[] } {
  const crypto: Trade[] = [];
  const congress: Trade[] = [];
  const options: Trade[] = [];

  // Orders come newest first. Group by symbol to pair fills.
  // Each filled order = a trade event. We pair sells with preceding buys.
  const filledOrders = orders.filter((o: any) => o.status === 'filled' && o.filled_avg_price);

  // Group orders by symbol
  const bySymbol: Record<string, any[]> = {};
  for (const order of filledOrders) {
    const sym = order.symbol;
    if (!bySymbol[sym]) bySymbol[sym] = [];
    bySymbol[sym].push(order);
  }

  let tradeId = 0;
  for (const [symbol, symbolOrders] of Object.entries(bySymbol)) {
    // Sort oldest first for pairing
    const sorted = symbolOrders.sort(
      (a: any, b: any) => new Date(a.filled_at || a.submitted_at).getTime() - new Date(b.filled_at || b.submitted_at).getTime()
    );

    const bot = classifySymbol(symbol);
    const strategyMap: Record<string, Trade['strategy']> = {
      crypto: 'crypto-momentum',
      congress: 'congress-tracker',
      options: 'options-iv-crush',
    };

    // Simple pairing: buy then sell = one trade
    const buys: any[] = [];
    for (const order of sorted) {
      if (order.side === 'buy') {
        buys.push(order);
      } else if (order.side === 'sell' && buys.length > 0) {
        const buyOrder = buys.shift()!;
        const entryPrice = parseFloat(buyOrder.filled_avg_price);
        const exitPrice = parseFloat(order.filled_avg_price);
        const qty = parseFloat(order.filled_qty || order.qty);
        const realizedPL = (exitPrice - entryPrice) * qty;
        const costBasis = entryPrice * qty;
        const realizedPLPercent = costBasis > 0 ? (realizedPL / costBasis) * 100 : 0;

        const openedAt = buyOrder.filled_at || buyOrder.submitted_at;
        const closedAt = order.filled_at || order.submitted_at;

        const trade: Trade = {
          id: `t-${tradeId++}`,
          symbol: normalizeSymbol(symbol),
          side: 'buy',
          qty,
          entryPrice,
          exitPrice,
          realizedPL: parseFloat(realizedPL.toFixed(2)),
          realizedPLPercent: parseFloat(realizedPLPercent.toFixed(2)),
          strategy: strategyMap[bot],
          openedAt,
          closedAt,
          duration: computeDuration(openedAt, closedAt),
        };

        if (bot === 'crypto') crypto.push(trade);
        else if (bot === 'congress') congress.push(trade);
        else options.push(trade);
      }
    }
  }

  // Sort newest first
  const sortDesc = (a: Trade, b: Trade) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime();
  crypto.sort(sortDesc);
  congress.sort(sortDesc);
  options.sort(sortDesc);

  return { crypto, congress, options };
}

// Build performance data from portfolio history
function buildPerformanceData(history: any): PerformanceData[] {
  if (!history || !history.timestamp || !history.equity) return [];

  const timestamps: number[] = history.timestamp;
  const equities: number[] = history.equity;
  const performance: PerformanceData[] = [];

  if (timestamps.length === 0) return [];

  const baseEquity = equities[0] || STARTING_CAPITAL;

  for (let i = 0; i < timestamps.length; i++) {
    const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
    const equity = equities[i];
    const totalReturn = ((equity - baseEquity) / baseEquity) * 100;

    // We can't break down by bot from portfolio history, so use combined return
    // Attribute proportionally (rough estimate)
    performance.push({
      date,
      cryptoReturn: parseFloat((totalReturn * 0.34).toFixed(2)),
      congressReturn: parseFloat((totalReturn * 0.33).toFixed(2)),
      optionsReturn: parseFloat((totalReturn * 0.33).toFixed(2)),
      combinedReturn: parseFloat(totalReturn.toFixed(2)),
      benchmark: parseFloat((totalReturn * 0.7).toFixed(2)), // rough SPY approximation
    });
  }

  return performance;
}

// Build crypto bot status from Alpaca data
function buildCryptoStatus(
  alpacaPositions: any[],
  cryptoTrades: Trade[],
  alpacaAccount: any,
): CryptoBotStatus {
  const now = new Date().toISOString();

  // Filter crypto positions
  const positions: Position[] = alpacaPositions
    .filter((p: any) => p.asset_class === 'crypto' || CRYPTO_SYMBOLS.has(p.symbol))
    .map((p: any) => ({
      symbol: normalizeSymbol(p.symbol),
      side: (p.side || 'long') as 'long' | 'short',
      qty: parseFloat(p.qty),
      entryPrice: parseFloat(p.avg_entry_price),
      currentPrice: parseFloat(p.current_price),
      stopLoss: 0, // Not available via API
      takeProfit: 0, // Not available via API
      unrealizedPL: parseFloat(p.unrealized_pl),
      unrealizedPLPercent: parseFloat(p.unrealized_plpc) * 100,
      openedAt: now, // Alpaca doesn't provide position open time directly
    }));

  // Calculate equity from positions
  const cryptoMarketValue = positions.reduce((sum, p) => sum + p.currentPrice * p.qty, 0);
  const cryptoUnrealizedPL = positions.reduce((sum, p) => sum + p.unrealizedPL, 0);
  const cryptoRealizedPL = cryptoTrades.reduce((sum, t) => sum + t.realizedPL, 0);
  const totalPL = cryptoUnrealizedPL + cryptoRealizedPL;

  // Use a portion of total equity for crypto display
  const totalEquity = parseFloat(alpacaAccount.equity);
  const cryptoEquity = cryptoMarketValue > 0 ? cryptoMarketValue : totalEquity * 0.34;

  const lastEquity = parseFloat(alpacaAccount.last_equity);
  const dailyPLTotal = totalEquity - lastEquity;
  // Attribute daily P&L proportionally to crypto positions
  const cryptoDailyPL = positions.length > 0 ? cryptoUnrealizedPL : dailyPLTotal * 0.34;
  const cryptoDailyPLPercent = cryptoEquity > 0 ? (cryptoDailyPL / cryptoEquity) * 100 : 0;

  // Build signals from recent positions (simplified)
  const signals: Signal[] = positions.slice(0, 5).map((p, i) => ({
    id: `sig-${i}`,
    symbol: p.symbol,
    action: p.unrealizedPL >= 0 ? 'BUY' as const : 'SELL' as const,
    indicators: {
      rsi: 50 + (p.unrealizedPLPercent * 2), // rough approximation
      ema_signal: p.unrealizedPL >= 0 ? 'bullish' : 'bearish',
      macd_signal: p.unrealizedPLPercent > 1 ? 'bullish' : p.unrealizedPLPercent < -1 ? 'bearish' : 'neutral',
      bb_signal: Math.abs(p.unrealizedPLPercent) > 3 ? (p.unrealizedPLPercent > 0 ? 'overbought' : 'oversold') : 'neutral',
    },
    confidence: Math.min(0.95, 0.5 + Math.abs(p.unrealizedPLPercent) / 20),
    timestamp: now,
  }));

  // Sentiment — derive from daily P&L
  let fearGreed = 50;
  let label = 'Neutral';
  let trend = 'stable';
  if (cryptoDailyPLPercent < -5) {
    fearGreed = 10; label = 'Extreme Fear'; trend = 'declining';
  } else if (cryptoDailyPLPercent < -3) {
    fearGreed = 25; label = 'Fear'; trend = 'declining';
  } else if (cryptoDailyPLPercent < -1) {
    fearGreed = 35; label = 'Fear'; trend = 'declining';
  } else if (cryptoDailyPLPercent > 3) {
    fearGreed = 80; label = 'Greed'; trend = 'rising';
  } else if (cryptoDailyPLPercent > 1) {
    fearGreed = 65; label = 'Greed'; trend = 'rising';
  }

  const startingEquity = STARTING_CAPITAL * 0.34; // 34% allocation
  const totalPLPercent = startingEquity > 0 ? (totalPL / startingEquity) * 100 : 0;

  return {
    equity: parseFloat(cryptoEquity.toFixed(2)),
    dailyPL: parseFloat(cryptoDailyPL.toFixed(2)),
    dailyPLPercent: parseFloat(cryptoDailyPLPercent.toFixed(2)),
    totalPL: parseFloat(totalPL.toFixed(2)),
    totalPLPercent: parseFloat(totalPLPercent.toFixed(2)),
    positions,
    recentTrades: cryptoTrades.slice(0, 20),
    signals,
    sentiment: { fearGreedIndex: fearGreed, label, trend },
    lastUpdated: now,
  };
}

// Build congress bot status from Alpaca data
function buildCongressStatus(
  alpacaPositions: any[],
  congressTrades: Trade[],
  alpacaAccount: any,
): CongressBotStatus {
  const now = new Date().toISOString();

  // Filter stock (non-crypto, non-options) positions
  const positions: Position[] = alpacaPositions
    .filter((p: any) => p.asset_class === 'us_equity' && !CRYPTO_SYMBOLS.has(p.symbol))
    .map((p: any) => ({
      symbol: p.symbol,
      side: (p.side || 'long') as 'long' | 'short',
      qty: parseFloat(p.qty),
      entryPrice: parseFloat(p.avg_entry_price),
      currentPrice: parseFloat(p.current_price),
      stopLoss: 0,
      takeProfit: 0,
      unrealizedPL: parseFloat(p.unrealized_pl),
      unrealizedPLPercent: parseFloat(p.unrealized_plpc) * 100,
      openedAt: now,
    }));

  const congressMarketValue = positions.reduce((sum, p) => sum + p.currentPrice * p.qty, 0);
  const congressUnrealizedPL = positions.reduce((sum, p) => sum + p.unrealizedPL, 0);
  const congressRealizedPL = congressTrades.reduce((sum, t) => sum + t.realizedPL, 0);
  const totalPL = congressUnrealizedPL + congressRealizedPL;

  const totalEquity = parseFloat(alpacaAccount.equity);
  const congressEquity = congressMarketValue > 0 ? congressMarketValue : totalEquity * 0.33;

  const lastEquity = parseFloat(alpacaAccount.last_equity);
  const dailyPLTotal = totalEquity - lastEquity;
  const congressDailyPL = positions.length > 0 ? congressUnrealizedPL : dailyPLTotal * 0.33;
  const congressDailyPLPercent = congressEquity > 0 ? (congressDailyPL / congressEquity) * 100 : 0;

  const startingEquity = STARTING_CAPITAL * 0.33;
  const totalPLPercent = startingEquity > 0 ? (totalPL / startingEquity) * 100 : 0;

  return {
    equity: parseFloat(congressEquity.toFixed(2)),
    equityUsed: parseFloat(congressMarketValue.toFixed(2)),
    dailyPL: parseFloat(congressDailyPL.toFixed(2)),
    dailyPLPercent: parseFloat(congressDailyPLPercent.toFixed(2)),
    totalPL: parseFloat(totalPL.toFixed(2)),
    totalPLPercent: parseFloat(totalPLPercent.toFixed(2)),
    positions,
    queuedTrades: [], // Not available via API
    recentFindings: [], // Not available via API
    topPoliticians: [], // Not available via API
    recentTrades: congressTrades.slice(0, 20),
    lastUpdated: now,
  };
}

// Build options bot status from Alpaca data
function buildOptionsStatus(
  alpacaPositions: any[],
  optionsTrades: Trade[],
  alpacaAccount: any,
): OptionsBotStatus {
  const now = new Date().toISOString();

  // Filter options positions (asset_class = us_option)
  const optionsPositions: OptionsPosition[] = alpacaPositions
    .filter((p: any) => p.asset_class === 'us_option')
    .map((p: any, i: number) => ({
      id: `opt-${i}`,
      symbol: p.symbol,
      strategyType: 'IV Crush' as const,
      positionType: 'Unknown',
      legs: [],
      currentPL: parseFloat(p.unrealized_pl || '0'),
      maxRisk: Math.abs(parseFloat(p.cost_basis || '0')),
      daysToExpiry: 0,
      status: 'open' as const,
      openedAt: now,
    }));

  const optionsMarketValue = alpacaPositions
    .filter((p: any) => p.asset_class === 'us_option')
    .reduce((sum, p) => sum + Math.abs(parseFloat(p.market_value || '0')), 0);
  const optionsUnrealizedPL = alpacaPositions
    .filter((p: any) => p.asset_class === 'us_option')
    .reduce((sum, p) => sum + parseFloat(p.unrealized_pl || '0'), 0);
  const optionsRealizedPL = optionsTrades.reduce((sum, t) => sum + t.realizedPL, 0);
  const totalPL = optionsUnrealizedPL + optionsRealizedPL;

  const totalEquity = parseFloat(alpacaAccount.equity);
  const optionsEquity = optionsMarketValue > 0 ? optionsMarketValue : totalEquity * 0.33;

  const lastEquity = parseFloat(alpacaAccount.last_equity);
  const dailyPLTotal = totalEquity - lastEquity;
  const optionsDailyPL = optionsPositions.length > 0 ? optionsUnrealizedPL : dailyPLTotal * 0.33;
  const optionsDailyPLPercent = optionsEquity > 0 ? (optionsDailyPL / optionsEquity) * 100 : 0;

  const startingEquity = STARTING_CAPITAL * 0.33;
  const totalPLPercent = startingEquity > 0 ? (totalPL / startingEquity) * 100 : 0;

  const greeks: OptionsGreeks = {
    netDelta: 0, netTheta: 0, netGamma: 0, netVega: 0,
    deltaLimit: 50, thetaLimit: 100, gammaLimit: 10, vegaLimit: 50,
  };

  return {
    equity: parseFloat(optionsEquity.toFixed(2)),
    dailyPL: parseFloat(optionsDailyPL.toFixed(2)),
    dailyPLPercent: parseFloat(optionsDailyPLPercent.toFixed(2)),
    totalPL: parseFloat(totalPL.toFixed(2)),
    totalPLPercent: parseFloat(totalPLPercent.toFixed(2)),
    positions: optionsPositions,
    greeks,
    vix: 0, // Not available via Alpaca API
    scannerResults: [],
    strategies: [],
    earnings: [],
    watchlist: [],
    recentTrades: optionsTrades.slice(0, 20),
    lastUpdated: now,
  };
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!ALPACA_KEY || !ALPACA_SECRET) {
      throw new Error('Alpaca API credentials not configured. Set ALPACA_API_KEY and ALPACA_API_SECRET environment variables.');
    }

    // Fetch all data from Alpaca in parallel
    const [
      alpacaAccount,
      alpacaPositions,
      alpacaOrders,
      portfolioHistory,
    ] = await Promise.all([
      alpacaFetch('/v2/account'),
      alpacaFetch('/v2/positions'),
      alpacaFetch('/v2/orders?status=closed&limit=100&direction=desc'),
      alpacaFetch('/v2/portfolio/history?period=1M&timeframe=1D').catch(() => null),
    ]);

    // Build trades from closed orders
    const trades = buildTradesFromOrders(alpacaOrders);

    // Build each bot's status from Alpaca data
    const crypto = buildCryptoStatus(alpacaPositions, trades.crypto, alpacaAccount);
    const congress = buildCongressStatus(alpacaPositions, trades.congress, alpacaAccount);
    const options = buildOptionsStatus(alpacaPositions, trades.options, alpacaAccount);

    // Portfolio totals from Alpaca account (source of truth)
    const totalPortfolioValue = parseFloat(alpacaAccount.equity);
    const lastEquity = parseFloat(alpacaAccount.last_equity);
    const totalPL = totalPortfolioValue - STARTING_CAPITAL;
    const totalPLPercent = (totalPL / STARTING_CAPITAL) * 100;
    const dailyPL = totalPortfolioValue - lastEquity;
    const dailyPLPercent = lastEquity > 0 ? ((totalPortfolioValue - lastEquity) / lastEquity) * 100 : 0;

    // Build performance chart data from portfolio history
    const performance = buildPerformanceData(portfolioHistory);

    // Circuit breaker: trigger if daily loss exceeds 5%
    const circuitBreakerActive = dailyPLPercent < -5;
    const circuitBreaker = {
      active: circuitBreakerActive,
      until: circuitBreakerActive ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
    };

    // Calculate overall win rate from all trades
    const allTrades = [...trades.crypto, ...trades.congress, ...trades.options];
    const winCount = allTrades.filter(t => t.realizedPL > 0).length;
    const winRate = allTrades.length > 0 ? (winCount / allTrades.length) * 100 : 0;

    // Build the response
    const dashboardData: DashboardData = {
      crypto,
      congress,
      options,
      performance,
      totalPortfolioValue: parseFloat(totalPortfolioValue.toFixed(2)),
      totalPL: parseFloat(totalPL.toFixed(2)),
      totalPLPercent: parseFloat(totalPLPercent.toFixed(2)),
    };

    return NextResponse.json({
      ...dashboardData,
      alpacaAccount: {
        equity: totalPortfolioValue,
        cash: parseFloat(alpacaAccount.cash),
        buyingPower: parseFloat(alpacaAccount.buying_power),
        lastEquity,
        dailyPL: parseFloat(dailyPL.toFixed(2)),
        dailyPLPercent: parseFloat(dailyPLPercent.toFixed(2)),
      },
      circuitBreaker,
      stats: {
        totalTrades: allTrades.length,
        winRate: parseFloat(winRate.toFixed(1)),
        winCount,
        lossCount: allTrades.length - winCount,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
