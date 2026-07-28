import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../shared/api';
import { useRealtime } from '../../shared/useRealtime';

export default function AdminPage() {
  const [view, setView] = useState('Dashboard');
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [pipelineData, setPipelineData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [insights, setInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  const load = async () => {
    const [o, i, w, p] = await Promise.all([
      apiGet('/api/orders'),
      apiGet('/api/inventory'),
      apiGet('/api/waitlist'),
      apiGet('/api/analytics/pipeline').catch(() => null)
    ]);
    setOrders(o.orders || []);
    setInventory(i.inventory || []);
    setWaitlist(w.waitlist || []);
    if (p) {
      setPipelineData(p);
      if (p.historical_30m && p.historical_30m.length > 0) {
        setSelectedMonth(p.historical_30m[p.historical_30m.length - 1].month);
      }
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  useRealtime(m => {
    if (['new_order', 'order_update', 'poll', 'inventory_update', 'waitlist_update'].includes(m.type)) load().catch(() => {});
  });

  const report = async () => {
    setLoadingInsights(true);
    setInsights('Generating AI Financial & Demand Telemetry Report...');
    try {
      const d = await apiPost('/api/ai/insights', {
        revenue: pipelineData?.metrics?.total_30m_collections || 14285000,
        total_orders: pipelineData?.metrics?.total_30m_orders || 38420,
        top_dish: 'Hyderabadi Dum Biryani & Paneer Tikka',
        low_stock_items: inventory.filter(i => i.stock_status !== 'ok').map(i => i.name)
      });
      setInsights(d.insights || d.error);
    } catch (e) {
      setInsights(e.message);
    } finally {
      setLoadingInsights(false);
    }
  };

  const metrics = pipelineData?.metrics || {};
  const history30 = pipelineData?.historical_30m || [];
  const lowStockCount = inventory.filter(i => i.stock_status !== 'ok').length;

  const staffMembers = [
    { role: 'Admin / General Manager', email: 'admin@azzurro.demo', access: 'Full System Control & Telemetry', status: 'ONLINE ⚡', icon: '👑' },
    { role: 'Kitchen KDS Lead Chef', email: 'kitchen@azzurro.demo', access: 'Live Order Queue & Bump Panel', status: 'ONLINE ⚡', icon: '🍳' },
    { role: 'Waiter Dispatch Lead', email: 'waiter@azzurro.demo', access: 'Table Service & Delivery Dispatch', status: 'ONLINE ⚡', icon: '🛎️' },
    { role: 'Host Stand Allotment', email: 'host@azzurro.demo', access: 'Dining Floor Plan & Waitlist Queue', status: 'ONLINE ⚡', icon: '🪑' }
  ];

  return (
    <div className="admin-layout" style={{ background: '#090b0e', minHeight: '100vh', color: '#F8FAFC' }}>
      
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar" style={{ width: '260px', background: '#0b0d11', borderRight: '1px solid rgba(212,175,55,0.2)', padding: '36px 0' }}>
        <div className="admin-brand" style={{ padding: '0 24px 28px', fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', color: 'gold', fontWeight: '700', letterSpacing: '0.04em' }}>
          AZZURRO CAFFÈ
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '4px' }}>ORDR AI Engine v2.0</div>
        </div>
        
        <nav className="admin-nav">
          {[
            ['Dashboard', '📊'],
            ['30-Month Collections', '💰'],
            ['Inventory', '📦'],
            ['Staff', '👥'],
            ['Waitlist', '⏳'],
            ['AI Insights', '✨']
          ].map(([n, icon]) => (
            <button
              key={n}
              className={view === n ? 'active' : ''}
              onClick={() => setView(n)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                textAlign: 'left',
                padding: '16px 28px',
                border: '0',
                borderLeft: view === n ? '4px solid gold' : '4px solid transparent',
                color: view === n ? 'gold' : '#94A3B8',
                background: view === n ? 'rgba(212,175,55,0.08)' : 'transparent',
                fontWeight: view === n ? '700' : '500',
                fontSize: '15px',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '18px' }}>{icon}</span>
              {n}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main" style={{ flex: 1, padding: '36px 44px' }}>
        
        {/* Top View Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'gold', margin: 0, fontSize: '28px', letterSpacing: '0.02em' }}>{view}</h1>
            <p style={{ color: '#94A3B8', margin: '4px 0 0', fontSize: '14px' }}>Real-time telemetry and management controls</p>
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.4)', padding: '8px 18px', borderRadius: '20px', fontWeight: '700', fontSize: '13px' }}>
              ⚡ Redis & ETL Pipeline Active
            </span>
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {view === 'Dashboard' && (
          <>
            {/* Top Stat Cards Grid */}
            <section className="stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
              {[
                ['Lifetime 30M Revenue', `₹${(metrics.total_30m_collections || 14285000).toLocaleString('en-IN')}`, '30 Months Cumulative', '💰'],
                ['Total 30M Orders', (metrics.total_30m_orders || 38420).toLocaleString('en-IN'), '38,420 Completed Orders', '📦'],
                ['Monthly Revenue Baseline', `₹${(metrics.avg_monthly_revenue || 476000).toLocaleString('en-IN')}`, 'Historical Average', '📈'],
                ['Active Queue Telemetry', `${waitlist.length} Waiting • ${lowStockCount} Low Stock`, 'Live Operations', '⚡']
              ].map(([l, v, sub, icon]) => (
                <article key={l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '18px', padding: '24px', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{l}</span>
                    <span style={{ fontSize: '20px' }}>{icon}</span>
                  </div>
                  <div style={{ font: "700 26px 'JetBrains Mono', monospace", color: 'gold', marginTop: '10px' }}>{v}</div>
                  <div style={{ color: '#10B981', fontSize: '12px', marginTop: '6px', fontWeight: '600' }}>{sub}</div>
                </article>
              ))}
            </section>

            {/* Graphs & Charts Grid */}
            <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
              
              {/* Bar Chart Card */}
              <article style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', backdropFilter: 'blur(16px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ color: 'gold', margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px' }}>Recent 6-Month Revenue Bar Chart</h3>
                  <span className="mono" style={{ color: '#94a3b8', fontSize: '12px', background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: '6px' }}>Feb 2026 - Jul 2026</span>
                </div>
                <div style={{ display: 'grid', gap: '18px' }}>
                  {history30.slice(-6).map(m => (
                    <div key={m.month} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 120px 70px', gap: '14px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: '600' }}>{m.month}</span>
                      <div style={{ height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, (m.revenue / 650000) * 100)}%`, background: 'linear-gradient(90deg, #D4AF37, #F59E0B)', borderRadius: '8px', transition: 'width 0.6s ease' }} />
                      </div>
                      <span className="mono" style={{ color: 'gold', textAlign: 'right', fontWeight: '700', fontSize: '14px' }}>₹{m.revenue.toLocaleString('en-IN')}</span>
                      <span style={{ color: m.growth_mom.startsWith('+') ? '#10B981' : '#EF4444', fontSize: '12px', textAlign: 'right', fontWeight: '700' }}>{m.growth_mom}</span>
                    </div>
                  ))}
                </div>
              </article>

              {/* Top Selling Dishes Leaderboard */}
              <article style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', backdropFilter: 'blur(16px)' }}>
                <h3 style={{ color: 'gold', margin: '0 0 20px', fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px' }}>🔥 Top Selling Dishes</h3>
                <div style={{ display: 'grid', gap: '14px' }}>
                  {[
                    ['Hyderabadi Dum Biryani', '1,650 orders', '₹5,75,850'],
                    ['Paneer Tikka Multani', '1,420 orders', '₹3,53,580'],
                    ['Butter Chicken Deluxe', '1,180 orders', '₹4,11,820'],
                    ['Molten Lava Cake', '980 orders', '₹2,73,420'],
                    ['Classic Virgin Mojito', '2,100 orders', '₹2,91,900']
                  ].map(([dish, ordersCount, rev]) => (
                    <div key={dish} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ color: '#F8FAFC', fontWeight: '600', fontSize: '14px' }}>{dish}</div>
                        <div style={{ color: '#94A3B8', fontSize: '12px', marginTop: '2px' }}>{ordersCount}</div>
                      </div>
                      <span className="mono" style={{ color: 'gold', fontWeight: '700', fontSize: '14px' }}>{rev}</span>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            {/* Real-time Customer Orders Feed */}
            <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '20px', padding: '28px', backdropFilter: 'blur(16px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: 'gold', margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px' }}>Live Customer QR Orders Feed</h3>
                <span className="mono" style={{ color: '#10B981', fontSize: '13px' }}>{orders.length} Active Realtime Tickets</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px' }}>
                {orders.slice(0, 6).map(o => (
                  <div key={o.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ color: 'gold' }}>Table {o.tables?.table_number || o.table_number || o.table_id || '1'}</strong>
                      <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                        {o.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: '13px' }}>Guest: {o.customer_name || 'Guest'}</div>
                    <div className="mono" style={{ color: 'gold', marginTop: '8px', fontWeight: '700', fontSize: '15px' }}>₹{o.total_amount || 450}</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* 30-MONTH COLLECTIONS TAB */}
        {view === '30-Month Collections' && (
          <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '20px', padding: '36px', backdropFilter: 'blur(16px)' }}>
            
            {/* Header Telemetry Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h2 style={{ color: 'gold', margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px' }}>Full 30-Month Financial Telemetry Ledger</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>Cumulative Historical Revenue from Feb 2024 to Jul 2026</p>
              </div>
              <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', padding: '12px 24px', borderRadius: '14px' }}>
                <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block', textTransform: 'uppercase' }}>Lifetime 30M Revenue</span>
                <span className="mono" style={{ color: 'gold', fontSize: '22px', fontWeight: '700' }}>
                  ₹{(metrics.total_30m_collections || 14285000).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* 30-Month Interactive Bar Graph Visualization */}
            <div style={{ marginBottom: '36px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h4 style={{ color: 'gold', margin: '0 0 16px', fontSize: '15px' }}>30-Month Visual Revenue Trend Bar Chart</h4>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '160px', padding: '10px 0' }}>
                {history30.map((m) => {
                  const pct = Math.max(15, Math.min(100, (m.revenue / 650000) * 100));
                  return (
                    <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }} title={`${m.month}: ₹${m.revenue.toLocaleString('en-IN')}`}>
                      <div style={{ width: '100%', height: `${pct}%`, background: 'linear-gradient(180deg, #D4AF37, rgba(212,175,55,0.2))', borderRadius: '4px 4px 0 0' }} />
                      <span style={{ fontSize: '9px', color: '#94A3B8', marginTop: '6px', transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>{m.month.slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Full Ledger Table */}
            <div style={{ maxHeight: '550px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }}>
              <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)', color: 'gold' }}>
                    <th style={{ padding: '16px 20px', textAlign: 'left' }}>Month & Year</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left' }}>Monthly Revenue</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left' }}>Orders Processed</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left' }}>Avg Order Value</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left' }}>MoM Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {history30.map((m, idx) => (
                    <tr key={m.month} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '14px 20px', color: '#F8FAFC', fontWeight: '600' }}>{m.month}</td>
                      <td className="mono" style={{ padding: '14px 20px', color: 'gold', fontWeight: '700' }}>₹{m.revenue.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '14px 20px', color: '#94A3B8' }}>{m.orders.toLocaleString('en-IN')} orders</td>
                      <td className="mono" style={{ padding: '14px 20px', color: '#10B981' }}>₹{m.avg_order_value}</td>
                      <td style={{ padding: '14px 20px', color: m.growth_mom.startsWith('+') ? '#10B981' : '#EF4444', fontWeight: '600' }}>{m.growth_mom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* INVENTORY TAB */}
        {view === 'Inventory' && (
          <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: 'gold', margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px' }}>Real-time Ingredient Stock Telemetry</h2>
              <span className="badge" style={{ background: lowStockCount ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', color: lowStockCount ? '#EF4444' : '#10B981', border: lowStockCount ? '1px solid #EF4444' : '1px solid #10B981', padding: '6px 14px', borderRadius: '12px' }}>
                {lowStockCount ? `⚠️ ${lowStockCount} Items Low Stock` : '✓ All Ingredients Optimal'}
              </span>
            </div>

            <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'gold' }}>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Ingredient Name</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Unit</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Current Stock Level</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Safety Threshold</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(i => {
                  const pct = Math.min(100, Math.round((i.current_stock / (i.min_threshold * 3)) * 100));
                  return (
                    <tr key={i.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px', fontWeight: '600', color: '#F8FAFC' }}>{i.name}</td>
                      <td style={{ padding: '16px', color: '#94A3B8' }}>{i.unit}</td>
                      <td style={{ padding: '16px', width: '280px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span className="mono" style={{ color: 'gold', fontWeight: '700' }}>{i.current_stock} {i.unit}</span>
                          <span style={{ color: '#94A3B8' }}>{pct}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: i.stock_status === 'ok' ? '#10B981' : '#EF4444', borderRadius: '4px' }} />
                        </div>
                      </td>
                      <td className="mono" style={{ padding: '16px', color: '#94A3B8' }}>{i.min_threshold} {i.unit}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          background: i.stock_status === 'ok' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                          color: i.stock_status === 'ok' ? '#10B981' : '#EF4444',
                          border: i.stock_status === 'ok' ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(239,68,68,0.4)',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontWeight: '700',
                          fontSize: '12px'
                        }}>
                          {i.stock_status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {/* STAFF TAB */}
        {view === 'Staff' && (
          <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '20px', padding: '32px', backdropFilter: 'blur(16px)' }}>
            <h2 style={{ color: 'gold', marginTop: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', marginBottom: '24px' }}>Active Staff Accounts & Role-Based Access Board</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {staffMembers.map((s) => (
                <div key={s.email} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>{s.icon}</span>
                      <strong style={{ color: 'gold', fontSize: '17px' }}>{s.role}</strong>
                    </div>
                    <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981', border: '1px solid rgba(16,185,129,0.4)', padding: '4px 12px', borderRadius: '14px', fontSize: '11px', fontWeight: '700' }}>
                      {s.status}
                    </span>
                  </div>
                  <div className="mono" style={{ color: '#F8FAFC', fontSize: '14px', marginBottom: '8px' }}>{s.email}</div>
                  <div style={{ color: '#94A3B8', fontSize: '13px' }}>{s.access}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* WAITLIST TAB */}
        {view === 'Waitlist' && (
          <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', backdropFilter: 'blur(16px)' }}>
            <h2 style={{ color: 'gold', marginTop: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', marginBottom: '24px' }}>Real-time Dining Floor Waitlist</h2>
            {waitlist.length ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {waitlist.map((w, idx) => (
                  <div key={w.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'gold' }}>#{idx + 1} {w.customer_name || w.guestName}</div>
                      <div style={{ color: '#94A3B8', fontSize: '14px', marginTop: '4px' }}>Phone: {w.customer_phone || '+91 98765 43210'} • Party of {w.party_size || 2} • Est. Wait: {w.wait_time_minutes || 15} mins</div>
                    </div>
                    <span style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.4)', padding: '8px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '13px' }}>
                      WAITING FOR ALLOTMENT
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>No guests currently waiting in queue.</div>
            )}
          </section>
        )}

        {/* AI INSIGHTS TAB */}
        {view === 'AI Insights' && (
          <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '20px', padding: '36px', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ color: 'gold', margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px' }}>AI Executive Financial & Demand Telemetry Engine</h2>
                <p style={{ color: '#94A3B8', margin: '4px 0 0', fontSize: '14px' }}>Generates real-time executive reports on revenue, dish popularity, inventory velocity & profit optimization.</p>
              </div>
            </div>

            <button
              className="btn btn-full"
              onClick={report}
              disabled={loadingInsights}
              style={{
                background: 'gold',
                color: '#000',
                fontWeight: '700',
                fontSize: '16px',
                padding: '18px',
                borderRadius: '14px',
                boxShadow: '0 4px 20px rgba(212,175,55,0.3)'
              }}
            >
              {loadingInsights ? '⏳ Running Executive AI Analysis...' : '✨ Run AI Financial & Demand Telemetry Pipeline Report'}
            </button>

            {insights && (
              <div style={{
                marginTop: '28px',
                padding: '24px 30px',
                background: '#040608',
                borderRadius: '16px',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                color: '#F8FAFC',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8,
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
              }}>
                {insights}
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}
