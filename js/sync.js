(function (window) {
  'use strict';

  const STORAGE_KEY = 'ordr_state_v2';
  const ROLE_KEY = 'ordr_user_role';
  const CHANNEL_NAME = 'ordr_realtime_v2';

  const now = () => new Date().toISOString();
  const minutesAgo = (mins) => new Date(Date.now() - mins * 60000).toISOString();

  const menu = [
    { id: 'st1', name: 'Paneer Tikka', category: 'starter', cuisine: 'Indian', dietary: 'veg', price: 249, prepTime: 12, special: true, loved: true, description: 'Charcoal-grilled paneer with spices and mint.', image: 'assets/app1.jpg', available: true },
    { id: 'st2', name: 'Hara Bhara Kebab', category: 'starter', cuisine: 'Indian', dietary: 'veg', price: 199, prepTime: 10, special: false, loved: true, description: 'Spinach and potato kebabs with green chutney.', image: 'assets/app2.jpg', available: true },
    { id: 'st3', name: 'Chicken Wings', category: 'starter', cuisine: 'Indian', dietary: 'non-veg', price: 299, prepTime: 14, special: false, loved: true, description: 'Crispy wings tossed in house spice glaze.', image: 'assets/app3.jpg', available: true },
    { id: 'mc1', name: 'Paneer Butter Masala', category: 'main', cuisine: 'Indian', dietary: 'veg', price: 319, prepTime: 18, special: true, loved: true, description: 'Creamy tomato gravy with soft paneer cubes.', image: 'assets/main1.jpg', available: true },
    { id: 'mc2', name: 'Butter Chicken', category: 'main', cuisine: 'Mughlai', dietary: 'non-veg', price: 399, prepTime: 20, special: true, loved: true, description: 'Tender chicken in rich butter gravy.', image: 'assets/main2.jpg', available: true },
    { id: 'mc3', name: 'Dal Makhani', category: 'main', cuisine: 'Indian', dietary: 'veg', price: 289, prepTime: 18, special: false, loved: false, description: 'Slow-cooked black lentils finished with cream.', image: 'assets/main3.jpg', available: true },
    { id: 'br1', name: 'Garlic Naan', category: 'bread', cuisine: 'Indian', dietary: 'veg', price: 79, prepTime: 8, special: false, loved: true, description: 'Soft naan brushed with garlic butter.', image: 'assets/dess1.jpg', available: true },
    { id: 'ri1', name: 'Chicken Biryani', category: 'rice', cuisine: 'Indian', dietary: 'non-veg', price: 349, prepTime: 22, special: true, loved: true, description: 'Fragrant basmati rice layered with spiced chicken.', image: 'assets/dess2.jpg', available: true },
    { id: 'cn1', name: 'Veg Manchurian', category: 'chinese', cuisine: 'Chinese', dietary: 'veg', price: 269, prepTime: 14, special: false, loved: true, description: 'Crispy vegetable dumplings in soy garlic sauce.', image: 'assets/dess3.jpg', available: true },
    { id: 'ds1', name: 'Gulab Jamun', category: 'dessert', cuisine: 'Indian', dietary: 'veg', price: 129, prepTime: 6, special: false, loved: true, description: 'Warm milk dumplings in rose syrup.', image: 'assets/bev1.jpg', available: true },
    { id: 'bv1', name: 'Lassi', category: 'beverage', cuisine: 'Indian', dietary: 'veg', price: 99, prepTime: 4, special: false, loved: false, description: 'Chilled yogurt drink with saffron.', image: 'assets/bev2.jpg', available: true },
    { id: 'bv2', name: 'Cold Coffee', category: 'beverage', cuisine: 'Italian', dietary: 'veg', price: 149, prepTime: 5, special: false, loved: true, description: 'Espresso, milk, and ice cream.', image: 'assets/bev3.jpg', available: true }
  ];

  const tables = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    label: `Table ${i + 1}`,
    capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
    status: i < 3 ? 'occupied' : 'available',
    guestName: i < 3 ? ['Alex Johnson', 'Priya Shah', 'Karan Mehta'][i] : '',
    zone: i < 4 ? 'A' : i < 8 ? 'B' : 'C'
  }));

  const inventory = {
    'Chicken Breast': { qty: 2.4, unit: 'kg', min: 3 },
    'Paneer': { qty: 4.2, unit: 'kg', min: 2 },
    'Basmati Rice': { qty: 12, unit: 'kg', min: 5 },
    'Cream': { qty: 5.5, unit: 'ltr', min: 2 },
    'Tomato': { qty: 14, unit: 'kg', min: 8 },
    'Oil': { qty: 18, unit: 'ltr', min: 10 }
  };

  const orders = [
    { id: 'ORD-1042', tableId: 2, guestName: 'Alex Johnson', status: 'preparing', createdAt: minutesAgo(18), items: [{ id: 'mc2', name: 'Butter Chicken', price: 399, qty: 1, instructions: 'Less spicy' }, { id: 'br1', name: 'Garlic Naan', price: 79, qty: 2, instructions: '' }], servedAt: null },
    { id: 'ORD-1043', tableId: 5, guestName: 'Priya Shah', status: 'ready', createdAt: minutesAgo(14), items: [{ id: 'mc1', name: 'Paneer Butter Masala', price: 319, qty: 1, instructions: 'No cashew garnish' }], servedAt: null },
    { id: 'ORD-1044', tableId: 8, guestName: 'Karan Mehta', status: 'placed', createdAt: minutesAgo(6), items: [{ id: 'st1', name: 'Paneer Tikka', price: 249, qty: 2, instructions: 'Extra spicy' }], servedAt: null }
  ];

  const waitlist = [
    { id: 'WL-1', name: 'Rohan Verma', phone: '+91 98765 12345', partySize: 4, joinedAt: minutesAgo(25), eta: 12 },
    { id: 'WL-2', name: 'Sneha Kapoor', phone: '+91 98112 44332', partySize: 2, joinedAt: minutesAgo(9), eta: 6 }
  ];

  const reviews = [
    { id: 'REV-1', guestName: 'Karan Mehta', foodRating: 5, chefRating: 5, waiterRating: 4, comment: 'Food was on point and service was quick.', tip: 100, createdAt: minutesAgo(30) }
  ];

  const defaultState = {
    menu,
    tables,
    inventory,
    orders,
    waitlist,
    reviews,
    alerts: [],
    userRole: localStorage.getItem(ROLE_KEY) || 'Guest'
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('ORDR state load failed', e);
    }
    return structuredClone(defaultState);
  }

  let state = loadState();
  const listeners = new Set();
  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;

  function persist(action) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (bc) bc.postMessage({ action, state });
    listeners.forEach((fn) => fn(state, action));
  }

  if (bc) {
    bc.onmessage = (event) => {
      if (event.data && event.data.state) {
        state = event.data.state;
        listeners.forEach((fn) => fn(state, event.data.action || 'broadcast'));
      }
    };
  }

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      state = loadState();
      listeners.forEach((fn) => fn(state, 'storage'));
    }
  });

  function getTableById(tableId) {
    return state.tables.find((t) => t.id === Number(tableId));
  }

  function getOrderById(orderId) {
    return state.orders.find((o) => o.id === orderId);
  }

  function enqueueAlert(type, message) {
    state.alerts.unshift({ id: `${type}-${Date.now()}`, type, message, createdAt: now(), resolved: false });
  }

  window.OrdrSync = {
    getState() {
      return state;
    },
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    setUserRole(role) {
      state.userRole = role;
      localStorage.setItem(ROLE_KEY, role);
      persist('role-change');
    },
    placeOrder(tableId, cartItems, guestName) {
      const order = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        tableId: Number(tableId),
        guestName: guestName || `Table ${tableId} Guest`,
        status: 'placed',
        createdAt: now(),
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          qty: Number(item.qty),
          instructions: item.instructions || ''
        })),
        servedAt: null
      };
      state.orders.unshift(order);
      const table = getTableById(tableId);
      if (table) table.status = 'occupied';
      enqueueAlert('order', `New order ${order.id} for Table ${tableId}`);
      persist('new-order');
      return order;
    },
    updateOrderStatus(orderId, newStatus) {
      const order = getOrderById(orderId);
      if (!order) return null;
      order.status = newStatus;
      if (newStatus === 'served') order.servedAt = now();
      if (newStatus === 'ready') {
        enqueueAlert('ready', `Order ${orderId} is ready for pickup`);
      }
      persist('order-status');
      return order;
    },
    addToWaitlist(name, phone, partySize, notes) {
      const entry = {
        id: `WL-${Math.floor(100 + Math.random() * 900)}`,
        name,
        phone,
        partySize: Number(partySize),
        notes: notes || '',
        joinedAt: now(),
        eta: Math.max(5, waitlist.length * 4 + 4)
      };
      state.waitlist.push(entry);
      persist('waitlist-add');
      return entry;
    },
    seatPartyManual(waitlistId, tableId) {
      const idx = state.waitlist.findIndex((w) => w.id === waitlistId);
      const table = getTableById(tableId);
      if (idx < 0 || !table || table.status !== 'available') return false;
      const party = state.waitlist[idx];
      table.status = 'occupied';
      table.guestName = party.name;
      state.waitlist.splice(idx, 1);
      enqueueAlert('seat', `Seat ${party.name} at Table ${table.label}`);
      persist('manual-seat');
      return true;
    },
    autoSeatNextParty() {
      if (!state.waitlist.length) return { success: false, message: 'Waitlist is empty.' };
      const party = state.waitlist[0];
      const table = state.tables.find((t) => t.status === 'available' && t.capacity >= party.partySize);
      if (!table) return { success: false, message: 'No matching table available.' };
      table.status = 'reserved';
      table.guestName = party.name;
      state.waitlist.shift();
      persist('auto-seat');
      return { success: true, partyName: party.name, tableId: table.id };
    },
    toggleDishStock(dishId) {
      const dish = state.menu.find((d) => d.id === dishId);
      if (!dish) return;
      dish.available = !dish.available;
      persist('stock-toggle');
    },
    resetTable(tableId) {
      const table = getTableById(tableId);
      if (!table) return;
      table.status = 'available';
      table.guestName = '';
      persist('table-reset');
    },
    resolveAlert(alertId) {
      const alert = state.alerts.find((a) => a.id === alertId);
      if (alert) {
        alert.resolved = true;
        persist('alert-resolve');
      }
    },
    submitReview(review) {
      state.reviews.unshift({
        id: `REV-${Math.floor(1000 + Math.random() * 9000)}`,
        guestName: review.guestName || 'Guest',
        foodRating: Number(review.foodRating),
        chefRating: Number(review.chefRating),
        waiterRating: Number(review.waiterRating),
        comment: review.comment || '',
        tip: Number(review.tip || 0),
        createdAt: now()
      });
      persist('review-add');
    },
    getDashboardStats() {
      const revenue = state.orders.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.price * item.qty, 0), 0);
      const activeOrders = state.orders.filter((o) => o.status !== 'served').length;
      const occupiedTables = state.tables.filter((t) => t.status !== 'available').length;
      const lowStock = Object.entries(state.inventory).filter(([, item]) => item.qty <= item.min).length;
      return { revenue, activeOrders, occupiedTables, lowStock };
    }
  };
})(window);
