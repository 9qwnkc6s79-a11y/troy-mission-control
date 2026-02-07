/**
 * Benchmark Data Module
 * 
 * Type definitions and utility functions for benchmark/performance data.
 * All real data is fetched from /api/benchmark route (Alpaca portfolio history + SPY bars).
 * 
 * NO mock data. NO fake numbers. If data isn't available, show empty state.
 */

export interface DailyDataPoint {
  date: string;            // MM/DD format
  fullDate: string;        // YYYY-MM-DD format
  spyClose: number;        // SPY closing price
  spyReturn: number;       // SPY cumulative return %
  spyDaily: number;        // SPY daily return %
  portfolioEquity: number; // Portfolio equity value
  portfolioReturn: number; // Portfolio cumulative return %
  portfolioDaily: number;  // Portfolio daily return %
}

export interface StrategyMetrics {
  totalReturn: number;
  alpha: number;              // excess return over SPY
  sharpeRatio: number;        // annualized
  maxDrawdown: number;        // max peak-to-trough %
  winRate: number;            // % of positive days
  profitFactor: number;       // gross profit / gross loss
  bestDay: number;            // best daily return %
  worstDay: number;           // worst daily return %
  avgDailyReturn: number;
  volatility: number;         // annualized std dev
  calmarRatio: number;        // return / max drawdown
}

export interface BenchmarkData {
  daily: DailyDataPoint[];
  spy: StrategyMetrics;
  portfolio: StrategyMetrics;
  lastUpdated: string;
}

/** Compute strategy metrics from an array of daily returns (first element should be 0) */
export function computeMetrics(dailyReturns: number[]): StrategyMetrics {
  const returns = dailyReturns.slice(1); // skip day 0
  
  if (returns.length === 0) {
    return emptyMetrics();
  }

  // Cumulative return
  let cumulative = 0;
  const cumulativeReturns: number[] = [];
  for (const r of returns) {
    cumulative += r;
    cumulativeReturns.push(cumulative);
  }
  const totalReturn = cumulative;
  
  // Win rate
  const wins = returns.filter(r => r > 0).length;
  const winRate = (wins / returns.length) * 100;
  
  // Profit factor
  const grossProfit = returns.filter(r => r > 0).reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(returns.filter(r => r < 0).reduce((a, b) => a + b, 0));
  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss;
  
  // Best/worst day
  const bestDay = Math.max(...returns);
  const worstDay = Math.min(...returns);
  
  // Average daily return
  const avgDailyReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  
  // Volatility (annualized)
  const variance = returns.length > 1
    ? returns.reduce((a, b) => a + Math.pow(b - avgDailyReturn, 2), 0) / (returns.length - 1)
    : 0;
  const dailyVol = Math.sqrt(variance);
  const volatility = dailyVol * Math.sqrt(252);
  
  // Sharpe ratio (annualized, assuming 0% risk-free)
  const sharpeRatio = volatility === 0 ? 0 : (avgDailyReturn * 252) / volatility;
  
  // Max drawdown
  let peak = 0;
  let maxDD = 0;
  for (const cr of cumulativeReturns) {
    if (cr > peak) peak = cr;
    const dd = peak - cr;
    if (dd > maxDD) maxDD = dd;
  }
  const maxDrawdown = -maxDD;
  
  // Calmar ratio
  const calmarRatio = maxDD === 0 ? 0 : totalReturn / maxDD;
  
  return {
    totalReturn: Number(totalReturn.toFixed(2)),
    alpha: 0, // set by caller
    sharpeRatio: Number(sharpeRatio.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    winRate: Number(winRate.toFixed(1)),
    profitFactor: Number(Math.min(profitFactor, 999).toFixed(2)),
    bestDay: Number(bestDay.toFixed(2)),
    worstDay: Number(worstDay.toFixed(2)),
    avgDailyReturn: Number(avgDailyReturn.toFixed(3)),
    volatility: Number(volatility.toFixed(1)),
    calmarRatio: Number(calmarRatio.toFixed(2)),
  };
}

/** Empty metrics (for when there's no data) */
export function emptyMetrics(): StrategyMetrics {
  return {
    totalReturn: 0,
    alpha: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    winRate: 0,
    profitFactor: 0,
    bestDay: 0,
    worstDay: 0,
    avgDailyReturn: 0,
    volatility: 0,
    calmarRatio: 0,
  };
}

/** Normalized data for comparison chart (base 100) */
export function getNormalizedData(data: DailyDataPoint[]) {
  return data.map(d => ({
    date: d.date,
    fullDate: d.fullDate,
    spy: Number((100 + d.spyReturn).toFixed(2)),
    portfolio: Number((100 + d.portfolioReturn).toFixed(2)),
  }));
}
