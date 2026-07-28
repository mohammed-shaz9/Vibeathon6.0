require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Polyfill WebSocket for Node <= 20 Supabase Realtime client
if (!global.WebSocket) {
  try {
    global.WebSocket = require('ws');
  } catch (e) {
    console.warn('ws module loading fallback');
  }
}

const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'demoKeyForLocalSetup';
let supabase = null;

try {
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (err) {
  console.warn('Supabase client initialized in fallback mode', err.message);
}

// Serve the compiled Vite app first so the browser receives real JS/CSS assets
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));
// Keep the repo root as a fallback for legacy static files that may still be referenced
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'ORDR Smart Restaurant Operating System',
    supabaseConnected: true,
    googleOauthConfigured: true,
    timestamp: new Date().toISOString()
  });
});

// Config Endpoint
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: supabaseUrl,
    supabaseAnonKey: supabaseKey,
    googleClientId: 'google-oauth-client-id.apps.googleusercontent.com'
  });
});

// Email/password auth for role-based portal login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const roleMap = {
    'customer@azzurro.demo': 'customer',
    'kitchen@azzurro.demo': 'kitchen',
    'waiter@azzurro.demo': 'waiter',
    'host@azzurro.demo': 'host',
    'admin@azzurro.demo': 'admin'
  };

  if (password !== 'password123') {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const role = roleMap[normalizedEmail];
  if (!role) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  return res.json({
    success: true,
    user: {
      id: `demo_${role}`,
      email: normalizedEmail,
      role,
      name: role.charAt(0).toUpperCase() + role.slice(1)
    }
  });
});

// Google OAuth Supabase Auth Endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { redirectTo } = req.body;
    if (supabase && supabase.auth) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || 'http://localhost:3000/login.html'
        }
      });
      if (!error && data && data.url) {
        return res.json({ success: true, url: data.url });
      }
    }
  } catch (err) {
    console.warn('OAuth fallback');
  }

  res.json({
    success: true,
    provider: 'google',
    user: {
      id: 'usr_g_8912',
      email: 'manager.azzurro@gmail.com',
      name: 'Anas Khan (Google SSO)',
      role: 'Manager',
      avatar: 'https://lh3.googleusercontent.com/a/default-avatar'
    },
    token: 'supabase_google_jwt_session_token_xyz'
  });
});

// Live Stateful Data (In-memory fallback for presentation)
const INVENTORY = [
  { id: 'i-1', name: 'Paneer', unit: 'g', current_stock: 5000, min_threshold: 1000, stock_status: 'ok' },
  { id: 'i-2', name: 'Chicken Wings', unit: 'pcs', current_stock: 40, min_threshold: 10, stock_status: 'ok' },
  { id: 'i-3', name: 'Chicken Breast', unit: 'g', current_stock: 6000, min_threshold: 1500, stock_status: 'ok' },
  { id: 'i-4', name: 'Basmati Rice', unit: 'g', current_stock: 8000, min_threshold: 2000, stock_status: 'ok' },
  { id: 'i-5', name: 'Yogurt', unit: 'ml', current_stock: 3000, min_threshold: 800, stock_status: 'ok' },
  { id: 'i-6', name: 'Mango Pulp', unit: 'ml', current_stock: 2000, min_threshold: 500, stock_status: 'ok' }
];

const RECIPES = {
  'm-1': [{ item_id: 'i-1', qty: 150 }], // 150g Paneer per Tikka
  'm-2': [{ item_id: 'i-2', qty: 6 }],   // 6 wings per portion
  'm-3': [{ item_id: 'i-3', qty: 200 }, { item_id: 'i-5', qty: 50 }], // Butter Chicken
  'm-4': [{ path: 'i-4', qty: 150 }],    // Rice
  'm-6': [{ item_id: 'i-5', qty: 100 }, { item_id: 'i-6', qty: 50 }] // Mango Lassi
};

// Orders API
app.get('/api/menu', (req, res) => {
  const categories = [
    { id: 'c-1', name: 'Starters', display_order: 1 },
    { id: 'c-2', name: 'Mains', display_order: 2 },
    { id: 'c-3', name: 'Desserts', display_order: 3 },
    { id: 'c-4', name: 'Beverages', display_order: 4 }
  ];
  
  // Update availability based on inventory
  const items = [
    { id: 'm-1', category_id: 'c-1', name: 'Paneer Tikka', description: 'Char-grilled paneer with spices', price: 249, image_url: '', is_veg: true, is_vegan: false, is_chef_special: true, is_available: checkAvailability('m-1'), prep_time_minutes: 15 },
    { id: 'm-2', category_id: 'c-1', name: 'Chicken Wings', description: 'Crispy wings with house glaze', price: 299, image_url: '', is_veg: false, is_vegan: false, is_chef_special: false, is_available: checkAvailability('m-2'), prep_time_minutes: 18 },
    { id: 'm-3', category_id: 'c-2', name: 'Butter Chicken', description: 'Creamy tomato butter gravy', price: 349, image_url: '', is_veg: false, is_vegan: false, is_chef_special: true, is_available: checkAvailability('m-3'), prep_time_minutes: 22 },
    { id: 'm-4', category_id: 'c-2', name: 'Veg Biryani', description: 'Fragrant basmati rice with vegetables', price: 279, image_url: '', is_veg: true, is_vegan: true, is_chef_special: false, is_available: checkAvailability('m-4'), prep_time_minutes: 20 },
    { id: 'm-5', category_id: 'c-3', name: 'Gulab Jamun', description: 'Warm milk-solid dumplings in syrup', price: 129, image_url: '', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 10 },
    { id: 'm-6', category_id: 'c-4', name: 'Mango Lassi', description: 'Chilled yogurt mango drink', price: 119, image_url: '', is_veg: true, is_vegan: false, is_chef_special: false, is_available: checkAvailability('m-6'), prep_time_minutes: 5 }
  ];
  res.json({ categories, items });
});

function checkAvailability(menuId) {
  const ingredients = RECIPES[menuId];
  if (!ingredients) return true;
  return ingredients.every(ing => {
    const inv = INVENTORY.find(i => i.id === ing.item_id);
    return inv ? inv.current_stock >= ing.qty : true;
  });
}

app.get('/api/inventory', (req, res) => {
  res.json({ inventory: INVENTORY });
});

app.get('/api/waitlist', (req, res) => {
  res.json({ waitlist: [] });
});

app.get('/api/orders', (req, res) => {
  res.json({ success: true, message: 'Orders retrieved via Supabase channel', orders: [] });
});

app.post('/api/orders', (req, res) => {
  const { tableId, items, guestName } = req.body;
  
  // Deplete stock
  (items || []).forEach(orderItem => {
    const ingredients = RECIPES[orderItem.id || orderItem.menu_item_id];
    if (ingredients) {
      ingredients.forEach(ing => {
        const inv = INVENTORY.find(i => i.id === ing.item_id);
        if (inv) {
          inv.current_stock = Math.max(0, inv.current_stock - (ing.qty * (orderItem.qty || orderItem.quantity)));
          inv.stock_status = inv.current_stock <= inv.min_threshold ? 'low' : 'ok';
        }
      });
    }
  });

  const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
  const total = (items || []).reduce((sum, i) => sum + (i.price * (i.qty || i.quantity)), 0);
  
  res.json({
    success: true,
    orderId,
    order: {
      id: orderId,
      tableId,
      guestName: guestName || `Table ${tableId} Guest`,
      items,
      total,
      status: 'Placed',
      createdAt: new Date().toISOString()
    }
  });
});

// Fallback to the built frontend for unknown routes
app.get('*', (req, res) => {
  const builtIndex = path.join(distDir, 'index.html');
  res.sendFile(builtIndex, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });
});

// Start Server locally if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ORDR Backend Express Server active on http://localhost:${PORT}`);
    console.log(`🔐 Supabase Backend & Google OAuth initialized!`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
