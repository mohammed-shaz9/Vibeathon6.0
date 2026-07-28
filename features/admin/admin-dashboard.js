(function () {
  const root = document.getElementById('adminRoot');
  async function load() {
    try {
      const [ordersRes, tablesRes, invRes] = await Promise.all([fetch('/api/orders'), fetch('/api/tables'), fetch('/api/inventory')]);
      const orders = (await ordersRes.json()).orders || [];
      const tables = (await tablesRes.json()).tables || [];
      const inventory = (await invRes.json()).inventory || [];
      const served = orders.filter(o => o.status === 'served');
      const revenue = served.reduce((s, o) => s + Number(o.total_amount || o.total || 0), 0);
      const total = orders.length;
      const avg = total ? revenue / total : 0;
      root.innerHTML = `
        <div class="admin-layout">
          <aside class="sidebar">
            <div class="nav-item active">Dashboard</div>
            <div class="nav-item">Inventory</div>
            <div class="nav-item">Staff</div>
            <div class="nav-item">Waitlist</div>
            <div class="nav-item">AI Insights</div>
          </aside>
          <section class="main-content">
            <div class="stat-row">
              <div class="stat-card">Revenue Today<br><strong>₹${revenue.toLocaleString('en-IN')}</strong></div>
              <div class="stat-card">Total Orders<br><strong>${total}</strong></div>
              <div class="stat-card">Active Tables<br><strong>${tables.filter(t=>t.status==='occupied').length}/${tables.length}</strong></div>
              <div class="stat-card">Avg Order Value<br><strong>₹${avg.toFixed(0)}</strong></div>
            </div>
            <div class="admin-panels">
              <div class="chart-area">Revenue chart placeholder</div>
              <div class="chart-area">Top dishes placeholder</div>
            </div>
            <div class="chart-area">
              <button id="reportBtn">Generate Report</button>
              <div id="reportBox"></div>
            </div>
            <div class="chart-area"><h3>Inventory</h3>${inventory.map(i=>`<div>${i.name} - ${i.stock_status || ''}</div>`).join('')}</div>
          </section>
        </div>`;
      document.getElementById('reportBtn').onclick = async () => {
        const res = await fetch('/api/ai/insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revenue, total_orders: total, top_dish: 'Paneer Tikka', low_stock_items: inventory.filter(i => i.stock_status !== 'ok').map(i => i.name) }) });
        const data = await res.json();
        document.getElementById('reportBox').textContent = data.insights || data.error || 'No report';
      };
    } catch {
      root.innerHTML = `<div class="error-inline">Failed to load. Please refresh.</div>`;
    }
  }
  document.addEventListener('DOMContentLoaded', load);
})();
