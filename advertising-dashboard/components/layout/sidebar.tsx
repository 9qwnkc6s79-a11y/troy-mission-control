'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BarChart3,
  DollarSign,
  MapPin,
  Calendar,
  Upload,
  Settings,
  Coffee,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Executive Summary', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaign Performance', href: '/dashboard/campaigns', icon: BarChart3 },
  { name: 'Revenue Correlation', href: '/dashboard/revenue', icon: DollarSign },
  { name: 'Local Performance', href: '/dashboard/local', icon: MapPin },
  { name: 'Seasonal Tracking', href: '/dashboard/seasonal', icon: Calendar },
  { name: 'Upload Data', href: '/dashboard/upload', icon: Upload },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-200',
        'lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="p-2 bg-amber-700 rounded-lg">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Boundaries</h1>
            <p className="text-xs text-gray-500">Ad Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive ? 'text-amber-700' : 'text-gray-400')} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Store Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-gray-600">Little Elm, TX</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-gray-600">Prosper, TX</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Meta: act_468165461888446
          </p>
        </div>
      </aside>
    </>
  );
}
