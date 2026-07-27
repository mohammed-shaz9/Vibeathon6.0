import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../shared/api';

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { apiGet('/api/orders').then((d) => setOrders(d.orders || [])); }, []);
  const revenue = orders.filter((o) => o.status === 'served').reduce((s, o) => s + Number(o.total_amount || o.total || 0), 0);
  return <div className="app-shell"><main className="ordr-page-wrapper"><div className="container"><div className="ordr-card">Revenue today: ₹{revenue}</div><button onClick={() => apiPost('/api/ai/insights', { revenue, total_orders: orders.length, top_dish: 'Paneer Tikka', low_stock_items: [] }).then(console.log)}>Generate Report</button></div></main></div>;
}
