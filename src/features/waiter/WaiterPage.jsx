import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../shared/api';
import { useRealtime } from '../../shared/useRealtime';

const tableFor = (o) => o.tables?.table_number || o.table_number || o.table_id || '-';
const itemsFor = (o) => o.order_items || o.items || [];

export default function WaiterPage() {
  const [orders, setOrders] = useState([]);
  const [count, setCount] = useState(Number(localStorage.getItem('deliveryCount') || 0));
  const [toast, setToast] = useState('');

  const load = async () => setOrders(((await apiGet('/api/orders')).orders || []).filter(o => o.status === 'ready'));

  useEffect(() => { load().catch(() => {}); }, []);

  useRealtime(m => {
    if (['order_update', 'poll'].includes(m.type)) load().catch(() => {});
  });

  const deliver = async (o) => {
    await apiPost(`/api/orders/${o.id}/status`, { status: 'served' }, 'PATCH');
    const next = count + 1;
    setCount(next);
    localStorage.setItem('deliveryCount', next);
    setToast(`Order delivered to Table ${tableFor(o)}!`);
    setTimeout(() => setToast(''), 3000);
    load();
  };

  return (
    <div className="portal-page" style={{ background: '#090b0e', minHeight: '100vh', color: '#F8FAFC', paddingTop: '100px', paddingLeft: '32px', paddingRight: '32px' }}>
      <header className="portal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '16px' }}>
        <div>
          <b className="portal-title" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'gold', fontSize: '24px' }}>🛎️ WAITER DISPATCH PANEL</b>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>Azzurro Caffè Real-time Table Service</div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', padding: '8px 16px', fontSize: '14px' }}>
            ✓ Delivered Today: {count} Tables
          </span>
        </div>
      </header>

      <main className="waiter-main" style={{ maxWidth: '900px', margin: 'auto' }}>
        <h1 className="section-title" style={{ color: 'gold', fontFamily: 'Space Grotesk, sans-serif', fontSize: '26px', marginBottom: '8px' }}>Orders Ready for Delivery</h1>
        <p style={{ color: '#94A3B8', marginBottom: '28px', fontSize: '15px' }}>Orders marked ready by the kitchen display system</p>

        {orders.length ? (
          <div className="delivery-list" style={{ display: 'grid', gap: '20px' }}>
            {orders.map(o => (
              <article
                className="card order-card ready"
                key={o.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '2px solid #10B981',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <div className="delivery-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <b className="table-name" style={{ font: "700 24px 'Space Grotesk', sans-serif", color: 'gold' }}>Table {tableFor(o)}</b>
                  <span className="badge" style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981', padding: '6px 14px', fontWeight: '700' }}>READY FOR SERVING</span>
                </div>

                <div style={{ color: '#F8FAFC', fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
                  Guest: {o.customer_name || 'Guest'}
                </div>

                <div className="divider" style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />

                <div style={{ display: 'grid', gap: '8px', margin: '16px 0' }}>
                  {itemsFor(o).map((i, n) => (
                    <div key={i.id || n} style={{ color: '#94A3B8', fontSize: '14px' }}>
                      • <strong>{i.name || i.menu_items?.name || 'Menu item'}</strong> <span className="mono" style={{ color: 'gold' }}>x{i.quantity || i.qty || 1}</span>
                      {i.special_instructions && <small style={{ display: 'block', color: '#F59E0B', fontStyle: 'italic', marginTop: '2px' }}>{i.special_instructions}</small>}
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-full"
                  style={{ marginTop: 16, background: '#10B981', color: '#fff', fontWeight: '700', fontSize: '16px', padding: '14px' }}
                  onClick={() => deliver(o)}
                >
                  🚀 Confirm Table Delivery & Mark Served
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛎️</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'gold', fontFamily: 'Space Grotesk, sans-serif' }}>All ready orders delivered</div>
            <div style={{ marginTop: '8px' }}>Orders ready for serving will appear here automatically.</div>
          </div>
        )}
      </main>

      {toast && (
        <div className="toast" style={{ position: 'fixed', right: '24px', bottom: '24px', background: '#10B981', color: '#fff', padding: '16px 28px', borderRadius: '12px', fontWeight: '700', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', zIndex: 1000 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
