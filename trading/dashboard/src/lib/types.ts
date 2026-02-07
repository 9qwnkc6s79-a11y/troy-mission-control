// Types for the trading dashboard

export interface Position {
  symbol: string;
  side: 'long' | 'short';
  qty: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  openedAt: string;
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  entryPrice: number;
  exitPrice: number;
  realizedPL: number;
  realizedPLPercent: number;
  strategy: 'crypto-momentum' | 'congress-tracker' | 'options-iv-crush' | 'options-mean-reversion' | 'options-vol-arb' | 'options-momentum';
  openedAt: string;
  closedAt: string;
  duration: string;
  // Options-specific fields
  positionType?: string;   // e.g. "Iron Condor", "Bull Call Spread"
  legs?: string;           // e.g. "150/155/160/165C"
}

export interface Signal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  indicators: {
    rsi: number;
    ema_signal: string;
    macd_signal: string;
    bb_signal: string;
  };
  confidence: number;
  timestamp: string;
}

export interface CryptoBotStatus {
  equity: number;
  dailyPL: number;
  dailyPLPercent: number;
  totalPL: number;
  totalPLPercent: number;
  positions: Position[];
  recentTrades: Trade[];
  signals: Signal[];
  sentiment: {
    fearGreedIndex: number;
    label: string;
    trend: string;
  };
  lastUpdated: string;
}

export interface CongressTrade {
  politician: string;
  party: string;
  symbol: string;
  action: 'Purchase' | 'Sale';
  amount: string;
  reportDate: string;
  tradeDate: string;
  score: number;
}

export interface PoliticianAlpha {
  name: string;
  party: string;
  totalTrades: number;
  winRate: number;
  avgReturn: number;
  topHoldings: string[];
}

export interface CongressBotStatus {
  equity: number;
  equityUsed: number;
  dailyPL: number;
  dailyPLPercent: number;
  totalPL: number;
  totalPLPercent: number;
  positions: Position[];
  queuedTrades: CongressTrade[];
  recentFindings: CongressTrade[];
  topPoliticians: PoliticianAlpha[];
  recentTrades: Trade[];
  lastUpdated: string;
}

// Options Bot types
export interface OptionsPosition {
  id: string;
  symbol: string;
  strategyType: 'IV Crush' | 'Mean Reversion' | 'Vol Arb' | 'Momentum';
  positionType: string; // Iron Condor, Bull Call Spread, Short Straddle, etc.
  legs: OptionsLeg[];
  entryCredit?: number;  // for credit strategies
  entryDebit?: number;   // for debit strategies
  currentPL: number;
  maxRisk: number;
  daysToExpiry: number;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
}

export interface OptionsLeg {
  type: 'call' | 'put';
  action: 'buy' | 'sell';
  strike: number;
  expiry: string;
  qty: number;
}

export interface OptionsGreeks {
  netDelta: number;
  netTheta: number;
  netGamma: number;
  netVega: number;
  deltaLimit: number;
  thetaLimit: number;
  gammaLimit: number;
  vegaLimit: number;
}

export interface ScannerResult {
  id: string;
  symbol: string;
  strategyType: string;
  signal: string;
  reason: string;
  action: 'ENTERED' | 'PASSED' | 'WATCHING';
  timestamp: string;
}

export interface OptionsStrategyBreakdown {
  name: string;
  trades: number;
  wins: number;
  winRate: number;
  totalPL: number;
  avgReturn: number;
}

export interface EarningsEvent {
  symbol: string;
  date: string;
  daysUntil: number;
  estimatedMove: string;
  onWatchlist: boolean;
}

export interface OptionsBotStatus {
  equity: number;
  dailyPL: number;
  dailyPLPercent: number;
  totalPL: number;
  totalPLPercent: number;
  positions: OptionsPosition[];
  greeks: OptionsGreeks;
  vix: number;
  scannerResults: ScannerResult[];
  strategies: OptionsStrategyBreakdown[];
  earnings: EarningsEvent[];
  watchlist: string[];
  recentTrades: Trade[];
  lastUpdated: string;
}

export interface PerformanceData {
  date: string;
  cryptoReturn: number;
  congressReturn: number;
  optionsReturn: number;
  combinedReturn: number;
  benchmark: number;
}

export interface DashboardData {
  crypto: CryptoBotStatus;
  congress: CongressBotStatus;
  options: OptionsBotStatus;
  performance: PerformanceData[];
  totalPortfolioValue: number;
  totalPL: number;
  totalPLPercent: number;
}

// Re-export benchmark types for convenience
export type { DailyDataPoint, StrategyMetrics, BenchmarkData } from './benchmark-data';
export { emptyMetrics } from './benchmark-data';
