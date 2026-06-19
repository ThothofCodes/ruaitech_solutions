// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RuaiTechLogo from '../components/Logo';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch {
      toast.error('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 20%, rgba(192,57,43,0.1) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(41,128,185,0.1) 0%, transparent 50%), var(--bg-void)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(192,57,43,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(192,57,43,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div style={{
        background: 'linear-gradient(160deg, #1f1438 0%, #1a1030 100%)',
        border: '1px solid rgba(192,57,43,0.2)',
        borderRadius: 16,
        padding: '2.5rem',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(192,57,43,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top gradient line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #c0392b, #8e44ad, #2980b9)' }} />

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <RuaiTechLogo size={68} showText={false} />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            margin: '0 0 6px', fontSize: 22, fontWeight: 800,
            fontFamily: "'Poppins', sans-serif",
            background: 'linear-gradient(90deg, #e74c3c, #f0eeff, #3498db)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Admin Portal</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
            Ruai Tech Solutions
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', alignItems: 'center' }}>
          {[['email', 'Email Address', 'email'], ['password', 'Password', 'password']].map(([field, label, type]) => (
            <div key={field} style={{ width: '100%' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: 'var(--white-dim)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
                {label}
              </label>
              <input
                type={type}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required
                className="input-field"
                style={{ fontSize: 14, width: '100%' }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(192,57,43,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(192,57,43,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(240,238,255,0.12)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            marginTop: 8,
            padding: '0.8rem',
            background: loading ? 'rgba(192,57,43,0.2)' : 'linear-gradient(135deg, #c0392b, #e74c3c)',
            color: loading ? 'var(--text-muted)' : '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: '0.04em',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(192,57,43,0.35)',
            width: '100%',
          }}
            onMouseOver={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(192,57,43,0.45)'; } }}
            onMouseOut={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(192,57,43,0.35)'; } }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
          © 2026 Thoth of Codes · MIT License
        </p>
      </div>
    </div>
  );
}
