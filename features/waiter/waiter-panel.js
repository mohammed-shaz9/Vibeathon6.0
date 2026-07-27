(function () {
  const root = document.getElementById('waiterRoot');
  let delivered = Number(localStorage.getItem('ordr_delivered_today') || 0);
  let orders = [];
  let ws = null;
  let pollTimer = null;

  function render() {
    const ready = orders.filter(o => o.status === 'ready');
    root.innerHTML = `
      <div class="waiter-counter">Orders delivered today: ${delivered}</div>
      <div class="waiter-actions"><button id="refreshBtn">Refresh</button></div>
      ${ready.length ? ready.map(order => `
        <article class="waiter-card" data-id="${order.id}">
          <div class="table-num">Table ${order.table_id || order.tableId}</div>
          <div class="customer">${order.customer_name || order.guestName || ''}</div>
          <div class="items">${(order.order_items || order.items || []).map(i => `${i.name} ×${i.quantity || i.qty || 1}`).join('<br>')}</div>
          <button class="deliver-btn" data-id="${order.id}">Go Deliver</button>
        </article>
      `).join('') : `<div class="empty-state">No orders ready for delivery. Great job!</div>`}
    `;
    document.getElementById('refreshBtn').onclick = load;
    root.querySelectorAll('.deliver-btn').forEach(btn => btn.addEventListener('click', async () => {
      await fetch(`/api/orders/${btn.dataset.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'served' }) });
      delivered += 1;
      localStorage.setItem('ordr_delivered_today', String(delivered));
      const card = btn.closest('.waiter-card');
      card.style.opacity = '0';
      setTimeout(() => card.remove(), 300);
      render();
    }));
  }

  async function load() {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      orders = data.orders || [];
      render();
    } catch {
      root.innerHTML = `<div class="error-inline">Failed to load. Please refresh.</div>`;
    }
  }

  function connectWs() {
    try {
      ws = new WebSocket(`ws://${location.host}`);
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'order_update' && msg.status === 'ready') { load(); }
      };
      ws.onerror = startPolling;
      ws.onclose = startPolling;
    } catch { startPolling(); }
  }

  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(load, 5000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    load();
    connectWs();
  });
})();
