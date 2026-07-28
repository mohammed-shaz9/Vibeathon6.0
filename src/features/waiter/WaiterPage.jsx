import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../shared/api';
import { useRealtime } from '../../shared/useRealtime';
import { safeStorage } from '../../shared/storage';

const tableFor = (o) => o.tables?.table_number || o.table_number || o.table_id || '-';
const itemsFor = (o) => o.order_items || o.items || [];

export default function WaiterPage() {
  const [orders, setOrders] = useState([]);
  const [count, setCount] = useState(Number(safeStorage.getItem('deliveryCount') || 0));
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
    safeStorage.setItem('deliveryCount', next);
    setToast(`Order delivered to Table ${tableFor(o)}!`);
    setTimeout(() => setToast(''), 3000);
    load();
  };

  return (
    <div className="portal-page" style={{ background: '#090b0e', minHeight: '100vh', color: '#F8FAFC', padding: '120px 24px 48px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Aligned Staff Portal Hero Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '18px',
          padding: '24px 32px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '26px' }}>🛎️</span>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'gold', margin: 0, fontSize: '24px', letterSpacing: '0.04em' }}>WAITER DISPATCH PANEL</h1>
            </div>
            <p style={{ color: '#94A3B8', margin: '4px 0 0 38px', fontSize: '14px' }}>Azzurro Caffè — Expedite & Deliver Every Order with Precision</p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '10px 18px', borderRadius: '20px', fontWeight: '700', fontSize: '14px' }}>
              ⚡ Dispatched Today: {count} Tables
            </span>
          </div>
        </header>

        {orders.length ? (
          <main style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '24px' }}>
            {orders.map(o => (
              <article
                key={o.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '2px solid #10B981',
                  borderRadius: '20px',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ font: "700 26px 'Space Grotesk', sans-serif", color: 'gold' }}>Table {tableFor(o)}</span>
                    <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981', border: '1px solid rgba(16,185,129,0.4)', padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '12px' }}>
                      ⚡ EXPEDITE — DELIVER NOW
                    </span>
                  </div>

                  <div style={{ color: '#F8FAFC', fontSize: '15px', fontWeight: '600', marginBottom: '14px' }}>
                    Serving Guest: {o.customer_name || 'Valued Guest'}
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '14px 0' }} />

                  <div style={{ display: 'grid', gap: '10px', margin: '16px 0' }}>
                    {itemsFor(o).map((i, n) => (
                      <div key={i.id || n} style={{ color: '#94A3B8', fontSize: '15px' }}>
                        • <strong style={{ color: '#fff' }}>{i.name || i.menu_items?.name || 'Menu item'}</strong> <span className="mono" style={{ color: 'gold', marginLeft: '6px' }}>x{i.quantity || i.qty || 1}</span>
                        {i.special_instructions && <small style={{ display: 'block', color: '#F59E0B', fontStyle: 'italic', marginTop: '2px' }}>Note: {i.special_instructions}</small>}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    className="btn btn-full"
                    style={{ marginTop: 16, background: '#10B981', color: '#fff', fontWeight: '700', fontSize: '16px', padding: '14px', borderRadius: '12px' }}
                    onClick={() => deliver(o)}
                  >
                    🚀 Execute Delivery — Mark Table Served
                  </button>
                </div>
              </article>
            ))}
          </main>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '24px', color: '#94a3b8' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🛎️</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'gold', fontFamily: "'Space Grotesk', sans-serif", margin: '0 0 8px' }}>All Dispatched — Outstanding Service Delivered</h2>
            <p style={{ margin: 0 }}>New orders reaching READY status in the kitchen will instantly appear here for waiter dispatch. Stay ready to execute.</p>
          </div>
        )}

        {toast && (
          <div style={{ position: 'fixed', right: '24px', bottom: '24px', background: '#10B981', color: '#fff', padding: '16px 28px', borderRadius: '12px', fontWeight: '700', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', zIndex: 1000 }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
