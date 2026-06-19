// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Spinner } from '../../components/UI';
import AdminNavbar from './AdminNavbar';
import { useState } from 'react';

const AdminLayout = () => {
  const { user, loading } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) return <Spinner />;

  if (!user) {
    // This shouldn't happen if the route is properly protected, but just in case
    return <div>Please log in to access admin panel</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020408' }}>
      <AdminNavbar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
      />
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        marginLeft: collapsed ? '80px' : '280px', // Adjust margin based on navbar state
        transition: 'margin-left 0.3s ease' // Smooth transition when toggling
      }}>
        <header style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(0,212,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e2eeff' }}>
              {collapsed ? '...' : 'Admin Portal'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 12, color: '#a8c0d8' }}>{user.name || user.email}</div>
          </div>
        </header>
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;