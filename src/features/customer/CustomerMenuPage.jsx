import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../shared/api';

export default function CustomerMenuPage() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/api/menu').then((d) => setMenu(d.categories || [])).catch(() => setError('Failed to load. Please refresh.'));
  }, []);

  const filtered = useMemo(() => menu.map((c) => ({
    ...c,
    items: (c.items || []).filter((i) => filter === 'all' ? true : filter === 'veg' ? i.is_veg : filter === 'nonveg' ? !i.is_veg : i.is_vegan)
  })).filter((c) => c.items.length), [menu, filter]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b.qty, 0);
  const cartTotal = Object.values(cart).reduce((a, b) => a + b.qty * Number(b.price), 0);

  const add = (item, delta) => {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[item.id] || { ...item, qty: 0 };
      current.qty = Math.max(0, current.qty + delta);
      if (current.qty) next[item.id] = current; else delete next[item.id];
      return next;
    });
  };

  const place = async () => {
    try {
      const items = Object.values(cart).map((i) => ({ menu_item_id: i.id, quantity: i.qty, special_instructions: '' }));
      const order = await apiPost('/api/orders', { table_id: 1, customer_name: 'Guest', customer_phone: '', dietary_preference: 'Veg', total_amount: cartTotal, items, special_instructions: '' });
      window.location.href = `/tracker.html?orderId=${encodeURIComponent(order.orderId)}`;
    } catch {
      setError('Failed to load. Please refresh.');
    }
  };

  return (
    <div className="app-shell" style={{ background: '#0b0d11' }}>
      <header><div className="container"><nav id="navbar"><div className="logo"><a href="/index.html">zzurro <b>C</b>affè</a></div></nav></div></header>
      <main className="ordr-page-wrapper" style={{ paddingTop: 110 }}>
        <div className="container">
          <div className="ordr-card ordr-glass" style={{ marginBottom: 16 }}>
            <button className="ordr-btn-secondary ordr-btn" onClick={() => setFilter('all')}>All</button>
            <button className="ordr-btn-secondary ordr-btn" onClick={() => setFilter('veg')}>Veg Only</button>
            <button className="ordr-btn-secondary ordr-btn" onClick={() => setFilter('nonveg')}>Non-Veg</button>
            <button className="ordr-btn-secondary ordr-btn" onClick={() => setFilter('vegan')}>Vegan</button>
          </div>
          {error && <div className="error-inline">{error}</div>}
          {filtered.map((cat) => (
            <section key={cat.id} className="ordr-card" style={{ marginBottom: 20 }}>
              <h2>{cat.name}</h2>
              <div className="menu-grid">
                {cat.items.map((item) => (
                  <article key={item.id} className="menu-card">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div>₹{item.price}</div>
                    <div className="qty-row">
                      <button onClick={() => add(item, -1)}>-</button>
                      <span>{cart[item.id]?.qty || 0}</span>
                      <button onClick={() => add(item, 1)}>+</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <div className="cart-bar" style={{ display: cartCount ? 'flex' : 'none' }}>
        <div>{cartCount} items • ₹{cartTotal}</div>
        <button className="ordr-btn" onClick={place}>View Cart & Order</button>
      </div>
    </div>
  );
}
