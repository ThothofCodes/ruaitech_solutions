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
  if (!product) return <div style={{ padding: '2rem', textAlign: 'center' }}>Product not found. <Link to="/store">Back to store</Link></div>;

  const images = product.images?.length ? product.images : [noImagePlaceholder(500, 400)];
  const outOfStock = !product.isDigital && product.stock === 0;

  const handleAdd = () => {
    addItem(product, qty);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
      <Link to="/store" style={{ color: '#64748b', fontSize: 14, textDecoration: 'none' }}>← Back to Store</Link>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
        <div>
          <img src={images[imgIdx]} alt={product.name} style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 400 }} />
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {images.map((img, i) => (
                <img key={i} src={img} alt="" onClick={() => setImgIdx(i)} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: imgIdx === i ? '2px solid #3b82f6' : '2px solid transparent' }} />
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 12, background: '#e2e8f0', padding: '2px 10px', borderRadius: 10, width: 'fit-content', textTransform: 'capitalize' }}>{product.category}</span>
          <h1 style={{ margin: 0, fontSize: 24 }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 700 }}>{formatKES(product.price)}</span>
            {product.comparePrice && <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: 18 }}>{formatKES(product.comparePrice)}</span>}
          </div>
          <p style={{ color: '#475569', lineHeight: 1.6, margin: 0 }}>{product.description}</p>
          {product.warranty !== 'No warranty' && <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>🛡 Warranty: {product.warranty}</p>}
          {!product.isDigital && <p style={{ fontSize: 13, color: product.stock > 0 ? '#10b981' : '#ef4444', margin: 0, fontWeight: 600 }}>{product.stock > 0 ? `✅ ${product.stock} in stock` : '❌ Out of stock'}</p>}
          {!outOfStock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '0.5rem 0.75rem', border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: 16 }}>−</button>
                <span style={{ padding: '0.5rem 1rem', fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ padding: '0.5rem 0.75rem', border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: 16 }}>+</button>
              </div>
              <button onClick={handleAdd} style={{ flex: 1, padding: '0.75rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>
                Add to Cart
              </button>
            </div>
          )}
          {product.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {product.tags.map((t) => <span key={t} style={{ background: '#f1f5f9', padding: '2px 10px', borderRadius: 10, fontSize: 12 }}>{t}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
