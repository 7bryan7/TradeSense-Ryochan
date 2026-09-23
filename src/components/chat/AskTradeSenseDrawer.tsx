import React, { useEffect } from 'react';
import { AskTradeSensePanel } from './AskTradeSensePanel';
import { X, Sparkles } from 'lucide-react';

interface AskTradeSenseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const AskTradeSenseDrawer: React.FC<AskTradeSenseDrawerProps> = ({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  // ESC listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-up">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl bg-[#15171C] border-l border-white/[0.08] shadow-2xl flex flex-col relative">
          {/* Close Action in top right */}
          <button
            type="button"
            onClick={onClose}
            title="Close Drawer (Esc)"
            className="absolute top-4 right-4 z-50 p-2 rounded-xl bg-[#1E222B] text-[#8F9CAE] hover:text-white hover:bg-white/10 border border-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Embedded Panel */}
          <div className="flex-1 overflow-hidden flex flex-col pt-1">
            <AskTradeSensePanel
              initialPrompt={initialPrompt}
              onCloseDrawer={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskTradeSenseDrawer;
