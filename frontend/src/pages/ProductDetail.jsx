// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';
import { formatKES, noImagePlaceholder } from '../utils/helpers';
import { Spinner } from '../components/UI';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    api.get(`/products/${slug}`).then((r) => setProduct(r.data)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Spinner />;
  if (!product) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-primary)', background: 'var(--bg-void)' }}>Product not found. <Link to="/store" style={{ color: 'var(--text-blue)', textDecoration: 'none' }}>Back to store</Link></div>;

  const images = product.images?.length ? product.images : [noImagePlaceholder(500, 400)];
  const outOfStock = !product.isDigital && product.stock === 0;

  const handleAdd = () => {
    addItem(product, qty);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem', background: 'var(--bg-void)', color: 'var(--text-primary)' }}>
      <Link to="/store" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}>← Back to Store</Link>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
        <div>
          <img src={images[imgIdx]} alt={product.name} style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 400, background: 'var(--bg-card)' }} />
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {images.map((img, i) => (
                <img key={i} src={img} alt="" onClick={() => setImgIdx(i)} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: imgIdx === i ? '2px solid var(--text-blue)' : '2px solid transparent' }} />
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--border-white)' }}>
          <span style={{ fontSize: 12, background: 'var(--bg-card)', color: 'var(--text-secondary)', padding: '2px 10px', borderRadius: 10, width: 'fit-content', textTransform: 'capitalize', fontFamily: "'Inter', sans-serif" }}>{product.category}</span>
          <h1 style={{ margin: 0, fontSize: 24, color: 'var(--text-bright)', fontFamily: "'Poppins', sans-serif" }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-bright)', fontFamily: "'Poppins', sans-serif" }}>{formatKES(product.price)}</span>
            {product.comparePrice && <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 18, fontFamily: "'Inter', sans-serif" }}>{formatKES(product.comparePrice)}</span>}
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontFamily: "'Inter', sans-serif" }}>{product.description}</p>
          {product.warranty !== 'No warranty' && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, fontFamily: "'Inter', sans-serif" }}>🛡 Warranty: {product.warranty}</p>}
          {!product.isDigital && <p style={{ fontSize: 13, color: product.stock > 0 ? 'var(--text-green, #27ae60)' : 'var(--text-red, #e74c3c)', margin: 0, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{product.stock > 0 ? `✅ ${product.stock} in stock` : '❌ Out of stock'}</p>}
          {!outOfStock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-white)', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-card)' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '0.5rem 0.75rem', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 16, fontFamily: "'Inter', sans-serif" }}>−</button>
                <span style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ padding: '0.5rem 0.75rem', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 16, fontFamily: "'Inter', sans-serif" }}>+</button>
              </div>
              <button onClick={handleAdd} style={{ flex: 1, padding: '0.75rem', background: 'var(--grad-btn-red)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 15, fontFamily: "'Inter', sans-serif", boxShadow: 'var(--shadow-red)', transition: 'var(--transition)' }}
                onMouseOver={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px #c0392b66'; }}
                onMouseOut={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-red)'; }}>
                Add to Cart
              </button>
            </div>
          )}
          {product.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {product.tags.map((t) => <span key={t} style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', padding: '2px 10px', borderRadius: 10, fontSize: 12, fontFamily: "'Inter', sans-serif" }}>{t}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}