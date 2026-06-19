// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { useEffect, useState } from 'react';
import { publicApi } from '../utils/api';
import ConsultationCard from '../components/ConsultationCard';
import { Spinner } from '../components/UI';

const WA_NUMBER = '254140918502';
const WA_LINK   = `https://wa.me/${WA_NUMBER}`;

export default function ConsultLanding() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.get('/consultations/types').then((r) => setTypes(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="hero-section">
        <div className="section-label">Expert Advisory</div>
        <h1 className="hero-title">Book a Consultation</h1>
        <p className="hero-subtitle">
          One-on-one advisory sessions with our tech experts. Available in-person, phone, WhatsApp, or video call.
        </p>
        {/* Direct WhatsApp CTA */}
        <a
          href={`${WA_LINK}?text=${encodeURIComponent('Hi Ruai Tech Solutions! I\'d like to book a consultation.')}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: '1.5rem',
            padding: '0.75rem 2rem',
            background: 'linear-gradient(135deg, rgba(37,211,102,0.2), rgba(37,211,102,0.1))',
            border: '1px solid rgba(37,211,102,0.4)',
            borderRadius: 10, color: '#25d366', fontSize: 15, fontWeight: 700,
            textDecoration: 'none', fontFamily: "'Poppins',sans-serif",
            boxShadow: '0 4px 20px rgba(37,211,102,0.2)',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(37,211,102,0.25)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.35)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(37,211,102,0.2), rgba(37,211,102,0.1))'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.2)'; }}>
          💬 Chat on WhatsApp
        </a>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* How it works */}
        <div className="feature-strip" style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '📍', color: '#e74c3c', title: 'In-Person',        desc: 'Ruai Town Centre',          href: null },
              { icon: '💬', color: '#25d366', title: 'WhatsApp',          desc: '+254 140 918 502',          href: `${WA_LINK}?text=${encodeURIComponent('Hi! I\'d like a consultation.')}` },
              { icon: '📞', color: '#3498db', title: 'Phone Call',        desc: 'IP Phone — coming soon',    href: null },
              { icon: '🎥', color: '#9b59b6', title: 'Video Call',        desc: 'Google Meet / Zoom',        href: null },
              { icon: '⏱', color: '#f39c12', title: 'Flexible Duration', desc: '30, 60, or 90 min',         href: null },
            ].map(({ icon, color, title, desc, href }) => {
              const inner = (
                <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                  <div style={{ fontSize: 32, marginBottom: 10, filter: `drop-shadow(0 0 8px ${color}66)` }}>{icon}</div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14, color: 'var(--white-hue)', fontFamily: "'Poppins',sans-serif" }}>{title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: href ? color : 'var(--text-muted)', fontFamily: "'Inter',sans-serif", fontWeight: href ? 600 : 400 }}>{desc}</p>
                </div>
              );
              return href ? (
                <a key={title} href={href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', borderRadius: 10, border: `1px solid ${color}22`, background: `${color}08`, transition: 'all 0.2s', display: 'block' }}
                  onMouseOver={(e) => { e.currentTarget.style.border = `1px solid ${color}44`; e.currentTarget.style.background = `${color}14`; }}
                  onMouseOut={(e) => { e.currentTarget.style.border = `1px solid ${color}22`; e.currentTarget.style.background = `${color}08`; }}>
                  {inner}
                </a>
              ) : (
                <div key={title}>{inner}</div>
              );
            })}
          </div>
        </div>

        {/* Consultation types */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="section-label">Choose Your Session</div>
          <h2 style={{ fontSize: 24, fontFamily: "'Poppins',sans-serif", margin: '4px 0 0' }}>Consultation Types</h2>
        </div>

        {loading ? <Spinner /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
            {types.map(({ type, fees }) => <ConsultationCard key={type} type={type} fees={fees} />)}
          </div>
        )}

        {/* Bottom WhatsApp CTA */}
        <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem', background: 'linear-gradient(135deg, rgba(37,211,102,0.06), rgba(37,211,102,0.02))', border: '1px solid rgba(37,211,102,0.15)', borderRadius: 14 }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: 18, fontWeight: 700, color: 'var(--white-hue)', fontFamily: "'Poppins',sans-serif" }}>
            Prefer to chat first?
          </p>
          <p style={{ margin: '0 0 1.25rem', fontSize: 13, color: 'var(--text-muted)', fontFamily: "'Inter',sans-serif" }}>
            Message us on WhatsApp and we'll help you choose the right consultation type.
          </p>
          <a
            href={`${WA_LINK}?text=${encodeURIComponent('Hi Ruai Tech Solutions! I need help choosing the right consultation.')}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #25d366, #128c7e)',
              color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 700,
              textDecoration: 'none', fontFamily: "'Poppins',sans-serif",
              boxShadow: '0 4px 20px rgba(37,211,102,0.3)',
            }}>
            💬 WhatsApp: +254 140 918 502
          </a>
        </div>
      </div>
    </div>
  );
}
