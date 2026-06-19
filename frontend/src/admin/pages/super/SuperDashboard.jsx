// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { useEffect, useState, useCallback } from 'react';
import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../../../utils/api';
import { formatKES } from '../../../utils/helpers';
import IncomeProjectionChart from '../../components/IncomeProjectionChart';
import { Spinner } from '../../../components/UI';
import { useAdminAuth } from '../../context/AdminAuthContext';
import RuaiTechLogo from '../../../components/Logo';
import NotificationBell from '../../components/NotificationBell';
import ChatMonitor from '../../components/ChatMonitor';  // New chat monitor component
import RuaiPulseBoard from '../../../components/RuaiPulseBoard'; // Phase 9 market research, Tier 1 #4

const DEPT_COLORS = { internet:'#00d4ff', webdev:'#a78bfa', playstation:'#ffd700', repair:'#ff8800', cybersecurity:'#ff3366', govadmin:'#00ff88' };

const SUPER_LINKS = [
  ['Dashboard','◈','/admin/super'],
  ['All Departments','◉','/admin/super/departments'],
  ['User Management','◫','/admin/super/users'],
  ['Email Allocation','◆','/admin/super/email'],
  ['Finance','◆','/admin/super/finance'],
  ['All Tickets','◧','/admin/super/tickets'],
  ['Inventory Master','◈','/admin/super/inventory'],
  ['Audit Log','☰','/admin/super/audit'],
  ['Broadcast','◈','/admin/super/broadcast'],
  ['Settings','◉','/admin/super/settings'],
];

export function SuperAdminLayout() {
  const { user, loading, logout, isSuperAdmin } = useAdminAuth();
  if (loading) return <Spinner />;
  // Not logged in at all
  if (!user) return <Navigate to="/admin/login" replace />;
  // Logged in but not super admin
  if (!isSuperAdmin) return <Navigate to="/403" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020408' }}>
      <aside style={{ width: 230, background: 'linear-gradient(180deg,#060d14,#0a1628)', borderRight: '1px solid rgba(0,212,255,0.15)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 1, height: '100%', background: 'linear-gradient(180deg,transparent,rgba(0,212,255,0.5),transparent)', pointerEvents: 'none' }} />
        <NavLink to="/admin/super" end style={{ padding: '1rem', borderBottom: '1px solid rgba(0,212,255,0.15)', display: 'block', textDecoration: 'none' }}>
          <RuaiTechLogo size={32} showText={true} textSize="12px" />
          <div style={{ fontSize: 9, color: '#00d4ff', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 6, fontWeight: 700 }}>Super Admin</div>
        </NavLink>
        <nav style={{ flex: 1, padding: '0.5rem', marginTop: 4 }}>
          {SUPER_LINKS.map(([label, icon, path]) => (
            <NavLink key={path} to={path} end={path === '/admin/super'}
              style={({ isActive }) => ({ display:'flex', alignItems:'center', gap:8, padding:'0.5rem 0.6rem', marginBottom:2, borderRadius:4, color:isActive?'#00d4ff':'#6a8aa0', textDecoration:'none', fontSize:11, fontWeight:isActive?700:400, letterSpacing:'0.06em', textTransform:'uppercase', background:isActive?'rgba(0,212,255,0.1)':'transparent', borderLeft:isActive?'2px solid #00d4ff':'2px solid transparent', transition:'all 0.15s' })}>
              <span style={{ fontSize: 12 }}>{icon}</span>{label}
            </NavLink>
          ))}
          <div style={{ marginTop: 12, padding: '0.4rem 0.5rem', fontSize: 9, color: '#2a4a6a', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Departments</div>
          {Object.entries(DEPT_COLORS).map(([slug, color]) => (
            <NavLink key={slug} to={`/admin/${slug}`}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'0.4rem 0.6rem', marginBottom:2, borderRadius:4, color:'#4a6580', textDecoration:'none', fontSize:10, letterSpacing:'0.06em', textTransform:'uppercase', transition:'all 0.15s' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:color, flexShrink:0 }} />
              {slug}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '0.75rem' }}>
          <button onClick={logout} style={{ width:'100%', padding:'0.5rem', background:'rgba(255,51,102,0.08)', color:'#ff3366', border:'1px solid rgba(255,51,102,0.25)', borderRadius:4, fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>⏻ Logout</button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 52, background: 'linear-gradient(90deg,#060d14,#0a1628)', borderBottom: '1px solid rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00d4ff' }}>Ruai Tech — Command Centre</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationBell />
            <div style={{ fontSize: 11, color: '#4a6580' }}>{user.name} · <span style={{ color: '#00d4ff' }}>SUPER ADMIN</span></div>
          </div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <RuaiPulseBoard authToken={localStorage.getItem('token')} />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ── Super Admin Home Dashboard ─────────────────────────────────────────────
export default function SuperDashboard() {
  const [breakdown, setBreakdown] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChatModule, setShowChatModule] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bd, us] = await Promise.all([
        api.get('/finance/breakdown'),
        api.get('/users'),
      ]);
      setBreakdown(bd.data);
      setUsers(us.data);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const deptUserCount = (slug) => users.filter((u) => u.departmentSlug === slug).length;

  if (loading) return <Spinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
        <h2 style={{ margin: 0, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#00d4ff' }}>◈ Command Centre</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => setShowChatModule(!showChatModule)}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(0,212,255,0.1)',
              color: '#00d4ff',
              border: '1px solid rgba(0,212,255,0.3)',
              borderRadius: '4px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            💬 Support Chat
          </button>
          <span style={{ fontSize: 10, color: '#4a6580', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Department scorecards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
        {Object.entries(DEPT_COLORS).map(([slug, color]) => {
          const deptData = breakdown.find((b) => b._id === slug);
          return (
            <NavLink key={slug} to={`/admin/${slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'linear-gradient(160deg,#0d1f35,#0a1628)', border: `1px solid ${color}22`, borderRadius: 8, padding: '1rem', position: 'relative', overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseOver={(e) => { e.currentTarget.style.border = `1px solid ${color}55`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.border = `1px solid ${color}22`; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: color, opacity: 0.6 }} />
                <div style={{ fontSize: 9, color, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>{slug}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#e2eeff' }}>{formatKES(deptData?.total || 0)}</div>
                <div style={{ fontSize: 10, color: '#4a6580', marginTop: 4 }}>{deptUserCount(slug)} staff</div>
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Consolidated chart */}
      <IncomeProjectionChart departmentId={null} departmentLabel="All Departments" showDepartmentBreakdown={true} />

      {/* Dept breakdown pie */}
      {breakdown.length > 0 && (
        <div style={{ background: 'linear-gradient(160deg,#0d1f35,#0a1628)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 8, padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a8c0d8' }}>◆ Revenue by Department</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={breakdown.map((b) => ({ name: b._id, value: b.total }))} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {breakdown.map((b) => <Cell key={b._id} fill={DEPT_COLORS[b._id] || '#00d4ff'} />)}
              </Pie>
              <Tooltip formatter={(v) => formatKES(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Chat Module Overlay - Updated to use new ChatMonitor */}
      {showChatModule && (
        <ChatMonitor 
          authToken={localStorage.getItem('token')}
          onClose={() => setShowChatModule(false)}
        />
      )}
    </div>
  );
}