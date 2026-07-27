import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../shared/api';
import { useRealtime } from '../../shared/useRealtime';

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const load = async () => setOrders((await apiGet('/api/orders')).orders || []);
  useEffect(() => { load().catch(() => {}); }, []);
  useRealtime((msg) => { if (msg.type === 'new_order' || msg.type === 'order_update' || msg.type === 'poll') load(); });
  return <div className="app-shell"><main className="ordr-page-wrapper"><div className="container">{orders.map((o) => <div key={o.id} className="ordr-card" style={{ marginBottom: 12 }}><strong>Table {o.table_id || o.tableId}</strong><div>{o.status}</div><button onClick={() => apiPost(`/api/orders/${o.id}/status`, { status: 'received' }, 'PATCH').then(load)}>Accept</button></div>)}</div></main></div>;
}
