// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatKES, noImagePlaceholder } from '../utils/helpers';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const img = product.images?.[0] || noImagePlaceholder(300, 200);
  const outOfStock = !product.isDigital && product.stock === 0;

  return (
    <div style={{
      background: 'linear-gradient(160deg, #1f1438 0%, #1a1030 100%)',
      border: '1px solid rgba(240,238,255,0.08)',
      borderRadius: 14,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.25s ease',
      position: 'relative',
    }}
      onMouseOver={(e) => {
        e.currentTarget.style.border = '1px solid rgba(192,57,43,0.35)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(192,57,43,0.1)';
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.border = '1px solid rgba(240,238,255,0.08)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}>

      {/* Top accent */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, #c0392b, #8e44ad, #2980b9)', opacity: 0.6 }} />

      {/* Featured badge */}
      {product.featured && (
        <div style={{
          position: 'absolute', top: 14, right: 12,
          background: 'linear-gradient(135deg, rgba(243,156,18,0.2), rgba(243,156,18,0.1))',
          border: '1px solid rgba(243,156,18,0.4)',
          borderRadius: 20, padding: '2px 10px',
          fontSize: 10, fontWeight: 700, color: '#f39c12',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          fontFamily: "'Inter', sans-serif",
        }}>Featured</div>
      )}

      {/* Image */}
      <Link to={`/store/${product.slug}`}>
        <div style={{ position: 'relative', overflow: 'hidden', height: 190 }}>
          <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
            onMouseOver={(e) => { e.target.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(14,10,20,0.7) 100%)' }} />
        </div>
      </Link>

      {/* Content */}
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 10, color: '#e74c3c', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
          {product.category}
        </span>

        <Link to={`/store/${product.slug}`} style={{ fontWeight: 700, color: 'var(--white-hue)', textDecoration: 'none', fontSize: 15, lineHeight: 1.3, fontFamily: "'Poppins', sans-serif" }}>
          {product.name}
        </Link>

        {product.shortDesc && (
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>{product.shortDesc}</p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto', paddingTop: 8 }}>
          <span style={{
            fontWeight: 800, fontSize: 18,
            background: 'linear-gradient(90deg, #e74c3c, #d8d0f0)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            fontFamily: "'Poppins', sans-serif",
          }}>{formatKES(product.price)}</span>
          {product.comparePrice && (
            <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 12, fontFamily: "'Inter', sans-serif" }}>
              {formatKES(product.comparePrice)}
            </span>
          )}
        </div>

        {outOfStock ? (
          <span style={{ fontSize: 12, color: '#e74c3c', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Out of stock</span>
        ) : (
          <button onClick={() => addItem(product)} style={{
            padding: '0.55rem',
            background: 'linear-gradient(135deg, rgba(192,57,43,0.2), rgba(41,128,185,0.15))',
            color: 'var(--white-hue)',
            border: '1px solid rgba(192,57,43,0.3)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.2s ease',
          }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(192,57,43,0.35), rgba(41,128,185,0.25))'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(192,57,43,0.25)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(192,57,43,0.2), rgba(41,128,185,0.15))'; e.currentTarget.style.boxShadow = 'none'; }}>
            + Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
