import { useState } from "react";
import { BrainCircuit, History, Keyboard, LayoutDashboard, LogOut, Menu, MessageSquare, Newspaper, Settings, Wallet, X } from "lucide-react";
import type { GoogleUser } from "../auth";
import type { Health, ViewName } from "../types";
import { Modal } from "./UiPrimitives";
import { ThemeToggle } from "./ThemeToggle";

const nav: Array<{ view: ViewName; label: string; icon: typeof LayoutDashboard }> = [
  { view: "dashboard", label: "Overview", icon: LayoutDashboard },
  { view: "chat", label: "Ask TradeSense", icon: MessageSquare },
  { view: "analysis", label: "AI Reasoning", icon: BrainCircuit },
  { view: "news", label: "Market news", icon: Newspaper },
  { view: "portfolio", label: "Paper Portfolio", icon: Wallet },
  { view: "history", label: "Decision History", icon: History },
];

export function StudioShell({ children, user, onSignOut, view, onView, viewHref, onShortcuts, health, mobileOpen, setMobileOpen }: {
  children: React.ReactNode; view: ViewName; onView: (view: ViewName) => void; viewHref: (view: ViewName) => string; health: Health | null;
  user: GoogleUser; onSignOut: () => void;
  mode: "live"; onShortcuts: () => void; mobileOpen: boolean; setMobileOpen: (open: boolean) => void;
}) {
  const [policyOpen, setPolicyOpen] = useState(false);
  const followViewLink = (event: React.MouseEvent<HTMLAnchorElement>, nextView: ViewName) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onView(nextView);
    setMobileOpen(false);
  };
  const navigation = <>
    <a className="brand brand-button" href={viewHref("dashboard")} onClick={(event) => followViewLink(event, "dashboard")}><img className="brand-mark" src="/assets/brand-logo.png" alt="" /><span>TradeSense<small>RESEARCH WORKSPACE</small></span></a>
    <nav className="studio-nav" aria-label="Main navigation">
      <p>WORKSPACE</p>
      {nav.slice(0, 3).map(({ view: item, label, icon: Icon }) => <a key={item} href={viewHref(item)} aria-current={view === item ? "page" : undefined} className={view === item ? "nav-item active" : "nav-item"} onClick={(event) => followViewLink(event, item)}><Icon size={18} /><span>{label}</span>{item === "chat" && <small>AI</small>}</a>)}
      <p>YOUR RECORDS</p>
      {nav.slice(3).map(({ view: item, label, icon: Icon }) => <a key={item} href={viewHref(item)} aria-current={view === item ? "page" : undefined} className={view === item ? "nav-item active" : "nav-item"} onClick={(event) => followViewLink(event, item)}><Icon size={18} /><span>{label}</span></a>)}
    </nav>
    <div className="sidebar-bottom">
      <button type="button" className="nav-item policy-button" onClick={() => setPolicyOpen(true)}><Settings size={18} /><span>Server policy</span></button>
      <div className="demo-user"><span className="avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span><span><strong>{user.name}</strong><small title={user.email}>{user.email}</small></span><button type="button" className="signout-button" onClick={onSignOut} aria-label="Sign out"><LogOut /></button></div>
    </div>
  </>;

  return <div className="studio-app">
    <a href="#workspace-main" className="skip-link">Skip to content</a>
    <aside className="sidebar desktop-sidebar">{navigation}</aside>
    {mobileOpen && <div className="mobile-overlay"><button aria-label="Close navigation" className="mobile-backdrop" onClick={() => setMobileOpen(false)} /><aside className="sidebar mobile-sidebar"><button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></button>{navigation}</aside></div>}
    <div className="workspace">
      <header className="topbar">
        <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></button>
        <div><p>Hi, {user.name.split(/\s+/)[0]}!</p><span>Evidence-linked paper research</span></div>
        <div className="topbar-status"><ThemeToggle /><button type="button" className="icon-button shortcut-button" onClick={onShortcuts} aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)"><Keyboard /><span className="sr-only">Keyboard shortcuts</span></button><span className="mode-badge live" title="Live provider evidence; all trades are paper simulations"><i />LIVE DATA</span></div>
      </header>
      <main id="workspace-main" tabIndex={-1} className="workspace-main">{children}</main>
      <nav className="mobile-bottom" aria-label="Mobile navigation">{nav.slice(0, 5).map(({ view: item, label, icon: Icon }) => <a key={item} href={viewHref(item)} aria-current={view === item ? "page" : undefined} className={view === item ? "active" : ""} onClick={(event) => followViewLink(event, item)}><Icon /><span>{label.split(" ")[0]}</span></a>)}</nav>
    </div>
    <Modal open={policyOpen} onClose={() => setPolicyOpen(false)} title="Server paper policy" description="Authoritative runtime limits reported by this TradeSense server." size="small">
      {health?.policy ? <dl className="policy-grid"><div><dt>Starting virtual cash</dt><dd>${health.policy.initialCashUsd.toLocaleString()}</dd></div><div><dt>Paper fee</dt><dd>{health.policy.feeBps} bps</dd></div><div><dt>Adverse slippage</dt><dd>{health.policy.slippageBps} bps</dd></div><div><dt>Maximum buy</dt><dd>{health.policy.maxBuyEquityBps / 100}% of equity</dd></div><div><dt>Maximum token exposure</dt><dd>{health.policy.maxTokenExposureBps / 100}%</dd></div><div><dt>Execution quote age</dt><dd>{health.policy.maxPriceAgeSeconds} seconds</dd></div><div><dt>Trading boundary</dt><dd>Simulated only</dd></div><div><dt>Recurring worker</dt><dd>{health.schedulerEnabled ? "Enabled" : "Operator disabled"}</dd></div></dl> : <p className="muted">Loading the server policy…</p>}
    </Modal>
  </div>;
}

export function PageIntro({ eyebrow, title, description, children, className }: { eyebrow: string; title: string; description: string; children?: React.ReactNode; className?: string }) {
  return <header className={`page-intro${className ? ` ${className}` : ""}`}><div><p className="eyebrow">{eyebrow}</p><h1>{title}<span>.</span></h1><p>{description}</p></div>{children && <div className="page-actions">{children}</div>}</header>;
}
