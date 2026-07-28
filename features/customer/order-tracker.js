(function () {
  const statusMap = { placed: 0, received: 1, preparing: 2, ready: 3, served: 4 };
  const labels = ['Placed', 'Received', 'Preparing', 'Ready', 'Served'];
  const icons = ['📋', '📥', '🍳', '🔔', '✅'];
  const root = document.getElementById('trackerRoot');
  const orderId = new URLSearchParams(location.search).get('orderId');
  let order = null;
  let ws = null;
  let pollTimer = null;

  const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function renderEmpty(msg) {
    root.innerHTML = `<div class="empty-state">${msg}</div>`;
  }

  function renderConfetti() {
    return `<div class="confetti">${Array.from({ length: 18 }, (_, i) => `<span style="left:${(i * 5) % 100}%;animation-delay:${(i % 6) * 0.15}s"></span>`).join('')}</div>`;
  }

  function stageIndex(status) {
    return statusMap[status] ?? 0;
  }

  function elapsedMinutes() {
    if (!order?.created_at) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000));
  }

  function estimateRemaining() {
    const prep = Math.max(...(order?.order_items || order?.items || []).map((i) => Number(i.prep_time_minutes || i.prepTime || 10)), 10);
    return Math.max(0, prep - elapsedMinutes());
  }

  function render() {
    if (!order) return;
    const idx = stageIndex(order.status);
    const served = order.status === 'served';
    const remaining = estimateRemaining();
    const stages = labels.map((label, i) => {
      const cls = i < idx ? 'done' : i === idx ? 'current' : 'future';
      const icon = i < idx ? '✔' : icons[i];
      return `<div class="stage ${cls}"><div class="circle">${icon}</div><div class="label">${label}</div></div>`;
    }).join('<div class="connector"></div>');

    root.innerHTML = `
      ${served ? `<div class="served-hero fade-in">${renderConfetti()}<h2>Enjoy your meal!</h2><a class="review-link" href="/features/customer/review.html?orderId=${encodeURIComponent(order.id)}">Rate Your Experience</a></div>` : `<div class="progress-wrap">${stages}</div>`}
      <div class="summary-card fade-in">
        <div><strong>Table:</strong> ${escapeHtml(order.table_id || order.tableId || '')}</div>
        <div><strong>Total:</strong> ${money(order.total_amount || order.total || 0)}</div>
        <div><strong>Estimated prep:</strong> ${Math.max(...(order.order_items || order.items || []).map((i) => Number(i.prep_time_minutes || i.prepTime || 10)), 10)} min</div>
        <div><strong>Estimated time remaining:</strong> ${remaining} min</div>
        <div class="items-list"><strong>Items:</strong> ${(order.order_items || order.items || []).map((item) => `<div>${escapeHtml(item.name || item.menu_item_name || '')} ×${item.quantity || item.qty || 1}</div>`).join('')}</div>
      </div>
      <div class="tracker-actions">
        <button id="callWaiterBtn">Call Waiter</button>
        <span id="toast" class="toast"></span>
      </div>
    `;
    document.getElementById('callWaiterBtn').onclick = callWaiter;
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  async function loadOrder() {
    if (!orderId) return renderEmpty('No order found. <a href="/features/customer/order.html">Back to menu</a>');
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
      const data = await res.json();
      order = data.order;
      if (!order) return renderEmpty('No order found. <a href="/features/customer/order.html">Back to menu</a>');
      render();
    } catch {
      root.innerHTML = '<div class="error-inline">Failed to load. Please refresh.</div>';
    }
  }

  function connectWs() {
    try {
      ws = new WebSocket(`ws://${window.location.host}`);
      ws.onopen = () => ws.send(JSON.stringify({ type: 'subscribe_order', orderId }));
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'order_update' && String(msg.orderId) === String(orderId)) {
            order.status = msg.status;
            render();
          }
        } catch {}
      };
      ws.onerror = startPolling;
      ws.onclose = startPolling;
    } catch {
      startPolling();
    }
  }

  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(loadOrder, 5000);
  }

  function callWaiter() {
    try {
      if (ws && ws.readyState === 1) ws.send(JSON.stringify({ type: 'call_waiter', orderId }));
      toast('Waiter notified!');
    } catch {
      toast('Waiter notified!');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!orderId) return renderEmpty('No order found. <a href="/features/customer/order.html">Back to menu</a>');
    loadOrder();
    connectWs();
    setInterval(() => {
      if (order) render();
    }, 1000);
  });
})();
