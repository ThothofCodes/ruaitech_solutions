// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';
import { formatKES } from '../utils/helpers';
import PaymentForm from '../components/PaymentForm';
import toast from 'react-hot-toast';
import { T } from '../utils/theme';

const DELIVERY_FEE = 300;

const card = { background: 'linear-gradient(160deg,#1f1438,#1a1030)', border: '1px solid rgba(240,238,255,0.08)', borderRadius: 12, padding: '1.25rem' };

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', deliveryType: 'pickup', deliveryAddress: '', notes: '', paymentMethod: 'mpesa' });
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = form.deliveryType === 'delivery' ? DELIVERY_FEE : 0;
  const grandTotal = total + deliveryFee;

  const placeOrder = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const { data } = await api.post('/orders', {
        customer: { name: form.name, phone: form.phone, email: form.email, deliveryAddress: form.deliveryAddress },
        items: items.map((i) => ({ product: i._id, quantity: i.quantity })),
        deliveryType: form.deliveryType, deliveryFee, notes: form.notes, paymentMethod: form.paymentMethod,
      });
      setOrder(data);
      if (form.paymentMethod === 'mpesa') setStep(2);
      else { clearCart(); setStep(3); }
    } catch (err) { toast.error(err.response?.data?.message || 'Order failed'); }
    setSubmitting(false);
  };

  if (step === 3) return (
    <div style={{ maxWidth: 500, margin: '5rem auto', padding: '2rem', textAlign: 'center', ...card }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <h2 style={{ color: '#f0eeff', fontFamily: "'Poppins',sans-serif" }}>Order Placed!</h2>
      <p style={{ color: '#b8a8d8', fontFamily: "'Inter',sans-serif" }}>Order: <strong style={{ color: '#f0eeff' }}>{order?.orderNumber}</strong></p>
      <p style={{ color: '#6a5a8a', fontSize: 13, fontFamily: "'Inter',sans-serif" }}>You'll receive an SMS confirmation shortly.</p>
      <button onClick={() => navigate('/store')} style={{ marginTop: '1rem', padding: '0.75rem 2rem', background: 'linear-gradient(135deg,#c0392b,#e74c3c)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontFamily: "'Poppins',sans-serif" }}>Continue Shopping</button>
    </div>
  );

  if (step === 2) return (
    <div style={{ maxWidth: 500, margin: '4rem auto', padding: '2rem', ...card }}>
      <h2 style={{ margin: '0 0 1.5rem', textAlign: 'center', color: '#f0eeff', fontFamily: "'Poppins',sans-serif" }}>Complete Payment</h2>
      <PaymentForm orderId={order._id} amount={grandTotal} onSuccess={() => { clearCart(); setStep(3); }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 780, margin: '2rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ margin: '0 0 1.5rem', fontFamily: "'Poppins',sans-serif", color: '#f0eeff', fontSize: 'clamp(22px, 5vw, 28px)' }}>Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 300px)', gap: '1.5rem', '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } }}>
        <form onSubmit={placeOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 1rem', color: '#f0eeff', fontFamily: "'Poppins',sans-serif" }}>Your Details</h3>
            {[['name','Full Name','text'],['phone','Phone (M-Pesa)','tel'],['email','Email (optional)','email']].map(([k,l,t]) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <label style={T.label}>{l}</label>
                <input 
                  type={t} 
                  value={form[k]} 
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })} 
                  required={k !== 'email'} 
                  style={{ ...T.input, width: '100%', minHeight: '44px' }}
                  placeholder={k === 'phone' ? '+254712345678' : undefined}
                />
              </div>
            ))}
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 1rem', color: '#f0eeff', fontFamily: "'Poppins',sans-serif" }}>Delivery</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {['pickup','delivery'].map((t) => (
                <button key={t} type="button" onClick={() => setForm({ ...form, deliveryType: t })}
                  style={{ flex: 1, minWidth: '120px', padding: '0.65rem', borderRadius: 8, border: `2px solid ${form.deliveryType === t ? '#e74c3c' : 'rgba(240,238,255,0.1)'}`, background: form.deliveryType === t ? 'rgba(192,57,43,0.15)' : 'transparent', color: form.deliveryType === t ? '#f0eeff' : '#6a5a8a', cursor: 'pointer', fontWeight: 600, fontFamily: "'Inter',sans-serif", transition: 'all 0.2s ease', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t === 'pickup' ? '🏪 Pickup (Free)' : `🚚 Delivery (+${formatKES(DELIVERY_FEE)})`}
                </button>
              ))}
            </div>
            {form.deliveryType === 'delivery' && (
              <div>
                <label style={T.label}>Delivery Address</label>
                <input value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} required style={T.input} placeholder="Estate, road, landmark..." />
              </div>
            )}
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 1rem', color: '#f0eeff', fontFamily: "'Poppins',sans-serif" }}>Payment Method</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {['mpesa','cash'].map((m) => (
                <button key={m} type="button" onClick={() => setForm({ ...form, paymentMethod: m })}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: 8, border: `2px solid ${form.paymentMethod === m ? '#2ecc71' : 'rgba(240,238,255,0.1)'}`, background: form.paymentMethod === m ? 'rgba(46,204,113,0.1)' : 'transparent', color: form.paymentMethod === m ? '#2ecc71' : '#6a5a8a', cursor: 'pointer', fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>
                  {m === 'mpesa' ? '📱 M-Pesa' : '💵 Cash on Pickup'}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} style={{ padding: '0.9rem', background: 'linear-gradient(135deg,#c0392b,#e74c3c)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 16, fontFamily: "'Poppins',sans-serif", boxShadow: '0 4px 20px rgba(192,57,43,0.35)' }}>
            {submitting ? 'Placing Order...' : `Place Order — ${formatKES(grandTotal)}`}
          </button>
        </form>

        <div style={{ ...card, height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#f0eeff', fontFamily: "'Poppins',sans-serif" }}>Order Summary</h3>
          {items.map((i) => (
            <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: '#b8a8d8', fontFamily: "'Inter',sans-serif" }}>
              <span>{i.name} ×{i.quantity}</span>
              <span style={{ color: '#f0eeff' }}>{formatKES(i.price * i.quantity)}</span>
            </div>
          ))}
          <div style={{ height: 1, background: 'rgba(240,238,255,0.06)', margin: '0.75rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: '#b8a8d8', fontFamily: "'Inter',sans-serif" }}>
            <span>Subtotal</span><span>{formatKES(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10, color: '#b8a8d8', fontFamily: "'Inter',sans-serif" }}>
            <span>Delivery</span><span>{deliveryFee ? formatKES(deliveryFee) : 'Free'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, color: '#f0eeff', fontFamily: "'Poppins',sans-serif" }}>
            <span>Total</span><span>{formatKES(grandTotal)}</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          [style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
          [style*="height: 'fit-content'"] {
            order: -1 !important;
            margin-bottom: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
