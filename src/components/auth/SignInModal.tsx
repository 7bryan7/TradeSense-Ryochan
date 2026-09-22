import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, HACKER_JOSE_USER } from '../../context/AuthContext';
import {
  ShieldCheck,
  X,
  Lock,
  ArrowRight,
  Loader2,
  KeyRound,
  Settings2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const SignInModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMessage,
    signInWithGoogle,
    signInAsHackerJose,
    isAuthenticating,
    targetRoute,
    googleClientId,
    setGoogleClientId,
  } = useAuth();
  const navigate = useNavigate();

  const [showConfig, setShowConfig] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(googleClientId);
  const [configSaved, setConfigSaved] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleClick = async () => {
    try {
      await signInWithGoogle();
      navigate(targetRoute || '/dashboard');
    } catch {
      // Handled in context
    }
  };

  const handleHackerJoseClick = () => {
    signInAsHackerJose();
    navigate(targetRoute || '/dashboard');
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleClientId(clientIdInput);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0C0E17]/85 backdrop-blur-md transition-opacity duration-300"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-md bg-[#10131F] border border-[rgba(251,237,224,0.14)] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8),0_0_32px_rgba(56,249,151,0.08)] overflow-hidden animate-fade-up">
        {/* Subtle accent glow line at the top */}
        <div className="h-1 w-full bg-gradient-to-r from-[#00D2FF] via-[#38F997] to-[#A855F7]" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#161926] border border-[rgba(251,237,224,0.12)] flex items-center justify-center text-[#38F997] shadow-inner">
              <KeyRound className="w-5 h-5 text-[#38F997]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#FBEDE0] flex items-center gap-2">
                Authentication Required
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#38F997]/15 text-[#38F997] font-semibold border border-[#38F997]/30">
                  UNIQUE ID
                </span>
              </h3>
              <p className="text-xs font-mono text-[rgba(251,237,224,0.55)] mt-0.5">
                Google Cloud Console Auth • Direct Frontend
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Callout Banner */}
        <div className="px-6 py-2">
          <div className="p-3.5 rounded-xl bg-[#161926]/90 border border-[rgba(251,237,224,0.08)] flex items-start gap-3 text-xs text-[rgba(251,237,224,0.8)] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-[#00D2FF] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#FBEDE0] mb-0.5">Terminal Access Gate</p>
              <p className="text-[11px] text-[rgba(251,237,224,0.65)]">
                {authModalMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 pt-4 space-y-3.5">
          {/* Main Google Cloud Sign-In Button */}
          <button
            type="button"
            disabled={isAuthenticating}
            onClick={handleGoogleClick}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-[#FBEDE0] text-[#0C0E17] font-semibold text-sm hover:bg-white active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#0C0E17]" />
                <span>Authenticating with Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-5 h-5 shrink-0" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Quick Fallback Profile Button (HackerJose25 + Zenitsu Avatar) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleHackerJoseClick}
              className="w-full p-3 rounded-xl bg-[#161926] border border-[#38F997]/30 hover:border-[#38F997]/60 hover:bg-[#1C2030] transition-all flex items-center justify-between group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <img
                  src={HACKER_JOSE_USER.avatar}
                  alt="HackerJose25 Profile Pic"
                  className="w-9 h-9 rounded-full object-cover border border-[#38F997] shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#FBEDE0]">
                      {HACKER_JOSE_USER.name}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-sm bg-[#38F997]/20 text-[#38F997] font-semibold">
                      DEV AUTH
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[rgba(251,237,224,0.55)]">
                    {HACKER_JOSE_USER.id} • {HACKER_JOSE_USER.email}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#38F997] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Optional Google Cloud Console Client ID accordion */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="w-full flex items-center justify-center gap-1.5 text-center text-[11px] text-[rgba(251,237,224,0.5)] hover:text-[#00D2FF] transition-colors py-1 font-mono cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>
                {showConfig
                  ? 'Hide Google Cloud Console Settings'
                  : 'Configure Google Cloud Console Client ID'}
              </span>
            </button>

            {showConfig && (
              <form onSubmit={handleSaveClientId} className="space-y-2.5 pt-2">
                <div className="p-3 rounded-xl bg-[#161926]/90 border border-[rgba(251,237,224,0.12)] space-y-2">
                  <label className="block text-[11px] font-mono text-[rgba(251,237,224,0.7)]">
                    Google OAuth 2.0 Client ID:
                  </label>
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="xxxx-xxxx.apps.googleusercontent.com"
                    className="w-full px-3 py-2 rounded-lg bg-[#10131F] border border-[rgba(251,237,224,0.15)] text-xs font-mono text-[#FBEDE0] placeholder:text-[rgba(251,237,224,0.3)] focus:outline-hidden focus:border-[#00D2FF]"
                  />
                  <p className="text-[10px] text-[rgba(251,237,224,0.45)] leading-tight">
                    Obtained from Google Cloud Console &gt; APIs &amp; Services &gt; Credentials.
                    Your real profile pic will be loaded automatically!
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-[#00D2FF] text-[#0C0E17] font-semibold text-xs hover:bg-[#33dbff] transition-colors cursor-pointer"
                    >
                      Save Client ID
                    </button>
                    {configSaved && (
                      <span className="text-[11px] text-[#38F997] flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                      </span>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Identity & Unique ID explanation footer */}
          <div className="pt-3 border-t border-[rgba(251,237,224,0.08)] flex items-center justify-between text-[10px] font-mono text-[rgba(251,237,224,0.45)]">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#38F997]" />
              Persistent session
            </span>
            <span>Cryptographic Unique Trader ID</span>
          </div>
        </div>
      </div>
    </div>
  );
};
