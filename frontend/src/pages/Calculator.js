// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceEstimator from '../components/Calculator/ServiceEstimator';
import HardwareBundler from '../components/Calculator/HardwareBundler';

export default function Calculator() {
  const [mode, setMode] = useState('service');
  const navigate = useNavigate();

  const handleQuote = (quote) => {
    sessionStorage.setItem('quote', JSON.stringify(quote));
    navigate('/consult/book');
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 1.5rem' }}>
      <div className="hero-section" style={{ padding: '2.5rem 1rem 2rem', marginBottom: '2rem', borderRadius: 14 }}>
        <div className="section-label">Ruai Tech Solutions</div>
        <h1 className="hero-title" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)' }}>Smart Price Calculator</h1>
        <p style={{ color: 'var(--white-dim)', fontSize: 14, margin: 0, fontFamily: "'Inter',sans-serif" }}>Get an instant estimate for any service or hardware bundle.</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem' }}>
        {[['service', '🛠 Service Estimator'], ['hardware', '💻 Hardware Bundle Builder']].map(([m, l]) => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '0.85rem', borderRadius: 10, border: `2px solid ${mode === m ? '#e74c3c' : 'rgba(240,238,255,0.1)'}`, background: mode === m ? 'rgba(192,57,43,0.15)' : 'rgba(14,10,20,0.5)', color: mode === m ? '#f0eeff' : '#6a5a8a', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: "'Poppins',sans-serif", transition: 'all 0.2s' }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ background: 'linear-gradient(160deg,#1f1438,#1a1030)', border: '1px solid rgba(240,238,255,0.08)', borderRadius: 14, padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#c0392b,#8e44ad,#2980b9)', opacity: 0.7 }} />
        {mode === 'service' ? <ServiceEstimator onQuote={handleQuote} /> : <HardwareBundler onQuote={handleQuote} />}
      </div>

      <div style={{ marginTop: '1.5rem', background: 'rgba(41,128,185,0.08)', border: '1px solid rgba(41,128,185,0.2)', borderRadius: 10, padding: '1rem', fontSize: 13, color: '#b8a8d8', fontFamily: "'Inter',sans-serif" }}>
        💡 All prices are estimates in KES. Final pricing confirmed at booking. Rush surcharges apply for urgent requests.
      </div>
    </div>
  );
}
