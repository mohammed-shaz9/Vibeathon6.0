(function () {
  const state = {
    categories: [],
    items: [],
    cart: new Map(),
    filter: 'all',
    ws: null,
    wsHealthy: false,
    pollTimer: null
  };

  const el = (id) => document.getElementById(id);
  const params = new URLSearchParams(window.location.search);
  const tablePrefill = params.get('table') || '';

  function money(n) {
    return `₹${Number(n || 0).toLocaleString('en-IN')}`;
  }

  async function safeFetch(url, opts) {
    try {
      const res = await fetch(url, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (err) {
      throw err;
    }
  }

  function renderSkeleton() {
    const root = el('menuRoot');
    root.innerHTML = `
      <div class="skeleton-grid">
        ${Array.from({ length: 6 }, () => '<div class="skeleton card-skel"></div>').join('')}
      </div>`;
  }

  function currentFilteredItems() {
    return state.items.filter((item) => {
      if (state.filter === 'veg') return item.is_veg;
      if (state.filter === 'nonveg') return !item.is_veg;
      if (state.filter === 'vegan') return item.is_vegan;
      return true;
    });
  }

  function groupedItems() {
    const groups = state.categories.map((category) => ({
      ...category,
      items: currentFilteredItems().filter((item) => item.category_id === category.id)
    })).filter((c) => c.items.length);
    return groups;
  }

  function cartSummary() {
    let count = 0;
    let total = 0;
    for (const item of state.cart.values()) {
      count += item.quantity;
      total += item.quantity * item.price;
    }
    return { count, total };
  }

  function updateCartBar() {
    const { count, total } = cartSummary();
    el('cartCount').textContent = `${count} items`;
    el('cartTotal').textContent = money(total);
    el('cartBar').style.display = count ? 'flex' : 'none';
  }

  function setQty(id, delta) {
    const item = state.items.find((x) => x.id === id);
    if (!item || !item.is_available) return;
    const existing = state.cart.get(id) || { ...item, quantity: 0 };
    existing.quantity = Math.max(0, existing.quantity + delta);
    if (!existing.quantity) state.cart.delete(id);
    else state.cart.set(id, existing);
    renderMenu();
    updateCartBar();
  }

  function badge(item) {
    const veg = item.is_veg ? '<span class="badge veg">VEG</span>' : '<span class="badge nonveg">NON-VEG</span>';
    const vegan = item.is_vegan ? '<span class="badge vegan">VEGAN</span>' : '';
    const special = item.is_chef_special ? '<span class="badge special">CHEF\'S SPECIAL</span>' : '';
    const stock = item.is_available ? '<span class="status ok">Available</span>' : '<span class="status out">Out of Stock</span>';
    return `${veg}${vegan}${special}${stock}`;
  }

  function renderMenu() {
    const root = el('menuRoot');
    const groups = groupedItems();
    if (!groups.length) {
      root.innerHTML = '<div class="empty-state">No items match this filter.</div>';
      return;
    }

    root.innerHTML = groups.map((group) => `
      <section class="menu-group" id="${group.name.replace(/\s+/g, '-').toLowerCase()}">
        <h2>${group.name}</h2>
        <div class="menu-grid">
          ${group.items.map((item) => {
            const qty = state.cart.get(item.id)?.quantity || 0;
            const disabled = !item.is_available ? 'disabled' : '';
            return `
              <article class="menu-card ${item.is_available ? '' : 'muted'}">
                <div class="img-ph">${item.image_url ? `<img src="${item.image_url}" alt="${item.name}">` : '🍽️'}</div>
                <div class="card-body">
                  <h3>${item.name}</h3>
                  <p class="desc">${item.description || ''}</p>
                  <div class="price-row"><span class="price">${money(item.price)}</span><span class="prep">${item.prep_time_minutes || 10} min</span></div>
                  <div class="badges">${badge(item)}</div>
                  <div class="qty-row">
                    <button type="button" class="qty-btn" data-action="dec" data-id="${item.id}">-</button>
                    <span class="qty">${qty}</span>
                    <button type="button" class="qty-btn" data-action="inc" data-id="${item.id}" ${disabled}>+</button>
                  </div>
                  <button class="add-btn" data-id="${item.id}" ${disabled}>Add to Cart</button>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `).join('');

    root.querySelectorAll('.qty-btn').forEach((btn) => {
      btn.addEventListener('click', () => setQty(btn.dataset.id, btn.dataset.action === 'inc' ? 1 : -1));
    });
    root.querySelectorAll('.add-btn').forEach((btn) => {
      btn.addEventListener('click', () => setQty(btn.dataset.id, 1));
    });
  }

  function renderFilters() {
    const filters = el('dietFilters');
    filters.innerHTML = [
      ['all', 'All'],
      ['veg', 'Veg Only'],
      ['nonveg', 'Non-Veg'],
      ['vegan', 'Vegan']
    ].map(([key, label]) => `<button class="filter-btn ${state.filter === key ? 'active' : ''}" data-filter="${key}">${label}</button>`).join('');
    filters.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
      state.filter = btn.dataset.filter;
      renderFilters();
      renderMenu();
    }));
  }

  function openModal() {
    const { total } = cartSummary();
    if (!total) return;
    el('orderModal').classList.add('open');
    el('tableNumber').value = tablePrefill;
  }

  async function confirmOrder() {
    const items = Array.from(state.cart.values()).map((item) => ({
      menu_item_id: item.id,
      quantity: item.quantity,
      special_instructions: item.special_instructions || ''
    }));
    const total = cartSummary().total;
    const payload = {
      table_id: el('tableNumber').value,
      customer_name: el('customerName').value,
      customer_phone: el('customerPhone').value,
      dietary_preference: el('dietaryPreference').value,
      total_amount: total,
      items,
      special_instructions: el('orderInstructions').value
    };
    const data = await safeFetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const orderId = data.orderId || data.order?.id;
    window.location.href = `/features/customer/tracker.html?orderId=${encodeURIComponent(orderId)}`;
  }

  async function loadMenu() {
    renderSkeleton();
    try {
      const data = await safeFetch('/api/menu');
      state.categories = data.categories || [];
      state.items = data.items || [];
      renderFilters();
      renderMenu();
      updateCartBar();
    } catch (err) {
      el('menuRoot').innerHTML = `<div class="error-inline">Failed to load. Please refresh.</div>`;
    }
  }

  function setupRealtime() {
    try {
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      state.ws = new WebSocket(`${protocol}//${location.host}`);
      state.ws.onopen = () => { state.wsHealthy = true; };
      state.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'order_update') return;
        } catch {}
      };
      state.ws.onerror = () => startPolling();
      state.ws.onclose = () => startPolling();
    } catch {
      startPolling();
    }
  }

  function startPolling() {
    if (state.pollTimer) return;
    state.pollTimer = setInterval(loadMenu, 5000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderFilters();
    loadMenu();
    setupRealtime();
    el('viewCartBtn').addEventListener('click', openModal);
    el('closeModal').addEventListener('click', () => el('orderModal').classList.remove('open'));
    el('confirmOrderBtn').addEventListener('click', () => confirmOrder().catch(() => {
      el('orderError').textContent = 'Failed to load. Please refresh.';
    }));
  });
})();
