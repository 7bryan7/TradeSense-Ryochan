import { ArrowRight, BarChart3, Bot, Database, ShieldCheck, Sparkles } from "lucide-react";

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  return <main className="landing">
    <nav className="landing-nav" aria-label="Landing navigation">
      <a className="brand" href="#top"><span className="brand-mark">TS</span><span>TradeSense<small>RYO research workspace</small></span></a>
      <div className="landing-nav-actions"><span className="paper-pill">PAPER ONLY</span><button className="button button-ghost" onClick={onEnter}>Enter demo</button></div>
    </nav>

    <section id="top" className="landing-hero">
      <div className="hero-orbit" aria-hidden="true"><span /><span /><span /></div>
      <div className="hero-copy">
        <p className="eyebrow"><Sparkles size={13} /> RYO-CHAN HACKATHON 2026</p>
        <h1>Turn market evidence into a decision you can inspect.</h1>
        <p className="hero-lede">TradeSense connects crypto research, evidence-grounded AI reasoning, deterministic paper simulation, and a clear audit trail in one practice workspace.</p>
        <div className="hero-actions">
          <button className="button button-primary button-large" onClick={onEnter}>Enter demo workspace <ArrowRight size={17} /></button>
          <span>Instant demo access · no Google account</span>
        </div>
        <div className="hero-proof"><span><i />No wallet</span><span><i />No real funds</span><span><i />Server-owned paper ledger</span></div>
      </div>
      <div className="hero-preview" aria-label="Product preview">
        <div className="preview-top"><span className="preview-dots">● ● ●</span><span>TRADE RESEARCH / FIXTURE</span></div>
        <div className="preview-grid">
          <div className="preview-chart"><div className="chart-line" /><span>Evidence timeline</span></div>
          <div className="preview-decision"><small>LATEST DECISION</small><strong>BUY</strong><p>Medium evidence confidence</p></div>
          <div className="preview-strip"><span>RYO evidence</span><span>Policy passed</span><span>Paper fill</span></div>
        </div>
      </div>
    </section>

    <section className="landing-features" aria-label="Product capabilities">
      <article><Database /><small>01 / EVIDENCE</small><h2>Research with provenance</h2><p>Keep observation time, retrieval time, tool identity, mode, coverage, and limitations attached to every claim.</p></article>
      <article><Bot /><small>02 / REASONING</small><h2>Explain the action</h2><p>Show supporting evidence, contrary evidence, missing information, risk, horizon, and invalidation.</p></article>
      <article><ShieldCheck /><small>03 / SIMULATION</small><h2>Practice under policy</h2><p>Apply fees, slippage, exposure, freshness, and balance checks without placing a real order.</p></article>
      <article><BarChart3 /><small>04 / INTERFACE</small><h2>Understand it quickly</h2><p>See what changed, what was proposed, what actually happened, and why the result matters.</p></article>
    </section>
  </main>;
}
