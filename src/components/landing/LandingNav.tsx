import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleIcon } from '../auth/SignInModal';

export const HexLogo: React.FC<{ className?: string }> = ({ className = 'w-[30px] h-[30px]' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-transform duration-300 group-hover:scale-105`}
  >
    <polygon
      points="18,2 34,10 34,26 18,34 2,26 2,10"
      fill="rgba(56,249,151,0.12)"
      stroke="#38F997"
      strokeWidth="1.5"
    />
    <polygon
      points="18,9 27,13.5 27,22.5 18,27 9,22.5 9,13.5"
      fill="#38F997"
      fillOpacity="0.3"
      stroke="#38F997"
      strokeWidth="1"
    />
    <circle cx="18" cy="18" r="2.5" fill="#FBEDE0" />
  </svg>
);

export const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut, openAuthModal } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      // Transition from transparent hero navbar to full-width frosted glass navbar on scroll
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/markets', label: 'Markets' },
    { to: '/analysis', label: 'Analysis' },
    { to: '/portfolio', label: 'Portfolio' },
    { to: '/history', label: 'Audit History' },
  ];

  const handleLaunchApp = (e: React.MouseEvent, route = '/dashboard') => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate(route);
    } else {
      openAuthModal(
        'Please sign in with Google first to receive your Unique Trader ID and access the terminal.',
        route
      );
    }
  };

  const handleNavClick = (e: React.MouseEvent, to: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openAuthModal(
        `Please sign in with Google first to access ${to.replace('/', '')}.`,
        to
      );
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 border-b transition-all duration-300 ease-out ${
        scrolled
          ? 'bg-[#0C0E17]/80 backdrop-blur-xl border-[rgba(251,237,224,0.12)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-3.5 sm:py-4 px-6 sm:px-12'
          : 'bg-transparent backdrop-blur-none border-[rgba(251,237,224,0.08)] shadow-none py-4 sm:py-5 px-6 sm:px-12'
      }`}
    >
      {/* Content Container (AgentPay style full-width layout) */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <HexLogo className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="font-bold text-sm sm:text-base tracking-tight text-[#FBEDE0] group-hover:text-white transition-colors">
            TradeSense
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={(e) => handleNavClick(e, link.to)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[rgba(251,237,224,0.72)] hover:text-[#FBEDE0] hover:bg-white/[0.08] active:bg-white/[0.12] transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action / CTA & Mobile Hamburger */}
        <div className="flex items-center gap-2.5">
          {/* User Status / Sign In Option */}
          {isAuthenticated && user ? (
            <div className="hidden sm:flex items-center gap-2">
              {/* Unique ID Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161926] border border-[#38F997]/30 text-[11px] font-mono text-[#38F997] shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38F997] animate-pulse" />
                <span className="font-bold">{user.id}</span>
              </div>

              {/* User Avatar & Sign Out */}
              <div className="flex items-center gap-1.5 pl-1">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full bg-[#161926] border border-[rgba(251,237,224,0.2)] object-cover"
                />
                <button
                  type="button"
                  onClick={signOut}
                  title="Sign out of TradeSense"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                openAuthModal(
                  'Sign in with Google to receive your Unique Trader ID and access the terminal.'
                )
              }
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#161926] border border-[rgba(251,237,224,0.16)] text-[#FBEDE0] hover:bg-[#1C2030] hover:border-[#38F997]/40 transition-colors"
            >
              <GoogleIcon className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </button>
          )}

          {/* Launch App Button (Guarded) */}
          <button
            type="button"
            onClick={(e) => handleLaunchApp(e)}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#38F997] text-[#0C0E17] hover:bg-[#46fba1] transition-colors cursor-pointer"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-[rgba(251,237,224,0.8)] hover:text-[#FBEDE0] hover:bg-white/[0.08] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Animated Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 -mx-6 sm:-mx-12 px-6 sm:px-12 py-4 border-t border-b border-[rgba(251,237,224,0.10)] bg-[#0C0E17]/95 backdrop-blur-2xl shadow-2xl">
          <div className="flex flex-col space-y-1">
            {/* Authenticated user pill in mobile */}
            {isAuthenticated && user && (
              <div className="p-3 mb-2 rounded-xl bg-[#161926] border border-[#38F997]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full bg-[#10131F]" />
                  <div>
                    <p className="text-xs font-semibold text-[#FBEDE0]">{user.name}</p>
                    <p className="text-[10px] font-mono text-[#38F997] font-bold">{user.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  Sign Out
                </button>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNavClick(e, link.to);
                }}
                className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-[rgba(251,237,224,0.8)] hover:text-[#FBEDE0] hover:bg-white/[0.08] transition-all duration-150 flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-50" />
              </Link>
            ))}

            <div className="pt-2 mt-2 border-t border-[rgba(251,237,224,0.10)] space-y-2">
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal(
                      'Sign in with Google to receive your Unique Trader ID and access the terminal.'
                    );
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#161926] border border-[rgba(251,237,224,0.16)] text-[#FBEDE0] font-semibold text-xs"
                >
                  <GoogleIcon className="w-4 h-4" />
                  <span>Sign in with Google</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleLaunchApp(e);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#38F997] text-[#0C0E17] font-semibold text-xs hover:bg-[#46fba1] transition-colors"
              >
                <span>Launch App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNav;
