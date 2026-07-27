import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../shared/api';
import { useRealtime } from '../../shared/useRealtime';

export default function WaiterPage() {
  const [orders, setOrders] = useState([]);
  const load = async () => setOrders((await apiGet('/api/orders')).orders?.filter((o) => o.status === 'ready') || []);
  useEffect(() => { load().catch(() => {}); }, []);
  useRealtime((msg) => { if (msg.type === 'order_update' || msg.type === 'poll') load(); });
  return <div className="app-shell"><main className="ordr-page-wrapper"><div className="container">{orders.map((o) => <div key={o.id} className="ordr-card"><strong>Table {o.table_id || o.tableId}</strong><button onClick={() => apiPost(`/api/orders/${o.id}/status`, { status: 'served' }, 'PATCH').then(load)}>Go Deliver</button></div>)}</div></main></div>;
}
