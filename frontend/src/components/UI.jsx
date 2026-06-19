// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.

export function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: 16 }}>
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '3px solid rgba(192,57,43,0.15)',
          borderTop: '3px solid #e74c3c',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
          boxShadow: '0 0 12px rgba(192,57,43,0.3)',
        }} />
        <div style={{
          position: 'absolute', inset: 8,
          border: '2px solid rgba(41,128,185,0.15)',
          borderBottom: '2px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite reverse',
        }} />
        <div style={{
          position: 'absolute', inset: '50%',
          width: 6, height: 6,
          marginLeft: -3, marginTop: -3,
          background: 'linear-gradient(135deg, #e74c3c, #3498db)',
          borderRadius: '50%',
        }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>Loading...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function EmptyState({ icon = '📭', message = 'No data found' }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>{icon}</div>
      <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", margin: 0 }}>{message}</p>
    </div>
  );
}
