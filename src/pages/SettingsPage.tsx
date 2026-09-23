import React, { useState } from 'react';
import { Settings, Shield, Sliders, Database, Check, Save } from 'lucide-react';
import { DataModeBadge } from '../components/common/DataModeBadge';

export const SettingsPage: React.FC = () => {
  const [dataMode, setDataMode] = useState<'LIVE' | 'FIXTURE'>('FIXTURE');
  const [startingCash, setStartingCash] = useState(10000);
  const [maxBuyEquity, setMaxBuyEquity] = useState(5);
  const [maxExposure, setMaxExposure] = useState(20);
  const [feeBps, setFeeBps] = useState(10);
  const [slippageBps, setSlippageBps] = useState(10);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#4ce07a]" />
            Platform & Simulation Settings
          </h1>
          <p className="text-xs text-[#8F9CAE] font-mono mt-1">
            Configure paper trading constraints, data modes, and autonomous guardrails
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-ryo-gradient text-[#050806] font-bold text-xs rounded-xl shadow-ryo-sm hover:opacity-90 transition-all duration-200 cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4 text-[#050806]" /> : <Save className="w-4 h-4 text-[#050806]" />}
          <span>{saved ? 'Settings Saved' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Section 1: Data Mode */}
      <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Data Operating Mode
            </h3>
            <p className="text-xs text-[#8F9CAE] font-mono">
              In accordance with AGENTS.md, FIXTURE mode prevents accidental external dependencies.
            </p>
          </div>
          <DataModeBadge
            mode={dataMode}
            interactive
            onToggle={() => setDataMode(prev => (prev === 'FIXTURE' ? 'LIVE' : 'FIXTURE'))}
          />
        </div>

        <div className="p-3.5 bg-[#15171C] rounded-xl border border-white/[0.06] text-xs font-mono text-[#8F9CAE]">
          Current status: <strong className="text-[#4ce07a] font-semibold">{dataMode} MODE</strong> — Synthetic evidence and paper simulation active.
        </div>
      </div>

      {/* Section 2: Deterministic Simulation Constraints */}
      <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#4ce07a]" />
          Simulation Policy Guardrails (README Defaults)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1.5">
            <label className="text-[#8F9CAE] block">Starting Cash (Virtual USD)</label>
            <input
              type="number"
              value={startingCash}
              onChange={e => setStartingCash(Number(e.target.value))}
              className="w-full bg-[#15171C] border border-white/[0.08] rounded-xl p-2.5 text-white font-bold focus:border-[#4ce07a] focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-[#5E6A7D]">Proposed default: $10,000 USD</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#8F9CAE] block">Max BUY Equity % (Per Trade)</label>
            <input
              type="number"
              value={maxBuyEquity}
              onChange={e => setMaxBuyEquity(Number(e.target.value))}
              className="w-full bg-[#15171C] border border-white/[0.08] rounded-xl p-2.5 text-white font-bold focus:border-[#4ce07a] focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-[#5E6A7D]">Default: 5% (500 bps)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#8F9CAE] block">Max Token Exposure Cap %</label>
            <input
              type="number"
              value={maxExposure}
              onChange={e => setMaxExposure(Number(e.target.value))}
              className="w-full bg-[#15171C] border border-white/[0.08] rounded-xl p-2.5 text-white font-bold focus:border-[#4ce07a] focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-[#5E6A7D]">Default: 20% (2000 bps)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#8F9CAE] block">Execution Fee BPS</label>
            <input
              type="number"
              value={feeBps}
              onChange={e => setFeeBps(Number(e.target.value))}
              className="w-full bg-[#15171C] border border-white/[0.08] rounded-xl p-2.5 text-white font-bold focus:border-[#4ce07a] focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-[#5E6A7D]">Default: 10 bps (0.10%)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#8F9CAE] block">Adverse Slippage BPS</label>
            <input
              type="number"
              value={slippageBps}
              onChange={e => setSlippageBps(Number(e.target.value))}
              className="w-full bg-[#15171C] border border-white/[0.08] rounded-xl p-2.5 text-white font-bold focus:border-[#4ce07a] focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-[#5E6A7D]">Default: 10 bps (0.10%)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#8F9CAE] block">Max Quote Freshness</label>
            <input
              type="text"
              disabled
              value="60 Seconds"
              className="w-full bg-[#15171C] border border-white/[0.04] rounded-xl p-2.5 text-[#5E6A7D] cursor-not-allowed"
            />
            <span className="text-[10px] text-[#5E6A7D]">Enforced by policy invariants</span>
          </div>
        </div>
      </div>

      {/* Section 3: Future API Endpoints Boundary */}
      <div className="bg-[#1E222B] border border-white/[0.06] rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
          <Database className="w-4 h-4 text-[#4ce07a]" />
          Future Backend API Integration Boundaries
        </h3>
        <p className="text-xs text-[#8F9CAE] font-mono">
          The frontend is pre-wired with typed mock services that cleanly map to future endpoints:
        </p>

        <div className="space-y-1.5 text-xs font-mono bg-[#15171C] p-4 rounded-xl border border-white/[0.06] text-[#8F9CAE]">
          <div><code className="text-[#4ce07a] font-bold">GET  /api/market</code> — Fetch current market snapshot</div>
          <div><code className="text-[#4ce07a] font-bold">POST /api/runs</code> — Enqueue research run with idempotency key</div>
          <div><code className="text-[#4ce07a] font-bold">GET  /api/portfolio</code> — Fetch authenticated paper portfolio</div>
          <div><code className="text-[#4ce07a] font-bold">GET  /api/history</code> — Query paginated decision audit trail</div>
          <div><code className="text-[#4ce07a] font-bold">POST /api/schedules</code> — Configure recurring autonomous worker</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
