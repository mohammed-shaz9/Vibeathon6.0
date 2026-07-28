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
              <span style={{ fontSize: '26px' }}>🍳</span>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'gold', margin: 0, fontSize: '24px', letterSpacing: '0.04em' }}>KITCHEN DISPLAY SYSTEM (KDS)</h1>
            </div>
            <p style={{ color: '#94A3B8', margin: '4px 0 0 38px', fontSize: '14px' }}>Azzurro Caffè Live Culinary Queue & Order Bumping</p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'gold', border: '1px solid rgba(212, 175, 55, 0.4)', padding: '10px 18px', borderRadius: '20px', fontWeight: '700', fontSize: '14px' }}>
              ⚡ {orders.length} Active Ticket{orders.length === 1 ? '' : 's'}
            </span>
            <span className="mono" style={{ background: 'rgba(0, 0, 0, 0.4)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 16px', borderRadius: '12px', fontSize: '14px' }}>
              {new Date(clock).toLocaleTimeString()}
            </span>
          </div>
        </header>

        {orders.length ? (
          <main style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px' }}>
            {orders.map((o) => {
              const mins = Math.floor((Date.now() - new Date(o.created_at || Date.now())) / 60000);
              const next = o.status === 'ready' ? 'served' : o.status === 'preparing' ? 'ready' : 'preparing';
              const isUrgent = mins > 15;

              return (
                <article
                  key={o.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: isUrgent ? '2px solid #EF4444' : o.status === 'ready' ? '2px solid #10B981' : '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '20px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isUrgent ? '0 0 25px rgba(239, 68, 68, 0.25)' : '0 12px 36px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(16px)',
                    transition: 'transform 0.25s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ font: "700 24px 'Space Grotesk', sans-serif", color: 'gold' }}>Table {tableFor(o)}</span>
                      <span className="mono" style={{ background: 'rgba(0,0,0,0.6)', color: 'gold', border: '1px solid rgba(212,175,55,0.3)', padding: '6px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: '700' }}>
                        ⏱️ {elapsed(o.created_at)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8', fontSize: '13px', marginBottom: '16px' }}>
                      <span>Received {mins} mins ago</span>
                      {isUrgent && <span style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid #EF4444', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em' }}>URGENT</span>}
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '14px 0' }} />

                    <div style={{ display: 'grid', gap: '12px', margin: '18px 0' }}>
                      {itemsFor(o).map((i, n) => (
                        <div key={i.id || n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#F8FAFC', fontSize: '15px' }}>
                          <span>
                            <strong style={{ color: '#fff' }}>{i.name || i.menu_items?.name || 'Menu item'}</strong>
                            {i.special_instructions && <small style={{ display: 'block', color: '#F59E0B', fontSize: '12px', fontStyle: 'italic', marginTop: '2px' }}>Note: {i.special_instructions}</small>}
                          </span>
                          <span className="mono" style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'gold', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '14px' }}>
                            x{i.quantity || i.qty || 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '18px 0 14px' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{
                        background: o.status === 'ready' ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)',
                        color: o.status === 'ready' ? '#10B981' : '#818CF8',
                        border: o.status === 'ready' ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(99,102,241,0.4)',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontWeight: '700',
                        fontSize: '12px',
                        letterSpacing: '0.05em'
                      }}>
                        {o.status.toUpperCase()}
                      </span>
                    </div>

                    <button
                      className="btn btn-full"
                      style={{
                        background: next === 'ready' ? '#10B981' : 'gold',
                        color: '#000',
                        fontWeight: '700',
                        fontSize: '15px',
                        padding: '14px',
                        borderRadius: '12px',
                        letterSpacing: '0.02em',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                      }}
                      onClick={() => update(o.id, next)}
                    >
                      {o.status === 'ready' ? 'Mark Order Served' : o.status === 'preparing' ? 'Mark Order Ready' : 'Start Preparing'}
                    </button>
                  </div>
                </article>
              );
            })}
          </main>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(212,175,55,0.3)', borderRadius: '24px', color: '#94a3b8' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🍳</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'gold', fontFamily: "'Space Grotesk', sans-serif", margin: '0 0 8px' }}>No active orders in kitchen queue</h2>
            <p style={{ margin: 0 }}>Real-time customer orders placed via QR scanning will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
