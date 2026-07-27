require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3000;
const hasSupabaseConfig =
  /^https?:\/\//i.test(process.env.SUPABASE_URL || '') &&
  Boolean(process.env.SUPABASE_ANON_KEY) &&
  !process.env.SUPABASE_URL.includes('your_supabase_url_here');
const supabase = hasSupabaseConfig
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;
const clients = new Set();
const memory = {
  categories: [
    { id: 'cat-1', name: 'Starters Veg', display_order: 1 },
    { id: 'cat-2', name: 'Starters Non-Veg', display_order: 2 },
    { id: 'cat-3', name: 'Main Course Veg', display_order: 3 },
    { id: 'cat-4', name: 'Main Course Non-Veg', display_order: 4 },
    { id: 'cat-5', name: 'Breads', display_order: 5 },
    { id: 'cat-6', name: 'Rice & Biryani', display_order: 6 },
    { id: 'cat-7', name: 'Chinese', display_order: 7 },
    { id: 'cat-8', name: 'Desserts', display_order: 8 },
    { id: 'cat-9', name: 'Beverages', display_order: 9 }
  ],
  menu_items: [
    { id: 'm-1', category_id: 'cat-1', name: 'Paneer Tikka', description: 'Marinated paneer cubes grilled in tandoor', price: 249, image_url: '', cuisine_type: 'North Indian', is_veg: true, is_vegan: false, is_chef_special: true, is_available: true, allergens: ['dairy'], prep_time_minutes: 15 },
    { id: 'm-2', category_id: 'cat-4', name: 'Butter Chicken', description: 'Tender chicken in rich tomato butter sauce', price: 349, image_url: '', cuisine_type: 'North Indian', is_veg: false, is_vegan: false, is_chef_special: true, is_available: true, allergens: ['dairy', 'nuts'], prep_time_minutes: 20 },
    { id: 'm-3', category_id: 'cat-6', name: 'Chicken Biryani', description: 'Hyderabadi style biryani', price: 299, image_url: '', cuisine_type: 'Mughlai', is_veg: false, is_vegan: false, is_chef_special: true, is_available: true, allergens: ['nuts'], prep_time_minutes: 25 }
  ],
  tables: Array.from({ length: 10 }, (_, i) => ({ id: `t-${i + 1}`, table_number: i + 1, capacity: i < 2 ? 2 : i < 5 ? 4 : i < 8 ? 6 : 8, status: 'available', qr_code_url: '' })),
  orders: [],
  order_items: [],
  waitlist: [],
  ingredients: [
    { id: 'ing-1', name: 'Chicken Breast', unit: 'kg', current_stock: 8, min_threshold: 5, expiry_date: '2026-08-03' },
    { id: 'ing-2', name: 'Paneer', unit: 'kg', current_stock: 5, min_threshold: 3, expiry_date: '2026-08-05' }
  ],
  reviews: [],
  profiles: [
    { id: 'p-inventory', email: 'inventory@azzurro.demo', role: 'inventory', full_name: 'Inventory Manager' },
    { id: 'p-admin', email: 'admin@azzurro.demo', role: 'admin', full_name: 'Admin User' },
    { id: 'p-kitchen', email: 'kitchen@azzurro.demo', role: 'kitchen', full_name: 'Kitchen User' },
    { id: 'p-waiter', email: 'waiter@azzurro.demo', role: 'waiter', full_name: 'Waiter User' },
    { id: 'p-host', email: 'host@azzurro.demo', role: 'host', full_name: 'Host User' }
  ]
};

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});
app.use('/features', express.static(path.join(__dirname, 'features')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/shared', express.static(path.join(__dirname, 'shared')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(__dirname));

const broadcast = (payload) => {
  const message = JSON.stringify(payload);
  for (const client of clients) if (client.readyState === 1) client.send(message);
};

const q = async (fn, fallback) => {
  if (!supabase) return fallback();
  try {
    return await fn();
  } catch (e) {
    console.warn('Supabase query failed, using fallback:', e.message);
    return fallback();
  }
};

wss.on('connection', (ws) => {
  console.log('WebSocket connected');
  clients.add(ws);
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data?.type === 'ping') ws.send(JSON.stringify({ type: 'pong' }));
    } catch {}
  });
  ws.on('close', () => clients.delete(ws));
  ws.on('close', () => console.log('WebSocket disconnected'));
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return res.status(401).json({ error: error.message });
      const profile = await q(async () => {
        const result = await supabase.from('profiles').select('*').eq('email', email).single();
        return result.data;
      }, () => memory.profiles.find((p) => p.email === email));
      return res.json({ user: { email, role: profile?.role || 'guest' }, session: data.session?.access_token || null });
    }
    const demo = memory.profiles.find((p) => p.email === email && password === 'password123');
    if (!demo) return res.status(401).json({ error: 'Invalid credentials' });
    return res.json({ user: { email: demo.email, role: demo.role }, session: 'demo-session' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const email = req.query.email;
    const profile = supabase
      ? await q(async () => (await supabase.from('profiles').select('*').eq('email', email).single()).data, () => memory.profiles.find((p) => p.email === email))
      : memory.profiles.find((p) => p.email === email);
    res.json({ user: profile || null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/menu', async (req, res) => {
  try {
    if (supabase) {
      const categories = await q(async () => (await supabase.from('categories').select('*').order('display_order')).data, () => memory.categories);
      const items = await q(async () => (await supabase.from('menu_items').select('*, categories(*)')).data, () => memory.menu_items.map((item) => ({ ...item, categories: memory.categories.find((c) => c.id === item.category_id) })));
      const grouped = categories.map((category) => ({ ...category, items: items.filter((item) => item.category_id === category.id || item.categories?.id === category.id) }));
      return res.json({ categories: grouped, items });
    }
    const grouped = memory.categories.map((category) => ({ ...category, items: memory.menu_items.filter((item) => item.category_id === category.id) }));
    res.json({ categories: grouped, items: memory.menu_items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/tables', async (req, res) => {
  try {
    const tables = supabase ? await q(async () => (await supabase.from('tables').select('*').order('table_number')).data, () => memory.tables) : memory.tables;
    res.json({ tables });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/waitlist', async (req, res) => {
  try {
    const waitlist = supabase ? await q(async () => (await supabase.from('waitlist').select('*').eq('status', 'waiting').order('position')).data, () => memory.waitlist) : memory.waitlist;
    res.json({ waitlist });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const ingredients = supabase ? await q(async () => (await supabase.from('ingredients').select('*').order('name')).data, () => memory.ingredients) : memory.ingredients;
    const inventory = ingredients.map((item) => ({
      ...item,
      stock_status: item.current_stock <= item.min_threshold ? 'critical' : item.current_stock <= item.min_threshold * 2 ? 'low' : 'ok'
    }));
    res.json({ inventory });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = supabase ? await q(async () => (await supabase.from('orders').select('*, order_items(*), tables(*)').neq('status', 'served').order('created_at', { ascending: false })).data, () => memory.orders) : memory.orders;
    res.json({ orders });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = supabase ? await q(async () => (await supabase.from('orders').select('*, order_items(*), tables(*)').eq('id', req.params.id).single()).data, () => memory.orders.find((o) => o.id === req.params.id)) : memory.orders.find((o) => o.id === req.params.id);
    res.json({ order: order || null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { table_id, customer_name, customer_phone, dietary_preference, items = [], special_instructions } = req.body || {};
    const total_amount = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || item.qty || 1), 0);
    const orderId = `ORD-${Date.now()}`;
    const order = { id: orderId, table_id, customer_name, customer_phone, dietary_preference, total_amount, special_instructions, status: 'placed', created_at: new Date().toISOString(), items };
    if (supabase) {
      const inserted = await q(async () => (await supabase.from('orders').insert({
        table_id,
        customer_name,
        customer_phone,
        dietary_preference,
        total_amount,
        special_instructions,
        status: 'placed'
      }).select('*').single()).data, () => null);
      const orderRow = inserted || order;
      if (items.length) {
        await q(async () => supabase.from('order_items').insert(items.map((item) => ({
          order_id: orderRow.id || orderId,
          menu_item_id: item.menu_item_id || item.id,
          quantity: item.quantity || item.qty || 1,
          special_instructions: item.special_instructions || item.instructions || '',
          status: 'pending'
        }))), () => null);
      }
      await q(async () => supabase.from('tables').update({ status: 'occupied' }).eq('id', table_id), () => null);
      broadcast({ type: 'new_order', order: orderRow });
      return res.json({ orderId: orderRow.id || orderId, error: null });
    }
    memory.orders.unshift(order);
    memory.order_items.push(...items.map((item) => ({ order_id: orderId, menu_item_id: item.id, quantity: item.quantity || item.qty || 1, special_instructions: item.special_instructions || item.instructions || '', status: 'pending' })));
    const table = memory.tables.find((t) => String(t.table_number) === String(table_id) || t.id === table_id);
    if (table) table.status = 'occupied';
    broadcast({ type: 'new_order', order });
    res.json({ orderId, error: null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body || {};
    if (supabase) {
      await q(async () => supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', req.params.id), () => null);
      if (status === 'ready') {
        const waiter = await q(async () => (await supabase.from('profiles').select('*').eq('role', 'waiter').limit(1).single()).data, () => memory.profiles.find((p) => p.role === 'waiter'));
        if (waiter) await q(async () => supabase.from('orders').update({ assigned_waiter: waiter.id }).eq('id', req.params.id), () => null);
      }
    } else {
      const order = memory.orders.find((o) => o.id === req.params.id);
      if (order) order.status = status;
    }
    broadcast({ type: 'order_update', orderId: req.params.id, status });
    res.json({ success: true, error: null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/tables/:id', async (req, res) => {
  try {
    const { status } = req.body || {};
    if (supabase) await q(async () => supabase.from('tables').update({ status }).eq('id', req.params.id), () => null);
    else {
      const table = memory.tables.find((t) => t.id === req.params.id || String(t.table_number) === String(req.params.id));
      if (table) table.status = status;
    }
    broadcast({ type: 'table_update', tableId: req.params.id, status });
    res.json({ success: true, error: null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/waitlist', async (req, res) => {
  try {
    const { customer_name, customer_phone, party_size } = req.body || {};
    const position = supabase
      ? await q(async () => {
          const { data } = await supabase.from('waitlist').select('position').order('position', { ascending: false }).limit(1);
          return (data?.[0]?.position || 0) + 1;
        }, () => memory.waitlist.length + 1)
      : memory.waitlist.length + 1;
    const entry = { id: `WL-${Date.now()}`, customer_name, customer_phone, party_size, position, status: 'waiting', created_at: new Date().toISOString() };
    if (supabase) await q(async () => supabase.from('waitlist').insert(entry), () => null);
    else memory.waitlist.push(entry);
    broadcast({ type: 'waitlist_update', waitlist: entry });
    res.json({ waitlistId: entry.id, position, error: null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    if (supabase) await q(async () => supabase.from('reviews').insert(req.body), () => null);
    else memory.reviews.push({ id: `REV-${Date.now()}`, ...req.body });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ai/insights', async (req, res) => {
  try {
    const prompt = `Analyze restaurant operations and provide concise insights. Data: ${JSON.stringify(req.body || {})}`;
    if (!process.env.GEMINI_API_KEY) return res.json({ insights: 'AI key not configured. Summary unavailable.' });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (response.status === 429) return res.status(429).json({ error: 'AI service is busy. Please try again in a moment.' });
    if (!response.ok) return res.status(500).json({ error: 'AI is temporarily unavailable.' });
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n') || 'No insights returned.';
    res.json({ insights: text });
  } catch (e) {
    res.status(500).json({ error: e.name === 'AbortError' ? 'AI service timed out.' : 'AI is temporarily unavailable.' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: Date.now() }));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  server.close();
  wss.close();
  process.exit(0);
});

server.listen(PORT, () => console.log(`ORDR running on http://localhost:${PORT}`));
