import React, { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import type { ViewName } from '../../types';

export type LandingDestination = ViewName | 'candidates';

export const HexLogo: React.FC<{ className?: string }> = ({ className = 'w-[30px] h-[30px]' }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} transition-transform duration-300 group-hover:scale-105`}>
    <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" fill="rgba(56,249,151,0.12)" stroke="#38F997" strokeWidth="1.5" />
    <polygon points="18,9 27,13.5 27,22.5 18,27 9,22.5 9,13.5" fill="#38F997" fillOpacity="0.3" stroke="#38F997" strokeWidth="1" />
    <circle cx="18" cy="18" r="2.5" fill="#FBEDE0" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" />
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
  </svg>
);

export const LandingNav: React.FC<{ onSignIn: (destination?: LandingDestination) => void }> = ({ onSignIn }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  const links: Array<{ label: string; view: ViewName }> = [{ label: 'Overview', view: 'dashboard' }, { label: 'Ask TradeSense', view: 'chat' }, { label: 'AI reasoning', view: 'analysis' }, { label: 'Paper portfolio', view: 'portfolio' }, { label: 'Decision history', view: 'history' }];
  const openSignIn = (destination?: LandingDestination) => { setMobileMenuOpen(false); onSignIn(destination); };
  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-50 border-b transition-all duration-300 ease-out ${scrolled ? 'bg-[#0C0E17]/80 backdrop-blur-xl border-[rgba(251,237,224,0.12)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-3.5 sm:py-4 px-6 sm:px-12' : 'bg-transparent backdrop-blur-none border-[rgba(251,237,224,0.08)] shadow-none py-4 sm:py-5 px-6 sm:px-12'}`}>
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 group">
          <HexLogo className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="font-bold text-sm sm:text-base tracking-tight text-[#FBEDE0] group-hover:text-white transition-colors">TradeSense</span>
        </button>
        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Landing navigation">
          {links.map(({ label, view }) => <button key={view} type="button" onClick={() => openSignIn(view)} className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[rgba(251,237,224,0.72)] hover:text-[#FBEDE0] hover:bg-white/[0.08] transition-all duration-200">{label}</button>)}
        </nav>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={() => openSignIn()} className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#161926] border border-[rgba(251,237,224,0.16)] text-[#FBEDE0] hover:bg-[#1C2030] hover:border-[#38F997]/40 transition-colors"><GoogleIcon /><span>Sign in</span></button>
          <button type="button" onClick={() => openSignIn('dashboard')} className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#38F997] text-[#0C0E17] hover:bg-[#46fba1] transition-colors"><span>Launch App</span><ArrowRight className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => setMobileMenuOpen((value) => !value)} aria-label="Toggle navigation menu" className="md:hidden p-2 rounded-lg text-[rgba(251,237,224,0.8)] hover:text-[#FBEDE0] hover:bg-white/[0.08] transition-colors">{mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        </div>
      </div>
      {mobileMenuOpen && <div className="md:hidden mt-4 -mx-6 sm:-mx-12 px-6 sm:px-12 py-4 border-t border-b border-[rgba(251,237,224,0.10)] bg-[#0C0E17]/95 backdrop-blur-2xl shadow-2xl"><div className="flex flex-col space-y-1">
        {links.map(({ label, view }) => <button key={view} type="button" onClick={() => openSignIn(view)} className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-[rgba(251,237,224,0.8)] hover:text-[#FBEDE0] hover:bg-white/[0.08] transition-all flex items-center justify-between"><span>{label}</span><ArrowRight className="w-3.5 h-3.5 opacity-50" /></button>)}
        <div className="pt-2 mt-2 border-t border-[rgba(251,237,224,0.10)] space-y-2"><button type="button" onClick={() => openSignIn()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#161926] border border-[rgba(251,237,224,0.16)] text-[#FBEDE0] font-semibold text-xs"><GoogleIcon /><span>Sign in with Google</span></button><button type="button" onClick={() => openSignIn('dashboard')} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#38F997] text-[#0C0E17] font-semibold text-xs"><span>Launch App</span><ArrowRight className="w-4 h-4" /></button></div>
      </div></div>}
    </header>
  );
};
