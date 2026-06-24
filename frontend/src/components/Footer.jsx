// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import RuaiTechLogo from './Logo';

export default function Footer({ variant = 'public' }) {
  const isAdmin = variant === 'admin';

  return (
    <footer style={{
      background: 'linear-gradient(180deg, #130d1e 0%, #0e0a14 100%)',
      borderTop: '1px solid rgba(192,57,43,0.15)',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
      padding: isAdmin ? '0.65rem 1.5rem' : '3rem 1.5rem 1.5rem',
      marginTop: 'auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, #c0392b, #8e44ad, #2980b9, transparent)',
        pointerEvents: 'none',
      }} />

      {!isAdmin && (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>

            {/* Brand */}
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <RuaiTechLogo size={36} showText={true} textSize="14px" />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                Your one-stop technology &amp; digital services hub in Ruai Town Centre, Nairobi County, Kenya.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#e74c3c', marginBottom: '0.85rem', fontFamily: "'Poppins', sans-serif" }}>Quick Links</p>
              {[['/store','Tech Store'],['/calculator','Price Calculator'],['/consult','Consultations'],['/services','Services'],['/help','Help Desk'],['/contact','Contact Us']].map(([href, label]) => (
                <a key={href} href={href} style={{ display: 'block', color: 'var(--text-muted)', fontSize: 13, marginBottom: 7, fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.target.style.color = '#f0eeff'; e.target.style.paddingLeft = '6px'; }}
                  onMouseOut={(e) => { e.target.style.color = 'var(--text-muted)'; e.target.style.paddingLeft = '0'; }}>
                  › {label}
                </a>
              ))}
            </div>

            {/* Contact */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#e74c3c', marginBottom: '0.85rem', fontFamily: "'Poppins', sans-serif" }}>Contact</p>
              {[['📍','Ruai Town Centre, Nairobi'],['📞','IP Phone — coming soon'],['✉️','info@ruaitechsolutions.co.ke']].map(([icon, text]) => (
                <p key={text} style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 7, display: 'flex', gap: 8, fontFamily: "'Inter', sans-serif" }}>
                  <span>{icon}</span><span>{text}</span>
                </p>
              ))}
              <a href="https://wa.me/254140918502" target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
                padding: '6px 16px',
                background: 'rgba(39,174,96,0.12)',
                border: '1px solid rgba(39,174,96,0.35)',
                borderRadius: 8, color: '#2ecc71', fontSize: 13, fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s', fontFamily: "'Inter', sans-serif",
              }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(39,174,96,0.22)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(39,174,96,0.12)'; }}>
                💬 WhatsApp Us
              </a>
            </div>

            {/* Hours */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#e74c3c', marginBottom: '0.85rem', fontFamily: "'Poppins', sans-serif" }}>Opening Hours</p>
              {[['Mon – Fri','8:00 AM – 8:00 PM'],['Saturday','9:00 AM – 7:00 PM'],['Sunday','10:00 AM – 5:00 PM']].map(([day, hours]) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 7, gap: 8, fontFamily: "'Inter', sans-serif" }}>
                  <span style={{ color: 'var(--text-muted)' }}>{day}</span>
                  <span style={{ color: 'var(--white-dim)', fontWeight: 500 }}>{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="divider" />
        </div>
      )}

      {/* Copyright bar */}
      <div style={{
        maxWidth: isAdmin ? '100%' : 1200,
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        color: 'var(--text-muted)',
        fontFamily: "'Inter', sans-serif",
      }}>
        <span>
          © 2026{' '}
          <strong style={{ background: 'linear-gradient(90deg, #e74c3c, #3498db)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Thoth of Codes
          </strong>
          {' '}— All rights reserved.
        </span>
        <span>
          Licensed under the{' '}
          <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noreferrer"
            style={{ color: '#e74c3c', textDecoration: 'none' }}>
            MIT License
          </a>
        </span>
        <span>MERN · M-Pesa · Made in Kenya 🇰🇪</span>
      </div>
    </footer>
  );
}
