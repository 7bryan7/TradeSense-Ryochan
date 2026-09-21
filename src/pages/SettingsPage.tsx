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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(251,237,224,0.08)]">
        <div>
          <h1 className="text-2xl font-bold text-[#FBEDE0] tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#00D2FF]" />
            Platform & Simulation Settings
          </h1>
          <p className="text-xs text-[rgba(251,237,224,0.6)] font-mono mt-1">
            Configure paper trading constraints, data modes, and autonomous guardrails
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FBEDE0] hover:bg-white text-[#161823] font-bold text-xs rounded-full shadow-lg transition-all duration-200 cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4 text-[#161823]" /> : <Save className="w-4 h-4 text-[#161823]" />}
          <span>{saved ? 'Settings Saved' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Section 1: Data Mode */}
      <div className="bg-[#161926]/90 border border-[rgba(251,237,224,0.10)] rounded-2xl p-5 shadow-panel space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#FBEDE0] font-mono uppercase">
              Data Operating Mode
            </h3>
            <p className="text-xs text-[rgba(251,237,224,0.6)] font-mono">
              In accordance with AGENTS.md, FIXTURE mode prevents accidental external dependencies.
            </p>
          </div>
          <DataModeBadge
            mode={dataMode}
            interactive
            onToggle={() => setDataMode(prev => (prev === 'FIXTURE' ? 'LIVE' : 'FIXTURE'))}
          />
        </div>

        <div className="p-3.5 bg-[#10131F] rounded-xl border border-[rgba(251,237,224,0.08)] text-xs font-mono text-[rgba(251,237,224,0.7)]">
          Current status: <strong className="text-[#00D2FF] font-semibold">{dataMode} MODE</strong> — Synthetic evidence and paper simulation active.
        </div>
      </div>

      {/* Section 2: Deterministic Simulation Constraints */}
      <div className="bg-[#161926]/90 border border-[rgba(251,237,224,0.10)] rounded-2xl p-5 shadow-panel space-y-4">
        <h3 className="text-sm font-bold text-[#FBEDE0] font-mono uppercase flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#38F997]" />
          Simulation Policy Guardrails (README Defaults)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1.5">
            <label className="text-[rgba(251,237,224,0.6)] block">Starting Cash (Virtual USD)</label>
            <input
              type="number"
              value={startingCash}
              onChange={e => setStartingCash(Number(e.target.value))}
              className="w-full bg-[#10131F] border border-[rgba(251,237,224,0.12)] rounded-xl p-2.5 text-[#FBEDE0] font-bold focus:border-[#38F997] focus:outline-none"
            />
            <span className="text-[10px] text-[rgba(251,237,224,0.4)]">Proposed default: $10,000 USD</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[rgba(251,237,224,0.6)] block">Max BUY Equity % (Per Trade)</label>
            <input
              type="number"
              value={maxBuyEquity}
              onChange={e => setMaxBuyEquity(Number(e.target.value))}
              className="w-full bg-[#10131F] border border-[rgba(251,237,224,0.12)] rounded-xl p-2.5 text-[#FBEDE0] font-bold focus:border-[#38F997] focus:outline-none"
            />
            <span className="text-[10px] text-[rgba(251,237,224,0.4)]">Default: 5% (500 bps)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[rgba(251,237,224,0.6)] block">Max Token Exposure Cap %</label>
            <input
              type="number"
              value={maxExposure}
              onChange={e => setMaxExposure(Number(e.target.value))}
              className="w-full bg-[#10131F] border border-[rgba(251,237,224,0.12)] rounded-xl p-2.5 text-[#FBEDE0] font-bold focus:border-[#38F997] focus:outline-none"
            />
            <span className="text-[10px] text-[rgba(251,237,224,0.4)]">Default: 20% (2000 bps)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[rgba(251,237,224,0.6)] block">Execution Fee BPS</label>
            <input
              type="number"
              value={feeBps}
              onChange={e => setFeeBps(Number(e.target.value))}
              className="w-full bg-[#10131F] border border-[rgba(251,237,224,0.12)] rounded-xl p-2.5 text-[#FBEDE0] font-bold focus:border-[#38F997] focus:outline-none"
            />
            <span className="text-[10px] text-[rgba(251,237,224,0.4)]">Default: 10 bps (0.10%)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[rgba(251,237,224,0.6)] block">Adverse Slippage BPS</label>
            <input
              type="number"
              value={slippageBps}
              onChange={e => setSlippageBps(Number(e.target.value))}
              className="w-full bg-[#10131F] border border-[rgba(251,237,224,0.12)] rounded-xl p-2.5 text-[#FBEDE0] font-bold focus:border-[#38F997] focus:outline-none"
            />
            <span className="text-[10px] text-[rgba(251,237,224,0.4)]">Default: 10 bps (0.10%)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[rgba(251,237,224,0.6)] block">Max Quote Freshness</label>
            <input
              type="text"
              disabled
              value="60 Seconds"
              className="w-full bg-[#10131F] border border-[rgba(251,237,224,0.08)] rounded-xl p-2.5 text-[rgba(251,237,224,0.4)] cursor-not-allowed"
            />
            <span className="text-[10px] text-[rgba(251,237,224,0.4)]">Enforced by policy invariants</span>
          </div>
        </div>
      </div>

      {/* Section 3: Future API Endpoints Boundary */}
      <div className="bg-[#161926]/90 border border-[rgba(251,237,224,0.10)] rounded-2xl p-5 shadow-panel space-y-3">
        <h3 className="text-sm font-bold text-[#FBEDE0] font-mono uppercase flex items-center gap-2">
          <Database className="w-4 h-4 text-[#00D2FF]" />
          Future Backend API Integration Boundaries
        </h3>
        <p className="text-xs text-[rgba(251,237,224,0.6)] font-mono">
          The frontend is pre-wired with typed mock services that cleanly map to future endpoints:
        </p>

        <div className="space-y-1.5 text-xs font-mono bg-[#10131F] p-4 rounded-xl border border-[rgba(251,237,224,0.08)] text-[rgba(251,237,224,0.75)]">
          <div><code className="text-[#38F997] font-bold">GET  /api/market</code> — Fetch current market snapshot</div>
          <div><code className="text-[#38F997] font-bold">POST /api/runs</code> — Enqueue research run with idempotency key</div>
          <div><code className="text-[#38F997] font-bold">GET  /api/portfolio</code> — Fetch authenticated paper portfolio</div>
          <div><code className="text-[#38F997] font-bold">GET  /api/history</code> — Query paginated decision audit trail</div>
          <div><code className="text-[#38F997] font-bold">POST /api/schedules</code> — Configure recurring autonomous worker</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
