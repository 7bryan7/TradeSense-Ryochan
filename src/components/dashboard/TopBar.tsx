import React, { useState } from 'react';
import {
  Play,
  Loader2,
  Search,
  Bell,
  Moon,
  ChevronDown,
  SlidersHorizontal,
  Keyboard,
  MessageSquareCode,
  ShieldCheck,
} from 'lucide-react';
import { Token } from '../../types/market';
import { DataModeBadge } from '../common/DataModeBadge';
import { DemoStateMode } from '../../hooks/useAgentRun';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  token: Token;
  dataMode: 'LIVE' | 'FIXTURE';
  onToggleDataMode: () => void;
  asOf: string;
  isScanning: boolean;
  scanStep: string;
  onRunAnalysis: () => void;
  nextRunCountdown: string;
  demoState: DemoStateMode;
  onSelectDemoState: (mode: DemoStateMode) => void;
  onOpenShortcuts?: () => void;
  onOpenChat?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  token,
  dataMode,
  onToggleDataMode,
  asOf,
  isScanning,
  scanStep,
  onRunAnalysis,
  nextRunCountdown,
  demoState,
  onSelectDemoState,
  onOpenShortcuts,
  onOpenChat,
  searchQuery = '',
  onSearchChange,
}) => {
  const { user } = useAuth();
  const userName = user?.name ? user.name.split(' ')[0] : 'Trader';
  const [internalSearch, setInternalSearch] = useState(searchQuery);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalSearch(e.target.value);
    onSearchChange?.(e.target.value);
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-[#1E222B]/75 backdrop-blur-2xl px-4 sm:px-6 py-3 border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.3)] relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent">
      <div className="w-full flex items-center justify-between gap-4 relative z-10">
        {/* Left: Greeting from reference template ("Hi, John!") */}
        <div className="flex items-center gap-3 shrink-0">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Hi, {userName}!
            </h1>
            <p className="text-[11px] text-[#8F9CAE] font-medium hidden sm:block">
              Market Telemetry • As of {asOf}
            </p>
          </div>
        </div>

        {/* Center: Rounded Pill Search Bar (exactly like reference image) */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#8F9CAE] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={internalSearch}
              onChange={handleSearch}
              placeholder="Search token, evidence, or run..."
              className="w-full bg-[#15171C]/80 text-white placeholder-[#5E6A7D] text-xs pl-10 pr-4 py-2 rounded-full border border-white/[0.08] focus:outline-none focus:border-[#4ce07a]/60 focus:ring-1 focus:ring-[#4ce07a]/30 transition-all font-sans"
            />
          </div>
        </div>

        {/* Right: Actions, Theme, Notifications & User Avatar (matching reference template) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Data Mode Pill */}
          <DataModeBadge mode={dataMode} interactive onToggle={onToggleDataMode} />

          {/* Scenario Selector */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#1E222B] border border-white/[0.06] rounded-full px-3 py-1 text-xs">
            <SlidersHorizontal className="w-3 h-3 text-[#8F9CAE]" />
            <select
              aria-label="Simulation state scenario"
              value={demoState}
              onChange={e => onSelectDemoState(e.target.value as DemoStateMode)}
              className="bg-transparent text-white font-mono text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="NORMAL_BUY" className="bg-[#1E222B] text-white">BUY (Normal)</option>
              <option value="HOLD" className="bg-[#1E222B] text-white">HOLD (Neutral)</option>
              <option value="SELL_NO_POSITION" className="bg-[#1E222B] text-white">SELL (Skip)</option>
              <option value="BLOCKED_SAFETY" className="bg-[#1E222B] text-[#F87171]">BLOCKED (Risk)</option>
            </select>
          </div>

          {/* Theme Icon (Moon) */}
          <button
            type="button"
            title="Theme Toggle"
            className="p-2 rounded-full bg-[#1E222B] hover:bg-[#252A35] text-[#8F9CAE] hover:text-white border border-white/[0.06] transition-colors"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>

          {/* Notification Bell with Badge */}
          <button
            type="button"
            title="Notifications"
            className="p-2 rounded-full bg-[#1E222B] hover:bg-[#252A35] text-[#8F9CAE] hover:text-white border border-white/[0.06] transition-colors relative"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="w-2 h-2 rounded-full bg-[#4ce07a] absolute top-1.5 right-1.5 ring-2 ring-[#15171C]" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-[#1E222B] border border-white/[0.06]">
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=trader'}
              alt={user?.name || 'Trader'}
              className="w-6 h-6 rounded-full bg-[#15171C] object-cover"
            />
            <span className="text-xs font-semibold text-white hidden sm:inline">
              {userName}
            </span>
            <ChevronDown className="w-3 h-3 text-[#8F9CAE]" />
          </div>

          {/* Primary CTA: Run Scan */}
          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-ryo-gradient text-[#050806] font-bold text-xs font-mono rounded-full shadow-ryo-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isScanning ? (
              <Loader2 className="w-3 h-3 animate-spin text-[#050806]" />
            ) : (
              <Play className="w-3 h-3 fill-current text-[#050806]" />
            )}
            <span className="whitespace-nowrap">{isScanning ? 'SCANNING...' : 'RUN SCAN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
