import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import '../styles/workspace.css';
import {
  LayoutDashboard,
  BarChart3,
  BrainCircuit,
  Wallet,
  History,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  MessageSquareCode,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const mobileNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chat',      label: 'Ask AI',    icon: MessageSquareCode },
    { to: '/markets',   label: 'Markets',   icon: BarChart3 },
    { to: '/analysis',  label: 'Analysis',  icon: BrainCircuit },
    { to: '/portfolio', label: 'Portfolio', icon: Wallet },
  ];

  const isChat = location.pathname === '/chat';

  return (
    <div className={`studio-app flex h-screen overflow-hidden text-white font-sans relative ${isChat ? 'studio-chat-route' : ''}`}>
      {/* Cinematic Looping Ambient Video Background across entire studio workspace */}
      <video
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full object-cover opacity-15"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/assets/video/309316_medium.mp4" type="video/mp4" />
      </video>
      <a href="#workspace-main" className="studio-skip-link">Skip to content</a>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex relative z-20 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-up">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="studio-mobile-drawer relative z-10 w-72 h-full border-r border-white/[0.08] shadow-2xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-white/[0.08]">
              <span className="font-bold text-white flex items-center gap-2 text-base">
                <span className="w-6 h-6 rounded-lg bg-ryo-gradient text-[#050806] font-black flex items-center justify-center text-xs">TS</span>
                TradeSense
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 flex-1 overflow-y-auto" onClick={() => setMobileMenuOpen(false)}>
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 relative z-10 ${isChat ? 'h-screen overflow-hidden' : 'overflow-y-auto'}`}>
        {/* Mobile Top Header */}
        <div className="md:hidden flex items-center justify-between p-3.5 bg-[#10131F]/90 backdrop-blur-md border-b border-[rgba(251,237,224,0.10)] shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 font-bold text-sm text-[#FBEDE0]">
            <span className="w-2 h-2 rounded-full bg-[#4ce07a] animate-pulse" />
            <span>TradeSense</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileMenuOpen}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#FBEDE0] hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Page Outlet */}
        <main id="workspace-main" tabIndex={-1} className={`studio-main flex-1 flex flex-col min-w-0 ${isChat ? 'h-full overflow-hidden' : 'pb-20 md:pb-8'}`}>
          <Outlet />
        </main>


        {/* Mobile Bottom Navigation Bar */}
        <div className="studio-mobile-nav md:hidden fixed bottom-3 left-4 right-4 z-40 backdrop-blur-xl border border-white/[0.08] rounded-2xl flex items-center justify-around py-2 shadow-2xl">
          {mobileNav.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#050806] bg-ryo-gradient shadow-ryo-sm font-bold scale-105'
                    : 'text-[#8F9CAE] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-mono">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
