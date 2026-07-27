import React, { useEffect, useState } from 'react';
import { apiGet } from '../../shared/api';
import { useRealtime } from '../../shared/useRealtime';

export default function CustomerTrackerPage() {
  const orderId = new URLSearchParams(window.location.search).get('orderId');
  const [order, setOrder] = useState(null);
  const load = async () => { if (orderId) setOrder((await apiGet(`/api/orders/${orderId}`)).order); };
  useEffect(() => { load().catch(() => {}); }, [orderId]);
  useRealtime((msg) => { if (msg.type === 'order_update' && String(msg.orderId) === String(orderId)) load(); if (msg.type === 'poll') load(); });
  return <div className="app-shell"><main className="ordr-page-wrapper"><div className="container"><div className="ordr-card">{order ? <div>Order {order.id} - {order.status}</div> : 'No order found'}</div></div></main></div>;
}
