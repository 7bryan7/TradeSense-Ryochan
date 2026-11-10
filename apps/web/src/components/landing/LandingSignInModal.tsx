import React, { useEffect } from 'react';
import { ArrowRight, KeyRound, Lock, ShieldCheck, Terminal, X } from 'lucide-react';
import { developerUser, type GoogleUser } from '../../auth';
import { GoogleSignIn } from '../GoogleSignIn';
import type { LandingDestination } from './LandingNav';

export const LandingSignInModal: React.FC<{
  open: boolean;
  clientId: string;
  destination: LandingDestination;
  onClose: () => void;
  onSignedIn: (user: GoogleUser) => void;
}> = ({ open, clientId, destination, onClose, onSignedIn }) => {
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="landing-auth-title">
      <button type="button" aria-label="Close sign-in dialog" className="fixed inset-0 bg-[#0C0E17]/85 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#10131F] border border-[rgba(251,237,224,0.14)] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8),0_0_32px_rgba(56,249,151,0.08)] overflow-hidden animate-fade-up">
        <div className="h-1 w-full bg-gradient-to-r from-[#00D2FF] via-[#38F997] to-[#A855F7]" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#161926] border border-[rgba(251,237,224,0.12)] flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-[#38F997]" />
            </div>
            <div>
              <h3 id="landing-auth-title" className="font-bold text-base text-[#FBEDE0] flex items-center gap-2">
                Sign In to TradeSense
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#38F997]/15 text-[#38F997] border border-[#38F997]/30">DEV / GOOGLE</span>
              </h3>
              <p className="text-xs font-mono text-[rgba(251,237,224,0.55)] mt-0.5">
                Frontend research workspace access
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Destination preview */}
        <div className="px-6 py-2">
          <div className="p-3.5 rounded-xl bg-[#161926]/90 border border-[rgba(251,237,224,0.08)] flex items-start gap-3 text-xs text-[rgba(251,237,224,0.8)] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-[#00D2FF] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#FBEDE0] mb-0.5">Research workspace access</p>
              <p className="text-[11px] text-[rgba(251,237,224,0.65)]">
                Continue to {destination === 'candidates' ? 'market candidates' : destination === 'dashboard' ? 'the overview' : destination.replaceAll('_', ' ')} after entry.
              </p>
            </div>
          </div>
        </div>

        {/* Auth Methods */}
        <div className="p-6 pt-3 space-y-4">
          {/* Developer Login Action */}
          <div className="p-4 rounded-xl bg-[#161926]/95 border border-[#38F997]/30 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-[#38F997] flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                Developer Login
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#38F997]/15 text-[#38F997] border border-[#38F997]/30">
                INSTANT ACCESS
              </span>
            </div>
            <p className="text-xs text-[rgba(251,237,224,0.7)] leading-relaxed">
              Open the intelligence dashboard, market overview, and AI trading simulation immediately without OAuth setup.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignedIn(developerUser);
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#38F997] to-[#00D2FF] text-[#0C0E17] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#38F997]/20 hover:shadow-[#38F997]/35 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>Enter as Developer</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-[rgba(251,237,224,0.1)] w-full" />
            <span className="bg-[#10131F] px-3 text-[10px] font-mono text-[rgba(251,237,224,0.45)] uppercase tracking-wider absolute">
              or Google Sign In
            </span>
          </div>

          {/* Google Sign In Component */}
          <div className="pt-1">
            <GoogleSignIn clientId={clientId} onSuccess={(user) => { onClose(); onSignedIn(user); }} />
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-[rgba(251,237,224,0.08)] flex items-center justify-between text-[10px] font-mono text-[rgba(251,237,224,0.45)]">
            <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-[#38F997]" />Credential not stored</span>
            <span>Paper-only workspace</span>
          </div>
        </div>
      </div>
    </div>
  );
};

