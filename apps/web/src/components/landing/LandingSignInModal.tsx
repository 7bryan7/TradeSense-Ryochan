import React, { useEffect } from 'react';
import { KeyRound, Lock, ShieldCheck, X } from 'lucide-react';
import type { GoogleUser } from '../../auth';
import { GoogleSignIn } from '../GoogleSignIn';
import type { LandingDestination } from './LandingNav';

export const LandingSignInModal: React.FC<{ open: boolean; clientId: string; destination: LandingDestination; onClose: () => void; onSignedIn: (user: GoogleUser) => void }> = ({ open, clientId, destination, onClose, onSignedIn }) => {
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="landing-auth-title">
    <button type="button" aria-label="Close sign-in dialog" className="fixed inset-0 bg-[#0C0E17]/85 backdrop-blur-md" onClick={onClose} />
    <div className="relative z-10 w-full max-w-md bg-[#10131F] border border-[rgba(251,237,224,0.14)] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8),0_0_32px_rgba(56,249,151,0.08)] overflow-hidden animate-fade-up">
      <div className="h-1 w-full bg-gradient-to-r from-[#00D2FF] via-[#38F997] to-[#A855F7]" />
      <div className="p-6 pb-4 flex items-start justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#161926] border border-[rgba(251,237,224,0.12)] flex items-center justify-center"><KeyRound className="w-5 h-5 text-[#38F997]" /></div><div><h3 id="landing-auth-title" className="font-bold text-base text-[#FBEDE0] flex items-center gap-2">Authentication Required<span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#38F997]/15 text-[#38F997] border border-[#38F997]/30">GOOGLE</span></h3><p className="text-xs font-mono text-[rgba(251,237,224,0.55)] mt-0.5">Google Identity Services · frontend entry</p></div></div><button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5" aria-label="Close modal"><X className="w-5 h-5" /></button></div>
      <div className="px-6 py-2"><div className="p-3.5 rounded-xl bg-[#161926]/90 border border-[rgba(251,237,224,0.08)] flex items-start gap-3 text-xs text-[rgba(251,237,224,0.8)] leading-relaxed"><ShieldCheck className="w-4 h-4 text-[#00D2FF] shrink-0 mt-0.5" /><div><p className="font-medium text-[#FBEDE0] mb-0.5">Research workspace access</p><p className="text-[11px] text-[rgba(251,237,224,0.65)]">Continue to {destination === 'candidates' ? 'market candidates' : destination === 'dashboard' ? 'the overview' : destination.replaceAll('_', ' ')} after entry.</p></div></div></div>
      <div className="p-6 pt-4 space-y-4">
        <GoogleSignIn clientId={clientId} onSuccess={(user) => { onClose(); onSignedIn(user); }} />
        <div className="pt-3 border-t border-[rgba(251,237,224,0.08)] flex items-center justify-between text-[10px] font-mono text-[rgba(251,237,224,0.45)]"><span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-[#38F997]" />Credential not stored</span><span>Paper-only workspace</span></div>
      </div>
    </div>
  </div>;
};
