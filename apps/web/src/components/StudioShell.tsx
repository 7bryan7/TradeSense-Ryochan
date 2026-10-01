import { Bot, BrainCircuit, History, Keyboard, LayoutDashboard, Menu, MessageSquare, Settings, Wallet, X } from "lucide-react";
import type { Health, Portfolio, ViewName } from "../types";

const nav: Array<{ view: ViewName; label: string; icon: typeof LayoutDashboard }> = [
  { view: "dashboard", label: "Overview", icon: LayoutDashboard },
  { view: "chat", label: "Ask TradeSense", icon: MessageSquare },
  { view: "analysis", label: "AI reasoning", icon: BrainCircuit },
  { view: "portfolio", label: "Paper portfolio", icon: Wallet },
  { view: "history", label: "Decision history", icon: History },
];

export function StudioShell({ children, view, onView, viewHref, onShortcuts, portfolio, health, mobileOpen, setMobileOpen }: {
  children: React.ReactNode; view: ViewName; onView: (view: ViewName) => void; viewHref: (view: ViewName) => string; portfolio: Portfolio | null; health: Health | null;
  onShortcuts: () => void; mobileOpen: boolean; setMobileOpen: (open: boolean) => void;
}) {
  const followViewLink = (event: React.MouseEvent<HTMLAnchorElement>, nextView: ViewName) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onView(nextView);
    setMobileOpen(false);
  };
  const navigation = <>
    <a className="brand brand-button" href={viewHref("dashboard")} onClick={(event) => followViewLink(event, "dashboard")}><span className="brand-mark">TS</span><span>TradeSense<small>RESEARCH WORKSPACE</small></span></a>
    <nav className="studio-nav" aria-label="Main navigation">
      <p>WORKSPACE</p>
      {nav.slice(0, 3).map(({ view: item, label, icon: Icon }) => <a key={item} href={viewHref(item)} aria-current={view === item ? "page" : undefined} className={view === item ? "nav-item active" : "nav-item"} onClick={(event) => followViewLink(event, item)}><Icon size={18} /><span>{label}</span>{item === "chat" && <small>AI</small>}</a>)}
      <p>YOUR RECORDS</p>
      {nav.slice(3).map(({ view: item, label, icon: Icon }) => <a key={item} href={viewHref(item)} aria-current={view === item ? "page" : undefined} className={view === item ? "nav-item active" : "nav-item"} onClick={(event) => followViewLink(event, item)}><Icon size={18} /><span>{label}</span></a>)}
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
        <div className="topbar-status"><button type="button" className="icon-button shortcut-button" onClick={onShortcuts} aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)"><Keyboard /><span className="sr-only">Keyboard shortcuts</span></button><span className={`mode-badge ${portfolio?.mode ?? "loading"}`}><i />{portfolio?.mode?.toUpperCase() ?? "LOADING"}</span><span className="worker-pill">{health?.schedulerEnabled ? "WORKER ON" : "WORKER OFF"}</span></div>
      </header>
      <main id="workspace-main" tabIndex={-1} className="workspace-main">{children}</main>
      <nav className="mobile-bottom" aria-label="Mobile navigation">{nav.slice(0, 5).map(({ view: item, label, icon: Icon }) => <a key={item} href={viewHref(item)} aria-current={view === item ? "page" : undefined} className={view === item ? "active" : ""} onClick={(event) => followViewLink(event, item)}><Icon /><span>{label.split(" ")[0]}</span></a>)}</nav>
    </div>
  </div>;
}

export function PageIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return <header className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}<span>.</span></h1><p>{description}</p></div>{children && <div className="page-actions">{children}</div>}</header>;
}
