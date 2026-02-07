'use client';

import { useState } from 'react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'crypto', label: 'Crypto Bot', icon: '⚡' },
  { id: 'congress', label: 'Congress Bot', icon: '🏛️' },
  { id: 'options', label: 'Options Bot', icon: '🎯' },
  { id: 'performance', label: 'Performance', icon: '📈' },
  { id: 'trades', label: 'Trade Log', icon: '📋' },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-56 bg-[#0d0d14] border-r border-[#1e1e2e] flex-col z-50">
        <div className="p-5 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">
              T
            </div>
            <div>
              <div className="text-sm font-bold text-white">TradeOps</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Dashboard</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 py-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#111118]'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-[#1e1e2e]">
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
            <span>Live · Auto-refresh</span>
          </div>
        </div>
      </nav>

      {/* Mobile top nav */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 bg-[#0d0d14] border-b border-[#1e1e2e] z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold">
              T
            </div>
            <span className="text-sm font-bold text-white">TradeOps</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-600">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
            <span>Live</span>
          </div>
        </div>
        <div className="flex overflow-x-auto px-2 pb-2 gap-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
