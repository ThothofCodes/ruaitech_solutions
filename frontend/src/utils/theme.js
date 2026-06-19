// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
// Shared inline style constants — dark matte red-blue theme

export const T = {
  // Page wrapper
  page: { padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },

  // Section header row
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  h2: { margin: 0, fontSize: 20, fontWeight: 700, color: '#f0eeff', fontFamily: "'Poppins',sans-serif" },

  // Card / panel
  card: { background: 'linear-gradient(160deg,#1f1438,#1a1030)', border: '1px solid rgba(240,238,255,0.08)', borderRadius: 12, padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' },

  // Table
  table: { width: '100%', borderCollapse: 'collapse', background: 'linear-gradient(160deg,#1f1438,#1a1030)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' },
  thead: { background: 'linear-gradient(90deg,rgba(192,57,43,0.15),rgba(41,128,185,0.1))', borderBottom: '1px solid rgba(192,57,43,0.2)' },
  th: { padding: '0.8rem 1rem', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#d8d0f0', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Poppins',sans-serif" },
  td: { padding: '0.8rem 1rem', fontSize: 13, color: '#b8a8d8', borderBottom: '1px solid rgba(240,238,255,0.05)', fontFamily: "'Inter',sans-serif" },
  tdBold: { padding: '0.8rem 1rem', fontSize: 13, color: '#f0eeff', fontWeight: 600, borderBottom: '1px solid rgba(240,238,255,0.05)', fontFamily: "'Inter',sans-serif" },
  trHover: { borderBottom: '1px solid rgba(240,238,255,0.05)' },

  // Input
  input: { width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(14,10,20,0.7)', border: '1px solid rgba(240,238,255,0.1)', borderRadius: 8, color: '#f0eeff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif" },

  // Label
  label: { display: 'block', marginBottom: 5, fontSize: 11, color: '#a090c8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" },

  // Modal overlay + box
  overlay: { position: 'fixed', inset: 0, background: 'rgba(14,10,20,0.88)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'linear-gradient(160deg,#1f1438,#1a1030)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: 14, padding: '1.75rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.7)', position: 'relative' },
  modalWide: { background: 'linear-gradient(160deg,#1f1438,#1a1030)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: 14, padding: '1.75rem', width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.7)', position: 'relative' },
  modalH3: { margin: '0 0 1.25rem', fontSize: 16, fontWeight: 700, color: '#f0eeff', fontFamily: "'Poppins',sans-serif" },
};

// Button factory
export const btn = (variant = 'primary') => {
  const map = {
    primary: { background: 'linear-gradient(135deg,#c0392b,#e74c3c)', color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(192,57,43,0.3)' },
    blue:    { background: 'linear-gradient(135deg,#2980b9,#3498db)', color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(41,128,185,0.3)' },
    green:   { background: 'linear-gradient(135deg,#27ae60,#2ecc71)', color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(39,174,96,0.3)' },
    ghost:   { background: 'rgba(240,238,255,0.06)', color: '#b8a8d8', border: '1px solid rgba(240,238,255,0.12)', boxShadow: 'none' },
    danger:  { background: 'rgba(231,76,60,0.12)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)', boxShadow: 'none' },
  };
  return { ...map[variant], padding: '0.5rem 1.1rem', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif", transition: 'all 0.2s ease' };
};

export const btnSm = (variant = 'blue') => ({ ...btn(variant), padding: '3px 10px', fontSize: 12, marginRight: 4 });

// Tab pill
export const tabPill = (active) => ({
  padding: '5px 14px', borderRadius: 20,
  border: `1px solid ${active ? 'rgba(192,57,43,0.4)' : 'rgba(240,238,255,0.1)'}`,
  background: active ? 'rgba(192,57,43,0.15)' : 'transparent',
  color: active ? '#f0eeff' : '#6a5a8a',
  cursor: 'pointer', fontSize: 12, fontWeight: 600,
  fontFamily: "'Inter',sans-serif", transition: 'all 0.15s ease',
  textTransform: 'capitalize',
});

// Badge
export const badge = { background: 'rgba(240,238,255,0.08)', color: '#b8a8d8', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontFamily: "'Inter',sans-serif", border: '1px solid rgba(240,238,255,0.1)' };
