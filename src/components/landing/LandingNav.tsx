import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';

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
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[rgba(251,237,224,0.72)] hover:text-[#FBEDE0] hover:bg-white/[0.08] active:bg-white/[0.12] transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action / CTA & Mobile Hamburger */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#38F997] text-[#0C0E17] hover:bg-[#46fba1] transition-colors"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

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
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-[rgba(251,237,224,0.8)] hover:text-[#FBEDE0] hover:bg-white/[0.08] transition-all duration-150 flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-50" />
              </Link>
            ))}

            <div className="pt-2 mt-2 border-t border-[rgba(251,237,224,0.10)]">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#38F997] text-[#0C0E17] font-semibold text-xs hover:bg-[#46fba1] transition-colors"
              >
                <span>Launch App</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNav;
