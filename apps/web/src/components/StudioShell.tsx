import { BarChart3, Bot, BrainCircuit, History, LayoutDashboard, Menu, MessageSquare, Settings, Wallet, X } from "lucide-react";
import type { Health, Portfolio, ViewName } from "../types";

const nav: Array<{ view: ViewName; label: string; icon: typeof LayoutDashboard }> = [
  { view: "dashboard", label: "Overview", icon: LayoutDashboard },
  { view: "chat", label: "Ask TradeSense", icon: MessageSquare },
  { view: "analysis", label: "AI reasoning", icon: BrainCircuit },
  { view: "portfolio", label: "Paper portfolio", icon: Wallet },
  { view: "history", label: "Decision history", icon: History },
];

export function StudioShell({ children, view, onView, portfolio, health, mobileOpen, setMobileOpen }: {
  children: React.ReactNode; view: ViewName; onView: (view: ViewName) => void; portfolio: Portfolio | null; health: Health | null;
  mobileOpen: boolean; setMobileOpen: (open: boolean) => void;
}) {
  const navigation = <>
    <button className="brand brand-button" onClick={() => onView("dashboard")}><span className="brand-mark">TS</span><span>TradeSense<small>RESEARCH WORKSPACE</small></span></button>
    <nav className="studio-nav" aria-label="Main navigation">
      <p>WORKSPACE</p>
      {nav.slice(0, 3).map(({ view: item, label, icon: Icon }) => <button key={item} className={view === item ? "nav-item active" : "nav-item"} onClick={() => { onView(item); setMobileOpen(false); }}><Icon size={18} /><span>{label}</span>{item === "chat" && <small>AI</small>}</button>)}
      <p>YOUR RECORDS</p>
      {nav.slice(3).map(({ view: item, label, icon: Icon }) => <button key={item} className={view === item ? "nav-item active" : "nav-item"} onClick={() => { onView(item); setMobileOpen(false); }}><Icon size={18} /><span>{label}</span></button>)}
    </nav>
    <div className="sidebar-bottom">
      <div className="explore-card"><small>ROOM TO EXPLORE</small><strong>Real curiosity.<br />Virtual money.</strong><p>Explore evidence and practice decisions without placing a real trade.</p></div>
      <div className="nav-item static"><Settings size={18} /><span>Server policy</span></div>
      <div className="demo-user"><span className="avatar"><Bot size={17} /></span><span><strong>Demo trader</strong><small>Practice account</small></span></div>
    </div>
  </>;

  return <div className="studio-app">
    <a href="#workspace-main" className="skip-link">Skip to content</a>
    <aside className="sidebar desktop-sidebar">{navigation}</aside>
    {mobileOpen && <div className="mobile-overlay"><button aria-label="Close navigation" className="mobile-backdrop" onClick={() => setMobileOpen(false)} /><aside className="sidebar mobile-sidebar"><button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></button>{navigation}</aside></div>}
    <div className="workspace">
      <header className="topbar">
        <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></button>
        <div><p>Hi, Demo trader!</p><span>Evidence-linked paper research</span></div>
        <div className="topbar-status"><span className={`mode-badge ${portfolio?.mode ?? "loading"}`}><i />{portfolio?.mode?.toUpperCase() ?? "LOADING"}</span><span className="worker-pill">{health?.schedulerEnabled ? "WORKER ON" : "WORKER OFF"}</span></div>
      </header>
      <main id="workspace-main" tabIndex={-1} className="workspace-main">{children}</main>
      <nav className="mobile-bottom" aria-label="Mobile navigation">{nav.slice(0, 5).map(({ view: item, label, icon: Icon }) => <button key={item} className={view === item ? "active" : ""} onClick={() => onView(item)}><Icon /><span>{label.split(" ")[0]}</span></button>)}</nav>
    </div>
  </div>;
}

export function PageIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return <header className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}<span>.</span></h1><p>{description}</p></div>{children && <div className="page-actions">{children}</div>}</header>;
}

export function EmptyPanel({ icon: Icon = BarChart3, title, text }: { icon?: typeof BarChart3; title: string; text: string }) {
  return <div className="empty-panel"><span><Icon /></span><h3>{title}</h3><p>{text}</p></div>;
}
