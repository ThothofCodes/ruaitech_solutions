// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Spinner } from '../../components/UI';
import RuaiTechLogo from '../../components/Logo';
import NotificationBell from './NotificationBell';

const DEPT_LINKS = {
  internet:     [['Overview','◈',''],[' ISP Clients','◉','/clients'],[' Transactions','◆','/transactions']],
  webdev:       [['Overview','◈',''],[' Projects','◫','/projects'],[' Transactions','◆','/transactions']],
  playstation:  [['Overview','◈',''],[' Sessions','◷','/sessions'],[' Transactions','◆','/transactions']],
  repair:       [['Overview','◈',''],[' Job Cards','◧','/jobcards'],[' Transactions','◆','/transactions']],
  cybersecurity:[['Overview','◈',''],[' Contracts','◉','/contracts'],[' Transactions','◆','/transactions']],
  govadmin:     [['Overview','◈',''],[' Documents','◫','/govdocs'],[' Transactions','◆','/transactions']],
};

const COMMON_LINKS = [
  ['CRM','◉','/crm'],
  ['Billing','◆','/billing'],
  ['Inventory','◈','/inventory'],
  ['Tickets','◧','/tickets'],
  ['Staff Portal','◫','/staff-portal'],
  ['Staff Accounts','◉','/staff'],
  ['Expenses','◆','/expenses'],
  ['Audit Log','◈','/audit'],
  ['Settings','◉','/settings'],
];

const DEPT_COLORS = {
  internet: '#00d4ff', webdev: '#a78bfa', playstation: '#ffd700',
  repair: '#ff8800', cybersecurity: '#ff3366', govadmin: '#00ff88',
};

export default function DeptLayout({ slug, title }) {
  const { user, loading, logout, isSuperAdmin } = useAdminAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/admin/login" replace />;

  // Scope check — staff can only access their own dept (super admin bypasses)
  if (!isSuperAdmin && user.departmentSlug !== slug) {
    return <Navigate to="/403" replace />;
  }

  const color = DEPT_COLORS[slug] || '#00d4ff';
  const base  = `/admin/${slug}`;
  const links = DEPT_LINKS[slug] || [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020408' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: 'linear-gradient(180deg,#060d14,#0a1628)', borderRight: '1px solid rgba(0,212,255,0.1)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 1, height: '100%', background: `linear-gradient(180deg,transparent,${color}44,transparent)`, pointerEvents: 'none' }} />

        {/* Logo */}
        <NavLink to={base} end style={{ padding: '1rem', borderBottom: `1px solid ${color}22`, display: 'block', textDecoration: 'none' }}>
          <RuaiTechLogo size={30} showText={true} textSize="12px" />
          <div style={{ fontSize: 9, color, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 6, fontWeight: 700 }}>{title}</div>
        </NavLink>

        {/* Dept links */}
        <nav style={{ flex: 1, padding: '0.5rem', marginTop: 4 }}>
          <div style={{ fontSize: 9, color: '#2a4a6a', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.4rem 0.5rem', marginBottom: 2 }}>Department</div>
          {links.map(([label, icon, path]) => (
            <NavLink key={path} to={`${base}${path}`} end={path === ''}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0.5rem 0.6rem', marginBottom: 2, borderRadius: 4,
                color: isActive ? color : '#6a8aa0', textDecoration: 'none',
                fontSize: 11, fontWeight: isActive ? 700 : 400,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                background: isActive ? `${color}12` : 'transparent',
                borderLeft: isActive ? `2px solid ${color}` : '2px solid transparent',
                transition: 'all 0.15s',
              })}>
              <span style={{ fontSize: 12 }}>{icon}</span>{label}
            </NavLink>
          ))}

          <div style={{ fontSize: 9, color: '#2a4a6a', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.6rem 0.5rem 0.3rem', marginTop: 8 }}>Management</div>
          {COMMON_LINKS.map(([label, icon, path]) => (
            <NavLink key={path} to={`${base}${path}`}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0.5rem 0.6rem', marginBottom: 2, borderRadius: 4,
                color: isActive ? color : '#6a8aa0', textDecoration: 'none',
                fontSize: 11, fontWeight: isActive ? 700 : 400,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                background: isActive ? `${color}12` : 'transparent',
                borderLeft: isActive ? `2px solid ${color}` : '2px solid transparent',
                transition: 'all 0.15s',
              })}>
              <span style={{ fontSize: 12 }}>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0.75rem' }}>
          <button onClick={logout} style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,51,102,0.08)', color: '#ff3366', border: '1px solid rgba(255,51,102,0.25)', borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            ⏻ Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: 52, background: 'linear-gradient(90deg,#060d14,#0a1628)', borderBottom: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color }}>
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationBell />
            <div style={{ fontSize: 11, color: '#4a6580' }}>
              {user.name} · <span style={{ color }}>{user.role}</span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
