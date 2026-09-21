import React from 'react';
import { X, Keyboard, Command, Zap, Play, Flame, Layers, Database } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: 'Asset Quick-Switching',
      icon: Layers,
      items: [
        { keys: ['1'], description: 'Switch to Bitcoin (BTC/USD)' },
        { keys: ['2'], description: 'Switch to Ethereum (ETH/USD)' },
        { keys: ['3'], description: 'Switch to Solana (SOL/USD)' },
        { keys: ['4'], description: 'Switch to Avalanche (AVAX/USD)' },
        { keys: ['5'], description: 'Switch to Chainlink (LINK/USD)' },
      ],
    },
    {
      category: 'Autonomous Pipeline & Simulation',
      icon: Zap,
      items: [
        { keys: ['R'], description: 'Re-run Autonomous AI Market Analysis' },
        { keys: ['P'], description: 'Trigger Simulated 10 bps Paper Execution' },
        { keys: ['S'], description: 'Cycle Demo Scenarios (BUY, HOLD, SELL, BLOCKED)' },
        { keys: ['D'], description: 'Toggle Data Stream (LIVE L2 / FIXTURE Replay)' },
        { keys: ['V'], description: 'Toggle 30s Executive View vs Full Deep Telemetry' },
      ],
    },
    {
      category: 'Interface & Navigation',
      icon: Command,
      items: [
        { keys: ['?'], description: 'Open / Close this Keyboard Shortcuts HUD' },
        { keys: ['Esc'], description: 'Close any active modal or overlay' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-xl rounded-2xl bg-[#10131F] border border-[rgba(251,237,224,0.16)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(251,237,224,0.08)] bg-[#161926]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#38F997]/15 border border-[#38F997]/30 text-[#38F997]">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 id="shortcuts-modal-title" className="text-base font-bold text-[#FBEDE0]">
                Keyboard Shortcuts HUD
              </h3>
              <p className="text-xs font-mono text-[rgba(251,237,224,0.5)]">
                Track 02: Optimized for high-frequency keyboard operators
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[rgba(251,237,224,0.6)] hover:text-[#FBEDE0] hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto font-mono">
          {shortcutGroups.map((group, idx) => {
            const GroupIcon = group.icon;
            return (
              <div key={idx} className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#00D2FF] tracking-wider">
                  <GroupIcon className="w-3.5 h-3.5" />
                  <span>{group.category}</span>
                </div>

                <div className="space-y-1.5">
                  {group.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#161926]/60 border border-[rgba(251,237,224,0.06)] hover:bg-[#161926] transition-colors"
                    >
                      <span className="text-xs text-[rgba(251,237,224,0.85)] font-sans">
                        {item.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="min-w-[28px] h-6 px-2 flex items-center justify-center rounded-md bg-[#090B12] border border-[rgba(251,237,224,0.2)] text-xs font-mono text-[#38F997] shadow-sm"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0C0E17] border-t border-[rgba(251,237,224,0.08)] flex items-center justify-between text-xs text-[rgba(251,237,224,0.5)] font-mono">
          <span>Press any highlighted key to activate instantaneously</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-[rgba(251,237,224,0.08)] hover:bg-[rgba(251,237,224,0.14)] text-[#FBEDE0] font-bold text-xs"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
