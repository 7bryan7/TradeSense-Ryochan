import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  BrainCircuit,
  Wallet,
  History,
  Bookmark,
  Settings,
  Sparkles,
  ExternalLink,
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  recurringEnabled?: boolean;
}

const HexLogo: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon
      points="18,2 34,10 34,26 18,34 2,26 2,10"
      fill="rgba(56,249,151,0.08)"
      stroke="#38F997"
      strokeWidth="1.5"
    />
    <polygon
      points="18,9 27,13.5 27,22.5 18,27 9,22.5 9,13.5"
      fill="#38F997"
      fillOpacity="0.25"
      stroke="#38F997"
      strokeWidth="1"
    />
    <circle cx="18" cy="18" r="2.5" fill="#FBEDE0" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
    { to: '/markets',   label: 'Markets',    icon: BarChart3 },
    { to: '/analysis',  label: 'AI Reasoning', icon: BrainCircuit },
    { to: '/portfolio', label: 'Paper Portfolio',  icon: Wallet },
    { to: '/history',   label: 'Audit History',    icon: History },
    { to: '/watchlist', label: 'Watchlist',  icon: Bookmark },
  ];

  return (
    <aside
      className="w-64 flex flex-col justify-between h-screen sticky top-0 shrink-0 bg-[#10131F]/95 backdrop-blur-xl border-r border-[rgba(251,237,224,0.08)] select-none"
    >
      {/* ── Brand & Navigation ── */}
      <div>
        <div className="p-5 border-b border-[rgba(251,237,224,0.08)]">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="shrink-0 group-hover:scale-105 transition-transform duration-300">
              <HexLogo />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-[#FBEDE0]">
                <span>TradeSense</span>
              </div>
              <p className="text-[10px] font-mono text-[rgba(251,237,224,0.5)] mt-0.5">
                RYO-CHAN '26 HACKATHON
              </p>
            </div>
          </NavLink>
        </div>

        {/* ── Navigation Items ── */}
        <nav className="px-3 pt-4 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider font-bold text-[rgba(251,237,224,0.4)]">
            Intelligence Platform
          </p>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[rgba(251,237,224,0.08)] text-[#FBEDE0] border-l-2 border-[#38F997] shadow-xs'
                      : 'text-[rgba(251,237,224,0.65)] hover:text-[#FBEDE0] hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-[#38F997]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom Section: Agent Telemetry & Settings ── */}
      <div className="p-3 border-t border-[rgba(251,237,224,0.08)] space-y-2">
        {/* Agent Telemetry Card */}
        <div className="p-3 rounded-xl bg-[#161926]/90 border border-[rgba(251,237,224,0.10)] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[rgba(251,237,224,0.6)] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#00D2FF]" />
              Agent Engine
            </span>
            <span className="flex items-center gap-1 text-[#38F997] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38F997] animate-pulse" />
              ONLINE
            </span>
          </div>
          <p className="text-[10px] font-mono text-[rgba(251,237,224,0.5)] leading-tight">
            Multi-Source Ingestion & Slippage Engine Active
          </p>
        </div>

        {/* Settings NavLink */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-[rgba(251,237,224,0.08)] text-[#FBEDE0]'
                : 'text-[rgba(251,237,224,0.65)] hover:text-[#FBEDE0] hover:bg-white/5'
            }`
          }
        >
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">v1.0</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
