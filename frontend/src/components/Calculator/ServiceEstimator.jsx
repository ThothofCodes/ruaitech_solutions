// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { formatKES } from '../../utils/helpers';

const SERVICES = ['Website Design', 'MERN Web Application', 'E-Commerce Store', 'Cybersecurity Audit', 'Hardware Repair', 'IT Support Monthly', 'Social Media Management', 'Domain + Hosting Annual'];
const TIERS = ['basic', 'standard', 'premium'];

export default function ServiceEstimator({ onQuote }) {
  const [service, setService] = useState(SERVICES[0]);
  const [tier, setTier] = useState('standard');
  const [isRush, setIsRush] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const estimate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/calculator/estimate', { service, tier, isRush });
      setResult(data);
    } catch { setResult(null); }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Service</label>
        <select value={service} onChange={(e) => setService(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #cbd5e1' }}>
          {SERVICES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Tier</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {TIERS.map((t) => (
            <button key={t} onClick={() => setTier(t)} style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '2px solid', borderColor: tier === t ? '#3b82f6' : '#e2e8f0', background: tier === t ? '#eff6ff' : '#fff', cursor: 'pointer', textTransform: 'capitalize', fontWeight: tier === t ? 700 : 400 }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <input type="checkbox" checked={isRush} onChange={(e) => setIsRush(e.target.checked)} />
        Rush delivery (adds surcharge)
      </label>
      <button onClick={estimate} disabled={loading} style={{ padding: '0.75rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
        {loading ? 'Calculating...' : 'Get Estimate'}
      </button>
      {result && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '1rem' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 20, color: '#15803d' }}>{formatKES(result.finalPrice)}</p>
          {result.isRush && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Base: {formatKES(result.basePrice)} + rush surcharge</p>}
          <button onClick={() => onQuote({ service, tier, isRush, ...result })} style={{ marginTop: 12, padding: '0.5rem 1.5rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Book This Service →
          </button>
        </div>
      )}
    </div>
  );
}
