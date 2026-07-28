import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../shared/api';
import { useRealtime } from '../../shared/useRealtime';

const itemsFor = (o) => o.order_items || o.items || [];
const tableFor = (o) => o.tables?.table_number || o.table_number || o.table_id || '-';
const elapsed = (iso) => {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso || Date.now())) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [clock, setClock] = useState(Date.now());

  const load = async () => setOrders(((await apiGet('/api/orders')).orders || []).filter((o) => ['placed', 'received', 'preparing', 'ready'].includes(o.status)));

  useEffect(() => {
    load().catch(() => {});
    const t = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useRealtime((m) => {
    if (['new_order', 'order_update', 'poll'].includes(m.type)) load().catch(() => {});
  });

  const update = async (id, status) => {
    await apiPost(`/api/orders/${id}/status`, { status }, 'PATCH');
    load();
  };

  return (
    <div className="portal-page" style={{ background: '#090b0e', minHeight: '100vh', color: '#F8FAFC', paddingTop: '100px', paddingLeft: '32px', paddingRight: '32px' }}>
      <header className="portal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '16px' }}>
        <div>
          <b className="portal-title" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'gold', fontSize: '24px' }}>🍳 KITCHEN DISPLAY SYSTEM (KDS)</b>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>Live Order Queue & Bump Management</div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span className="badge" style={{ background: 'rgba(212,175,55,0.15)', color: 'gold', border: '1px solid rgba(212,175,55,0.3)', padding: '8px 16px', fontSize: '14px' }}>
            {orders.length} Active Ticket{orders.length === 1 ? '' : 's'}
          </span>
          <span className="mono" style={{ color: '#94A3B8', fontSize: '14px' }}>{new Date(clock).toLocaleTimeString()}</span>
        </div>
      </header>

      {orders.length ? (
        <main className="kds-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {orders.map((o) => {
            const mins = Math.floor((Date.now() - new Date(o.created_at || Date.now())) / 60000);
            const next = o.status === 'ready' ? 'served' : o.status === 'preparing' ? 'ready' : 'preparing';
            const isUrgent = mins > 15;

            return (
              <article
                className={`card order-card ${o.status}`}
                key={o.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: isUrgent ? '2px solid #EF4444' : o.status === 'ready' ? '2px solid #10B981' : '1px solid rgba(212,175,55,0.3)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: isUrgent ? '0 0 20px rgba(239,68,68,0.2)' : '0 8px 30px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <div className="order-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="table-name" style={{ font: "700 22px 'Space Grotesk', sans-serif", color: 'gold' }}>Table {tableFor(o)}</span>
                  <span className="mono" style={{ background: 'rgba(0,0,0,0.4)', color: 'gold', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}>⏱️ {elapsed(o.created_at)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: '13px', marginBottom: '16px' }}>
                  <span>Placed {mins}m ago</span>
                  {isUrgent && <span style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid #EF4444', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>URGENT</span>}
                </div>

                <div className="divider" style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />

                <div style={{ display: 'grid', gap: '10px', margin: '16px 0' }}>
                  {itemsFor(o).map((i, n) => (
                    <div key={i.id || n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#F8FAFC', fontSize: '15px' }}>
                      <span>
                        <strong>{i.name || i.menu_items?.name || 'Menu item'}</strong>
                        {i.special_instructions && <small style={{ display: 'block', color: '#F59E0B', fontSize: '12px', fontStyle: 'italic' }}>Note: {i.special_instructions}</small>}
                      </span>
                      <span className="mono" style={{ background: 'rgba(212,175,55,0.15)', color: 'gold', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                        x{i.quantity || i.qty || 1}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="divider" style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '16px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge badge-${o.status === 'ready' ? 'ready' : 'preparing'}`} style={{ background: o.status === 'ready' ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)', color: o.status === 'ready' ? '#10B981' : '#818CF8', padding: '6px 12px', borderRadius: '20px', fontWeight: '700' }}>
                    {o.status.toUpperCase()}
                  </span>
                </div>

                <button
                  className="btn btn-full"
                  style={{ marginTop: 16, background: next === 'ready' ? '#10B981' : 'gold', color: '#000', fontWeight: '700', fontSize: '15px', padding: '12px' }}
                  onClick={() => update(o.id, next)}
                >
                  {o.status === 'ready' ? 'Mark Order Served' : o.status === 'preparing' ? 'Mark Order Ready' : 'Start Preparing'}
                </button>
              </article>
            );
          })}
        </main>
      ) : (
        <div className="empty-state" style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍳</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'gold', fontFamily: 'Space Grotesk, sans-serif' }}>No active orders in kitchen queue</div>
          <div style={{ marginTop: '8px' }}>Real-time customer orders will appear here automatically.</div>
        </div>
      )}
    </div>
  );
}
