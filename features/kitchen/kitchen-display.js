(function () {
  const root = document.getElementById('kitchenRoot');
  const timeEl = document.getElementById('kitchenTime');
  const countEl = document.getElementById('activeCount');
  let orders = [];
  let ws = null;
  let pollTimer = null;

  const statusColor = {
    placed: 'white',
    received: '#3B82F6',
    preparing: '#F59E0B',
    ready: '#10B981',
    served: '#EF4444'
  };

  const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const ago = (t) => `${Math.floor((Date.now() - new Date(t).getTime()) / 60000)} min ago`;

  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.frequency.value = 800;
      osc.type = 'sine';
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  function render() {
    const active = orders.filter(o => o.status !== 'served' && o.status !== 'cancelled');
    countEl.textContent = active.length;
    if (!active.length) {
      root.innerHTML = `<div class="empty-state">All caught up! No pending orders.</div>`;
      return;
    }
    root.innerHTML = active.map(order => {
      const mins = Math.floor((Date.now() - new Date(order.created_at || order.createdAt).getTime()) / 60000);
      const longest = Math.max(...(order.order_items || order.items || []).map(i => Number(i.prep_time_minutes || i.prepTime || 10)), 10);
      const delayed = mins > longest;
      const btn = order.status === 'placed' ? 'Accept' : order.status === 'received' ? 'Start Preparing' : 'Order Ready';
      const nextStatus = order.status === 'placed' ? 'received' : order.status === 'received' ? 'preparing' : 'ready';
      return `
        <article class="kds-card ${delayed ? 'delayed' : ''}" data-id="${order.id}" style="border-left-color:${delayed ? '#EF4444' : statusColor[order.status] || 'white'}">
          <div class="kds-top">
            <div class="table-num">Table ${order.table_id || order.tableId}</div>
            <div class="order-time">${ago(order.created_at || order.createdAt)}</div>
          </div>
          <div class="timer">${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}</div>
          <div class="items">
            ${(order.order_items || order.items || []).map(item => `<div class="item"><strong>${item.name}</strong> ×${item.quantity || item.qty || 1}<div class="mini">${item.special_instructions || item.instructions || ''}</div></div>`).join('')}
          </div>
          <div class="actions"><button data-next="${nextStatus}" data-id="${order.id}">${btn}</button></div>
          ${delayed ? '<div class="badge-delayed">DELAYED</div>' : ''}
        </article>`;
    }).join('');
    root.querySelectorAll('button[data-id]').forEach(btn => btn.addEventListener('click', async () => {
      await fetch(`/api/orders/${btn.dataset.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: btn.dataset.next }) });
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

  function tick() {
    const now = new Date();
    if (timeEl) timeEl.textContent = now.toLocaleTimeString();
    render();
  }

  function connectWs() {
    try {
      ws = new WebSocket(`ws://${location.host}`);
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'new_order') { orders.unshift(msg.order); beep(); render(); }
        if (msg.type === 'order_update') {
          const order = orders.find(o => String(o.id) === String(msg.orderId));
          if (order) order.status = msg.status;
          if (msg.status === 'served') setTimeout(() => { orders = orders.filter(o => String(o.id) !== String(msg.orderId)); render(); }, 30000);
          render();
        }
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
    tick();
    setInterval(tick, 1000);
  });
})();
