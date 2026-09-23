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
  HelpCircle,
  LogOut,
  MessageSquareCode,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  recurringEnabled?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { user, signOut } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
    { to: '/chat',      label: 'Ask TradeSense', icon: MessageSquareCode, badge: 'AI' },
    { to: '/markets',   label: 'Markets',       icon: BarChart3 },
    { to: '/analysis',  label: 'AI Reasoning',  icon: BrainCircuit },
    { to: '/portfolio', label: 'Paper Portfolio', icon: Wallet },
    { to: '/history',   label: 'Audit History',   icon: History },
    { to: '/watchlist', label: 'Watchlist',     icon: Bookmark },
    { to: '/settings',  label: 'Settings',      icon: Settings },
  ];

  return (
    <aside className="w-60 flex flex-col justify-between h-screen sticky top-0 shrink-0 bg-[#16181F] border-r border-white/[0.06] select-none z-30">
      {/* ── Brand & Navigation ── */}
      <div>
        {/* Brand Header */}
        <div className="p-5 pb-6">
          <NavLink to="/" className="flex items-center gap-3 group">
            {/* RYO Green logo icon */}
            <div className="w-9 h-9 rounded-xl bg-ryo-gradient shadow-ryo-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Layers className="w-5 h-5 text-[#050806]" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>TradeSense</span>
              </div>
              <p className="text-[10px] font-mono text-[#8F9CAE]">
                Autonomous Copilot
              </p>
            </div>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-ryo-gradient text-[#050806] shadow-ryo-sm font-bold'
                      : 'text-[#8F9CAE] hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#050806]' : 'text-[#8F9CAE]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && !isActive && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#4ce07a]/15 text-[#4ce07a] border border-[#4ce07a]/30">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom Section: User Identity & Support ── */}
      <div className="p-3 border-t border-white/[0.06] space-y-2">
        {/* User Card */}
        {user && (
          <div className="p-2.5 rounded-xl bg-[#1D212A] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full bg-[#16181F] shrink-0 border border-white/20 object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user.name}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-mono text-[#10B981] font-bold">
                  <span className="w-1 h-1 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="truncate">{user.id}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#8F9CAE] hover:text-red-400 hover:bg-white/5 transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Help & Support NavLink */}
        <NavLink
          to="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#8F9CAE] hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-[#8F9CAE]" />
          <span>Help &amp; Docs</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
