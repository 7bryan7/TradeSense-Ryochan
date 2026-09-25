import React, { useEffect } from 'react';
import { AskTradeSensePanel } from './AskTradeSensePanel';

interface AskTradeSenseDrawerProps {

  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  contextTokenId?: string;
}

export const AskTradeSenseDrawer: React.FC<AskTradeSenseDrawerProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  contextTokenId,
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
      {/* Translucent Frosted Backdrop (shows dashboard underneath through blur) */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Translucent Glass Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl tradesense-glass-drawer flex flex-col relative overflow-hidden h-full">

          {/* Ambient Frosted Glass Optical Refractions */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#4ce07a]/15 blur-[90px]" />
          <div className="pointer-events-none absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-[#38bdf8]/12 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 right-12 w-80 h-80 rounded-full bg-[#4ce07a]/10 blur-[100px]" />
          
          {/* Subtle Specular Left Glass Edge Accent */}
          <div className="pointer-events-none absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-white/30 via-white/10 to-transparent z-20" />

          {/* Embedded Glass Panel */}
          <div className="flex-1 overflow-hidden flex flex-col relative z-10">

            <AskTradeSensePanel
              initialPrompt={initialPrompt}
              contextTokenId={contextTokenId}
              onCloseDrawer={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskTradeSenseDrawer;
