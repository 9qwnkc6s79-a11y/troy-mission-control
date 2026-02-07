// ============================================
// Utility Functions
// ============================================

import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatROAS(value: number): string {
  return `${value.toFixed(1)}x`;
}

export function getDateRange(period: string): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start: string;

  switch (period) {
    case 'today':
      start = end;
      break;
    case '7d':
      start = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];
      break;
    case '90d':
      start = new Date(now.getTime() - 90 * 86400000).toISOString().split('T')[0];
      break;
    default:
      start = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];
  }

  return { start, end };
}

export function isApiConfigured(platform: 'meta' | 'google' | 'toast'): boolean {
  switch (platform) {
    case 'meta':
      return !!(process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID);
    case 'google':
      return !!(process.env.GOOGLE_ADS_CLIENT_ID && process.env.GOOGLE_ADS_REFRESH_TOKEN);
    case 'toast':
      return !!(process.env.TOAST_CLIENT_ID && process.env.TOAST_CLIENT_SECRET);
    default:
      return false;
  }
}

export function getRushHourLabel(hour: number): string {
  if (hour >= 6 && hour < 9) return 'Breakfast Rush';
  if (hour >= 11 && hour < 14) return 'Lunch Rush';
  if (hour >= 14 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 20) return 'Evening';
  return 'Off-Peak';
}

export function getChangeIndicator(current: number, previous: number): {
  change: number;
  isPositive: boolean;
  label: string;
} {
  if (previous === 0) return { change: 0, isPositive: true, label: 'N/A' };
  const change = ((current - previous) / previous) * 100;
  return {
    change: Math.abs(change),
    isPositive: change >= 0,
    label: `${change >= 0 ? '+' : '-'}${Math.abs(change).toFixed(1)}%`,
  };
}
