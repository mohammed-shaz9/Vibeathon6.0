import React, { useEffect, useState } from 'react';
import { apiGet } from '../../shared/api';
import { useRealtime } from '../../shared/useRealtime';

export default function HostPage() {
  const [tables, setTables] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const load = async () => { const [t, w] = await Promise.all([apiGet('/api/tables'), apiGet('/api/waitlist')]); setTables(t.tables || []); setWaitlist(w.waitlist || []); };
  useEffect(() => { load().catch(() => {}); }, []);
  useRealtime((msg) => { if (msg.type === 'table_update' || msg.type === 'waitlist_update' || msg.type === 'poll') load(); });
  return <div className="app-shell"><main className="ordr-page-wrapper"><div className="container"><div className="ordr-card">Host stand</div></div></main></div>;
}
