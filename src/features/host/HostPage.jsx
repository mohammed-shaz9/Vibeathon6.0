import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../shared/api';
import { useRealtime } from '../../shared/useRealtime';

export default function HostPage() {
  const [tables, setTables] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [show, setShow] = useState(false);
  const [entry, setEntry] = useState({ customer_name: '', customer_phone: '', party_size: 2 });
  const [toast, setToast] = useState('');

  const load = async () => {
    const [t, w] = await Promise.all([apiGet('/api/tables'), apiGet('/api/waitlist')]);
    setTables(t.tables || []);
    setWaitlist(w.waitlist || []);
  };

  useEffect(() => { load().catch(() => {}); }, []);

  useRealtime(m => {
    if (['table_update', 'waitlist_update', 'poll'].includes(m.type)) load().catch(() => {});
  });

  const add = async e => {
    e.preventDefault();
    await apiPost('/api/waitlist', entry);
    setShow(false);
    setEntry({ customer_name: '', customer_phone: '', party_size: 2 });
    setToast('Added guest to waitlist!');
    setTimeout(() => setToast(''), 2500);
    load();
  };

  const seat = async (w, table) => {
    await apiPost(`/api/tables/${table.id}`, { status: 'occupied' }, 'PATCH');
    setToast(`Seated ${w.customer_name} at Table ${table.table_number}!`);
    setTimeout(() => setToast(''), 2500);
    load();
  };

  const available = tables.filter(t => t.status === 'available');

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'occupied': return '#3B82F6';
      case 'order_placed': return '#F59E0B';
      case 'food_ready': return '#EF4444';
      default: return '#A855F7';
    }
  };

  return (
    <div className="portal-page" style={{ background: '#090b0e', minHeight: '100vh', color: '#F8FAFC', paddingTop: '100px', paddingLeft: '32px', paddingRight: '32px' }}>
      <header className="portal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '16px' }}>
        <div>
          <b className="portal-title" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'gold', fontSize: '24px' }}>🪑 HOST STAND & FLOOR PLAN</b>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>Azzurro Caffè Table Allotment Engine</div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', padding: '8px 16px', fontSize: '14px' }}>
            {available.length} Tables Available
          </span>
          <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', padding: '8px 16px', fontSize: '14px' }}>
            {waitlist.length} Waiting
          </span>
        </div>
      </header>

      <main className="host-layout" style={{ display: 'flex', gap: '32px' }}>
        <section className="host-left" style={{ flex: '0 0 380px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: 'gold', margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px' }}>WAITLIST QUEUE</h2>
            <button className="btn" style={{ background: 'gold', color: '#000', fontWeight: '700', padding: '8px 16px', borderRadius: '8px' }} onClick={() => setShow(true)}>
              + Add Guest
            </button>
          </div>

          <div className="queue-list" style={{ display: 'grid', gap: '12px' }}>
            {waitlist.length ? (
              waitlist.map((w, i) => (
                <div key={w.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                  <div>
                    <span className="mono" style={{ color: 'gold', fontWeight: '700', marginRight: '10px' }}>#{i + 1}</span>
                    <span style={{ fontWeight: '600' }}>{w.customer_name}</span>
                    <div style={{ color: '#94A3B8', fontSize: '12px', marginTop: '2px' }}>{w.party_size} guests • ~15m wait</div>
                  </div>
                  <button className="btn btn-success" disabled={!available.length} onClick={() => seat(w, available[0])} style={{ background: '#10B981', color: '#fff', fontWeight: '700', padding: '8px 14px' }}>
                    Seat Table
                  </button>
                </div>
              ))
            ) : (
              <p className="muted" style={{ color: '#94A3B8', textAlign: 'center', padding: '30px 0' }}>No guests currently waiting.</p>
            )}
          </div>
        </section>

        <section className="host-right" style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(12px)' }}>
          <h2 style={{ color: 'gold', margin: '0 0 20px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px' }}>MAIN DINING FLOOR PLAN</h2>
          <div className="floor-plan" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {tables.map(t => {
              const statusColor = getStatusColor(t.status);
              return (
                <article
                  className={`table-card ${t.status}`}
                  key={t.id}
                  style={{
                    minHeight: '120px',
                    background: 'rgba(255,255,255,0.02)',
                    border: `2px solid ${statusColor}`,
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: `0 0 15px ${statusColor}33`
                  }}
                >
                  <b className="table-name" style={{ font: "700 24px 'Space Grotesk', sans-serif", color: 'gold' }}>Table {t.table_number}</b>
                  <small style={{ color: '#94A3B8' }}>{t.capacity} seats</small>
                  <span className="badge" style={{ background: `${statusColor}22`, color: statusColor, padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                    {String(t.status).replace('_', ' ')}
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {show && (
        <div className="cart-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <form className="card" onSubmit={add} style={{ width: 'min(440px, 90%)', background: '#0F172A', border: '1px solid gold', borderRadius: '16px', padding: '32px' }}>
            <h2 className="section-title" style={{ color: 'gold', margin: '0 0 20px', fontFamily: 'Space Grotesk, sans-serif' }}>Add Guest to Waitlist</h2>
            <label className="field" style={{ display: 'grid', gap: '6px', marginBottom: '16px' }}>
              <span style={{ color: '#94A3B8', fontSize: '13px' }}>Guest Name</span>
              <input value={entry.customer_name} onChange={e => setEntry({ ...entry, customer_name: e.target.value })} required style={{ background: '#090b0e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }} />
            </label>
            <label className="field" style={{ display: 'grid', gap: '6px', marginBottom: '16px' }}>
              <span style={{ color: '#94A3B8', fontSize: '13px' }}>Phone Number</span>
              <input value={entry.customer_phone} onChange={e => setEntry({ ...entry, customer_phone: e.target.value })} style={{ background: '#090b0e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }} />
            </label>
            <label className="field" style={{ display: 'grid', gap: '6px', marginBottom: '24px' }}>
              <span style={{ color: '#94A3B8', fontSize: '13px' }}>Party Size</span>
              <select value={entry.party_size} onChange={e => setEntry({ ...entry, party_size: Number(e.target.value) })} style={{ background: '#090b0e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} Guests</option>)}
              </select>
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-full" style={{ background: 'gold', color: '#000', fontWeight: '700', flex: 1, padding: '12px' }}>Confirm Add</button>
              <button type="button" className="btn btn-outline" onClick={() => setShow(false)} style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#94A3B8', flex: 1, padding: '12px' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className="toast" style={{ position: 'fixed', right: '24px', bottom: '24px', background: 'gold', color: '#000', padding: '16px 28px', borderRadius: '12px', fontWeight: '700', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', zIndex: 1000 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
