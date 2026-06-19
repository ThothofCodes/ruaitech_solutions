// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import RuaiTechLogo from '../../components/Logo'; // Import the logo

const AdminNavbar = ({ collapsed = false, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    { label: '📊 Dashboard', path: '/' },
    { label: '💬 Messages', path: '/chat' },
    { label: '📋 Orders', path: '/orders' },
    { label: '📅 Bookings', path: '/bookings' },
    { label: '📞 Callbacks', path: '/callbacks' },
    { label: '👥 Clients', path: '/clients' },
    { label: '🛠️ Services', path: '/services' },
    { label: '📦 Products', path: '/products' },
  ];

  const deptItems = [
    { label: '🌐 Internet', path: '/admin/internet' },
    { label: '💻 Web Dev', path: '/admin/webdev' },
    { label: '🎮 PlayStation', path: '/admin/playstation' },
    { label: '🔧 Repair', path: '/admin/repair' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavLink = ({ item, depth = 0 }) => (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        navigate(item.path);
        setMobileMenuOpen(false);
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        borderRadius: '8px',
        color: isActive(item.path) ? '#00d4ff' : '#e2eeff',
        background: isActive(item.path) ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
        borderLeft: isActive(item.path) ? '3px solid #00d4ff' : 'none',
        paddingLeft: isActive(item.path) ? '9px' : '12px',
        transition: 'all 0.2s ease',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: isActive(item.path) ? '600' : '400',
        marginLeft: depth * 8,
      }}
      onMouseEnter={(e) => {
        if (!isActive(item.path)) {
          e.target.style.background = 'rgba(0, 212, 255, 0.08)';
          e.target.style.color = '#00d4ff';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive(item.path)) {
          e.target.style.background = 'transparent';
          e.target.style.color = '#e2eeff';
        }
      }}
    >
      <span>{item.label}</span>
    </a>
  );

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: collapsed ? '80px' : '280px',
        background: 'linear-gradient(180deg, #060d14 0%, #0a1628 50%, #060d14 100%)',
        borderRight: '1px solid rgba(0,212,255,0.1)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 999,
      }}
    >
      {/* Header with logo */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RuaiTechLogo size={32} showText={true} textSize="14px" />
          </div>
        )}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <RuaiTechLogo size={32} showText={false} />
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#00d4ff',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          display: 'none',
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'transparent',
          border: 'none',
          color: '#00d4ff',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 1001,
        }}
        className="mobile-menu-btn"
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Main Menu */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ fontSize: '12px', color: '#6a8aa0', padding: '8px 12px', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {!collapsed && 'MAIN'}
        </div>
        {navItems.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}

        <div style={{ height: '1px', background: 'rgba(0, 212, 255, 0.1)', margin: '8px 0' }} />

        <div style={{ fontSize: '12px', color: '#6a8aa0', padding: '8px 12px', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {!collapsed && 'DEPARTMENTS'}
        </div>
        {deptItems.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(0, 212, 255, 0.1)',
          padding: '12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {!collapsed && user && (
          <div
            style={{
              fontSize: '12px',
              color: '#6a8aa0',
              padding: '8px 12px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={user.email}
          >
            {user.email}
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 20, 147, 0.3)',
            color: '#ff3366',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 20, 147, 0.1)';
            e.target.style.borderColor = '#ff3366';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.borderColor = 'rgba(255, 20, 147, 0.3)';
          }}
        >
          {!collapsed ? '🚪 Logout' : '🚪'}
        </button>
      </div>

      {/* Mobile Styles */}
      <style>{`
        @media (max-width: 768px) {
          nav {
            width: 100% !important;
            height: auto !important;
            min-height: 80px !important;
            position: relative !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(0, 212, 255, 0.1) !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          nav > div:nth-child(2) {
            display: ${mobileMenuOpen ? 'flex' : 'none'} !important;
            position: absolute !important;
            top: 80px !important;
            left: 0 !important;
            right: 0 !important;
            background: linear-gradient(180deg, #060d14 0%, #0a1628 50%, #060d14 100%) !important;
            border-bottom: 1px solid rgba(0, 212, 255, 0.1) !important;
            flex-direction: column !important;
            max-height: 70vh !important;
            overflow-y: auto !important;
            z-index: 1000 !important;
          }
          nav > div:nth-child(4) {
            display: ${mobileMenuOpen ? 'flex' : 'none'} !important;
            border-top: 1px solid rgba(0, 212, 255, 0.1) !important;
            border-bottom: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default AdminNavbar;