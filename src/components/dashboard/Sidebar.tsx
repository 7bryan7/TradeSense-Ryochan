import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, BarChart3, BrainCircuit, Wallet, History, Bookmark, Settings, LogOut, MessageSquareCode, Layers, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const groups = [
    { title: 'WORKSPACE', items: [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/chat', label: 'Ask TradeSense', icon: MessageSquareCode },
      { to: '/analysis', label: 'AI reasoning', icon: BrainCircuit },
    ] },
    { title: 'YOUR MARKETS', items: [
      { to: '/markets', label: 'Markets', icon: BarChart3 },
      { to: '/watchlist', label: 'Watchlist', icon: Bookmark },
      { to: '/portfolio', label: 'Paper portfolio', icon: Wallet },
      { to: '/history', label: 'Decision history', icon: History },
    ] },
  ];
  return (
    <aside className="studio-sidebar">
      <Link to="/" className="studio-brand"><span className="studio-brand-mark"><Layers size={21} /></span><span>TradeSense<small>RESEARCH WORKSPACE</small></span></Link>
      <nav aria-label="Main navigation" className="studio-navigation">
        {groups.map(group => <div className="studio-nav-group" key={group.title}><p>{group.title}</p>{group.items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `studio-nav-link ${isActive ? 'is-active' : ''}`}><Icon size={18} /><span>{label}</span>{to === '/chat' && <small>AI</small>}</NavLink>)}</div>)}
      </nav>
      <div className="studio-sidebar-bottom">
        <div className="studio-demo-card"><span className="studio-eyebrow">ROOM TO EXPLORE</span><strong>Real curiosity.<br />Virtual money.</strong><p>Explore sample signals without placing a real trade.</p><Link to="/dashboard">Open your workspace <ArrowUpRight size={14} /></Link></div>
        <NavLink to="/settings" className={({ isActive }) => `studio-nav-link ${isActive ? 'is-active' : ''}`}><Settings size={18} />Settings</NavLink>
        <div className="studio-user">{user?.avatar && <img src={user.avatar} alt="" />}<span><strong>{user?.name || 'Demo trader'}</strong><small>Practice account</small></span><button type="button" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button></div>
      </div>
    </aside>
  );
};
export default Sidebar;
