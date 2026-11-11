import React from 'react';
import { Bell, BookOpen, ChevronRight, CircleHelp, Library, LogOut, Menu, Sparkles, X } from 'lucide-react';

export default function LibraryShell({ nav, section, onSectionChange, activeLoans, mobileNav, setMobileNav, user, onLogout, children }) {
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <a className="brand" href="#inicio" onClick={(event) => { event.preventDefault(); onSectionChange(nav[0].id); }}><span className="brand-mark"><Library size={21} strokeWidth={2.2} /></span><span className="brand-copy"><strong>página</strong><small>BIBLIOTECA</small></span></a>
      <div className="workspace"><span className="workspace-icon">C</span><span><strong>Casa de lectura</strong><small>Panel de gestión</small></span><ChevronRight size={15} /></div>
      <p className="nav-caption">MENÚ PRINCIPAL</p>
      <nav className="main-nav" aria-label="Navegación principal">{nav.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${section === id ? 'active' : ''}`} onClick={() => { onSectionChange(id); setMobileNav(false); }}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{id === 'loans' && activeLoans.length > 0 && <b className="nav-count">{activeLoans.length}</b>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="side-tip"><span className="tip-icon"><Sparkles size={16} /></span><strong>Un espacio para crecer</strong><p>Cada página leída abre una puerta nueva.</p><div className="tip-progress"><span /></div><small>Una historia a la vez</small></div>
        <div className="help-link"><CircleHelp size={17} /> Centro de ayuda <ChevronRight size={14} /></div>
        <div className="profile"><div className="avatar">{String(user.username || user.email || 'BL').slice(0, 2).toUpperCase()}</div><span><strong>{user.username || user.email}</strong><small>{user.rol}</small></span><button className="icon-button" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={onLogout}><LogOut size={16} /></button></div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu icon-button" aria-label="Abrir menú" onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X size={19} /> : <Menu size={19} />}</button><div className="breadcrumbs"><span>Biblioteca</span><ChevronRight size={14} /><strong>{nav.find((item) => item.id === section)?.label}</strong></div><div className="top-actions"><div className="connection"><span className="connection-dot" /> API protegida</div><button className="icon-button notification" aria-label="Notificaciones"><Bell size={18} /><i /></button><div className="top-avatar">{String(user.username || user.email || 'BL').slice(0, 2).toUpperCase()}</div></div></header>
      {children}
    </main>
    {mobileNav && <button className="mobile-backdrop" aria-label="Cerrar menú" onClick={() => setMobileNav(false)} />}
  </div>;
}
