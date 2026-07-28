import React, { useEffect, useState } from 'react';
import { apiGet } from '../../shared/api';

export default function BillPage({ nav }) {
  const id = new URLSearchParams(location.search).get('orderId');
  const [order, setOrder] = useState(null);
  const [paid, setPaid] = useState(false);
  const [method, setMethod] = useState('card');
  const guestName = localStorage.getItem('azzurro_customer_name') || 'Guest';

  useEffect(() => {
    if (id) apiGet(`/api/orders/${id}`).then(d => setOrder(d.order)).catch(() => {});
  }, [id]);

  const items = order?.items || [];
  const subtotal = items.reduce((s, i) => s + (i.price * (i.qty || i.quantity || 1)), 0);
  const tax = subtotal * 0.05;
  const serviceCharge = subtotal * 0.10;
  const total = subtotal + tax + serviceCharge;

  const handlePay = () => {
    setPaid(true);
    setTimeout(() => nav.go(`/review.html?orderId=${id}`), 2500);
  };

  if (paid) {
    return (
      <div style={{ minHeight: '100vh', background: '#0b0d11', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h1 style={{ color: 'gold', fontFamily: 'Space Grotesk, sans-serif', margin: '0 0 8px 0' }}>Payment Successful!</h1>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>Thank you, {guestName}. Redirecting to review...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b0d11', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: 'gold', fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', margin: '0 0 8px 0' }}>Your Bill</h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Table #{order?.table_number || order?.tableId || '-'} · Order {id}</p>
        </div>

        {/* Bill Card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          {/* Items */}
          <div style={{ marginBottom: '16px' }}>
            {items.map((item, idx) => (
              <div key={item.id || idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <span style={{ color: '#fff', fontWeight: '600' }}>{item.name || 'Menu Item'}</span>
                  <span style={{ color: '#64748b', fontSize: '13px', marginLeft: '8px' }}>×{item.qty || item.quantity || 1}</span>
                </div>
                <span style={{ color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>₹{(item.price * (item.qty || item.quantity || 1)).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Subtotals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '14px' }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '14px' }}>
              <span>GST (5%)</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>₹{tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '14px' }}>
              <span>Service Charge (10%)</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>₹{serviceCharge.toFixed(2)}</span>
            </div>
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', borderTop: '2px solid rgba(212,175,55,0.3)', marginTop: '8px' }}>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '18px' }}>Total</span>
            <span style={{ color: 'gold', fontWeight: '800', fontSize: '22px', fontFamily: 'JetBrains Mono, monospace' }}>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ color: '#fff', margin: '0 0 16px 0', fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>Payment Method</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[['card', '💳', 'Card'], ['cash', '💵', 'Cash'], ['upi', '📱', 'UPI']].map(([val, icon, label]) => (
              <button
                key={val}
                onClick={() => setMethod(val)}
                style={{
                  background: method === val ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                  border: method === val ? '2px solid gold' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '16px 8px',
                  color: method === val ? 'gold' : '#94a3b8',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '24px', margin: '0 0 6px 0' }}>{icon}</div>
                <div style={{ fontWeight: '600', fontSize: '13px' }}>{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #d4af37, #f5d060)',
            color: '#000',
            border: 'none',
            borderRadius: '12px',
            padding: '18px',
            fontWeight: '800',
            fontSize: '17px',
            cursor: 'pointer',
            letterSpacing: '0.02em',
            boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(212,175,55,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(212,175,55,0.3)'; }}
        >
          Pay ₹{total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
