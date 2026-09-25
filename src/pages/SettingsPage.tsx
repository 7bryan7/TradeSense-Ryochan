import React, { useState } from 'react';
import { Check, Save, Shield, Database, SlidersHorizontal } from 'lucide-react';
import { PageIntro } from '../components/common/PageIntro';

const defaults = { startingCash: 10000, maxBuyEquity: 5, maxExposure: 20, feeBps: 10, slippageBps: 10 };
const storageKey = 'tradesense-policy-draft-v1';
type PolicyDraft = typeof defaults;
const fields: { key: keyof PolicyDraft; label: string; note: string; max: number }[] = [
  { key: 'startingCash', label: 'Starting virtual cash', note: 'USD · The sample account starts at $10,000.', max: 1000000 },
  { key: 'maxBuyEquity', label: 'Maximum buy size', note: '% of portfolio value per trade.', max: 100 },
  { key: 'maxExposure', label: 'Maximum asset exposure', note: '% of portfolio value in a single asset.', max: 100 },
  { key: 'feeBps', label: 'Trading fee', note: 'Basis points · 10 bps equals 0.10%.', max: 1000 },
  { key: 'slippageBps', label: 'Price slippage', note: 'Basis points · Models an adverse price change.', max: 1000 },
];
function validDraft(value: unknown): value is PolicyDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as PolicyDraft;
  return fields.every(field => typeof draft[field.key] === 'number' && Number.isFinite(draft[field.key]) && draft[field.key] >= (field.key === 'startingCash' ? 1 : 0) && draft[field.key] <= field.max);
}
export const SettingsPage: React.FC = () => {
  const [draft, setDraft] = useState<PolicyDraft>(() => {
    try { const saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); return validDraft(saved) ? saved : defaults; }
    catch { return defaults; }
  });
  const [message, setMessage] = useState('');
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validDraft(draft)) { setMessage('Enter a valid value in each field.'); return; }
    try { localStorage.setItem(storageKey, JSON.stringify(draft)); setMessage('Draft saved in this browser. The demo simulation is unchanged.'); }
    catch { setMessage('Browser storage is unavailable. Your draft has not been saved.'); }
  };
  return (
    <div className="studio-page">
      <PageIntro eyebrow="MAKE THE WORKSPACE YOURS" title="Settings & preferences" description="Understand the practice environment and prepare a simulation policy draft."><span className="studio-chip">Demo workspace</span></PageIntro>
      <div className="studio-settings-grid">
        <form onSubmit={save} className="dashboard-glass-card p-6 space-y-6">
          <div><h2 className="flex items-center gap-2 text-base font-semibold"><SlidersHorizontal size={18} className="text-[#4ce07a]" />Simulation policy draft</h2><p className="mt-2 text-xs leading-6 text-slate-400">Saved locally for review. These preferences do not alter sample runs or portfolio balances.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{fields.map(field => <label className="studio-field" key={field.key} htmlFor={field.key}>{field.label}<input id={field.key} type="number" required min={field.key === 'startingCash' ? 1 : 0} max={field.max} step="any" value={Number.isNaN(draft[field.key]) ? '' : draft[field.key]} onChange={event => { setDraft({ ...draft, [field.key]: event.target.value === '' ? NaN : Number(event.target.value) }); setMessage(''); }} /><small>{field.note}</small></label>)}</div>
          <div className="flex flex-wrap gap-3 border-t border-white/10 pt-5"><button type="submit" className="studio-primary"><Save size={15} />Save draft</button><button type="button" className="studio-secondary" onClick={() => { setDraft(defaults); setMessage('Default values restored. Save to keep this draft.'); }}>Restore defaults</button></div>
          <p role="status" className="text-xs leading-6 text-[#4ce07a]">{message}</p>
        </form>
        <aside className="space-y-5">
          <section className="dashboard-glass-card p-6"><h2 className="flex items-center gap-2 text-sm font-semibold"><Database size={17} className="text-sky-300" />Data connection</h2><span className="studio-chip mt-4">Sample data</span><p className="mt-4 text-sm leading-7 text-slate-400">Explore the interface with built-in fixtures. A live market connection is not configured.</p></section>
          <section className="dashboard-glass-card p-6"><h2 className="flex items-center gap-2 text-sm font-semibold"><Shield size={17} className="text-[#4ce07a]" />Practice boundaries</h2><ul className="mt-5 space-y-4 text-xs text-slate-300">{['Virtual USD only', 'No wallet or trading keys', 'No real orders or transfers', 'Draft settings stay in this browser'].map(item => <li key={item} className="flex items-center gap-2"><Check size={14} className="text-[#4ce07a]" />{item}</li>)}</ul></section>
        </aside>
      </div>
    </div>
  );
};
export default SettingsPage;
