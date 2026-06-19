// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import RuaiTechLogo from './Logo';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { count } = useCart();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav style={{
      background: 'linear-gradient(90deg, #0e0a14 0%, #130d1e 40%, #1a1030 60%, #0e0a14 100%)',
      borderBottom: '1px solid rgba(192,57,43,0.2)',
      boxShadow: '0 2px 20px rgba(0,0,0,0.6), 0 1px 0 rgba(192,57,43,0.08) inset',
      padding: '0 2rem',
      height: 66,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 200,
      backdropFilter: 'blur(16px)',
    }}>
      {/* Logo */}
      <Link to="/store" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }} title="Home">
        <RuaiTechLogo size={38} showText={true} textSize="14px" />
      </Link>

      {/* Desktop Navigation - Hidden on mobile */}
      <div className="desktop-nav" style={{ display: 'flex', gap: '0.15rem', alignItems: 'center' }}>
        {[
          { to: '/store',      label: 'Store'      },
          { to: '/calculator', label: 'Calculator' },
          { to: '/consult',    label: 'Consult'    },
          { to: '/services',   label: 'Services'   },
          { to: '/contact',    label: 'Contact'    },
        ].map(({ to, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            padding: '0.4rem 0.9rem',
            borderRadius: 6,
            color: isActive ? '#fff' : 'rgba(240,238,255,0.65)',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: isActive ? 700 : 500,
            fontFamily: "'Inter', sans-serif",
            background: isActive
              ? 'linear-gradient(135deg, rgba(192,57,43,0.3), rgba(41,128,185,0.2))'
              : 'transparent',
            border: isActive ? '1px solid rgba(192,57,43,0.35)' : '1px solid transparent',
            transition: 'all 0.2s ease',
          })}
            onMouseOver={(e) => { if (!e.currentTarget.style.background.includes('gradient(135deg, rgba(192')) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(240,238,255,0.06)'; } }}
            onMouseOut={(e) => { if (!e.currentTarget.style.background.includes('gradient(135deg, rgba(192')) { e.currentTarget.style.color = 'rgba(240,238,255,0.65)'; e.currentTarget.style.background = 'transparent'; } }}>
            {label}
          </NavLink>
        ))}

        {/* Cart */}
        <Link to="/cart" style={{
          marginLeft: 10,
          padding: '0.4rem 0.9rem',
          borderRadius: 6,
          border: '1px solid rgba(192,57,43,0.35)',
          background: 'rgba(192,57,43,0.1)',
          color: '#f0eeff',
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.2s ease',
        }}>
          🛒
          {count > 0 && (
            <span style={{
              background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
              color: '#fff',
              borderRadius: '50%',
              width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800,
              boxShadow: '0 0 8px rgba(192,57,43,0.6)',
            }}>{count}</span>
          )}
        </Link>
      </div>

      {/* Mobile Menu Button - Hidden on desktop */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: '1.5rem',
          cursor: 'pointer',
          padding: '0.5rem',
        }}
        className="mobile-menu-button"
      >
        ☰
      </button>

      {/* Mobile Menu - Hidden on desktop */}
      <div 
        style={{
          display: 'none',
          position: 'fixed',
          top: 66,
          left: 0,
          right: 0,
          background: 'var(--bg-panel)',
          zIndex: 199,
          flexDirection: 'column',
          padding: '1rem',
          gap: '0.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
        className="mobile-menu"
      >
        {[
          { to: '/store',      label: 'Store'      },
          { to: '/calculator', label: 'Calculator' },
          { to: '/consult',    label: 'Consult'    },
          { to: '/services',   label: 'Services'   },
          { to: '/contact',    label: 'Contact'    },
        ].map(({ to, label }) => (
          <NavLink 
            key={to} 
            to={to} 
            onClick={() => setIsMenuOpen(false)}
            style={({ isActive }) => ({
              padding: '0.8rem 1rem',
              borderRadius: 6,
              color: isActive ? '#fff' : 'rgba(240,238,255,0.65)',
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: isActive ? 700 : 500,
              fontFamily: "'Inter', sans-serif",
              background: isActive
                ? 'linear-gradient(135deg, rgba(192,57,43,0.3), rgba(41,128,185,0.2))'
                : 'transparent',
              border: isActive ? '1px solid rgba(192,57,43,0.35)' : '1px solid transparent',
              transition: 'all 0.2s ease',
            })}
          >
            {label}
          </NavLink>
        ))}
        <Link 
          to="/cart" 
          style={{
            padding: '0.8rem 1rem',
            borderRadius: 6,
            border: '1px solid rgba(192,57,43,0.35)',
            background: 'rgba(192,57,43,0.1)',
            color: '#f0eeff',
            textDecoration: 'none',
            fontSize: 16,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '0.5rem',
          }}
        >
          <span>🛒 Cart</span>
          {count > 0 && (
            <span style={{
              background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
              color: '#fff',
              borderRadius: '50%',
              width: 24, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800,
              boxShadow: '0 0 8px rgba(192,57,43,0.6)',
            }}>{count}</span>
          )}
        </Link>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-button {
            display: block !important;
          }
          
          .desktop-nav {
            display: none !important;
          }
          
          .mobile-menu {
            display: ${isMenuOpen ? 'flex' : 'none'} !important;
          }
        }
      `}</style>
    </nav>
  );
}