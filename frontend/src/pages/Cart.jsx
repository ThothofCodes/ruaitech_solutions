// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatKES, noImagePlaceholder } from '../utils/helpers';
import { EmptyState } from '../components/UI';

export default function Cart() {
  const { items, updateQty, removeItem, total, clearCart } = useCart();

  if (items.length === 0) return (
    <div style={{ maxWidth: 700, margin: '4rem auto', padding: '0 1rem', textAlign: 'center' }}>
      <EmptyState icon="🛒" message="Your cart is empty" />
      <Link to="/store" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.65rem 2rem', background: 'linear-gradient(135deg,#c0392b,#e74c3c)', color: '#fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Browse the Store →</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 820, margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0, fontFamily: "'Poppins',sans-serif", fontSize: 'clamp(20px, 5vw, 28px)', color: '#f0eeff' }}>Your Cart ({items.length})</h1>
        <button onClick={clearCart} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 13, fontFamily: "'Inter',sans-serif" }}>Clear cart</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {items.map((item) => (
          <div key={item._id} style={{ background: 'linear-gradient(160deg,#1f1438,#1a1030)', border: '1px solid rgba(240,238,255,0.08)', borderRadius: 12, padding: 'clamp(0.75rem, 2vw, 1rem)', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'center' }}>
              <img src={item.images?.[0] || noImagePlaceholder(80, 80)} alt={item.name} style={{ width: 'clamp(60px, 15vw, 100px)', height: 'clamp(60px, 15vw, 100px)', objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(240,238,255,0.1)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#f0eeff', fontFamily: "'Poppins',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                <p style={{ margin: '4px 0 0', color: '#6a5a8a', fontSize: 'clamp(12px, 2vw, 14px)', fontFamily: "'Inter',sans-serif" }}>{formatKES(item.price)} each</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(240,238,255,0.1)', borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => updateQty(item._id, Math.max(1, item.quantity - 1))} style={{ padding: '0.4rem 0.7rem', border: 'none', background: 'rgba(240,238,255,0.05)', color: '#f0eeff', cursor: 'pointer', fontSize: 16 }}>−</button>
                <span style={{ padding: '0.4rem 0.85rem', fontWeight: 600, color: '#f0eeff', fontFamily: "'Inter',sans-serif" }}>{item.quantity}</span>
                <button onClick={() => updateQty(item._id, Math.min(999, item.quantity + 1))} style={{ padding: '0.4rem 0.7rem', border: 'none', background: 'rgba(240,238,255,0.05)', color: '#f0eeff', cursor: 'pointer', fontSize: 16 }}>+</button>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#f0eeff', fontFamily: "'Poppins',sans-serif" }}>{formatKES(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 12, fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap' }}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'linear-gradient(160deg,#1f1438,#1a1030)', border: '1px solid rgba(240,238,255,0.08)', borderRadius: 12, padding: 'clamp(1rem, 2vw, 1.25rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 800, color: '#f0eeff', fontFamily: "'Poppins',sans-serif" }}>
          <span>Total</span><span>{formatKES(total)}</span>
        </div>
        <Link to="/checkout" style={{ textAlign: 'center', padding: 'clamp(0.65rem, 2vw, 0.85rem)', background: 'linear-gradient(135deg,#c0392b,#e74c3c)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 'clamp(14px, 2vw, 16px)', fontFamily: "'Poppins',sans-serif", boxShadow: '0 4px 20px rgba(192,57,43,0.35)', transition: 'all 0.2s ease', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Proceed to Checkout →
        </Link>
      </div>

      <style>{`
        @media (max-width: 576px) {
          div > div:first-child {
            padding: 0 !important;
            margin: 0 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
