require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');
const { createClient } = require('@supabase/supabase-js');
const os = require('os');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const { cacheGet, cacheSet, cacheDel } = require('./server/cache');
const { loadDatabase, saveDatabase } = require('./server/db');
const { computeAnalyticsPipeline } = require('./server/pipeline');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Persistent database loading
const initialDb = loadDatabase();
const ORDERS = initialDb.orders || [];
const TABLES = Array.from({length: 12}, (_, i) => ({id: `t-${i+1}`, table_number: i+1, capacity: i < 4 ? 2 : i < 8 ? 4 : 6, status: 'available'}));
const WAITLIST = initialDb.waitlist || [];
const REVIEWS = initialDb.reviews || [];

const INVENTORY = [
  { id: 'i-1', name: 'Paneer', unit: 'g', current_stock: 5000, min_threshold: 1000, stock_status: 'ok' },
  { id: 'i-2', name: 'Chicken Wings', unit: 'pcs', current_stock: 40, min_threshold: 10, stock_status: 'ok' },
  { id: 'i-3', name: 'Chicken Breast', unit: 'g', current_stock: 6000, min_threshold: 1500, stock_status: 'ok' },
  { id: 'i-4', name: 'Basmati Rice', unit: 'g', current_stock: 8000, min_threshold: 2000, stock_status: 'ok' },
  { id: 'i-5', name: 'Yogurt', unit: 'ml', current_stock: 3000, min_threshold: 800, stock_status: 'ok' },
  { id: 'i-6', name: 'Mango Pulp', unit: 'ml', current_stock: 2000, min_threshold: 500, stock_status: 'ok' },
  { id: 'i-7', name: 'Mushrooms', unit: 'g', current_stock: 3000, min_threshold: 500, stock_status: 'ok' },
  { id: 'i-8', name: 'Lamb Mince', unit: 'g', current_stock: 4000, min_threshold: 1000, stock_status: 'ok' },
  { id: 'i-9', name: 'Black Lentils', unit: 'g', current_stock: 5000, min_threshold: 1000, stock_status: 'ok' },
  { id: 'i-10', name: 'Salmon', unit: 'g', current_stock: 3000, min_threshold: 800, stock_status: 'ok' },
  { id: 'i-11', name: 'Spinach', unit: 'g', current_stock: 4000, min_threshold: 800, stock_status: 'ok' },
  { id: 'i-12', name: 'Mascarpone', unit: 'g', current_stock: 2000, min_threshold: 500, stock_status: 'ok' },
  { id: 'i-13', name: 'Chocolate', unit: 'g', current_stock: 3000, min_threshold: 600, stock_status: 'ok' },
  { id: 'i-14', name: 'Limes', unit: 'pcs', current_stock: 100, min_threshold: 20, stock_status: 'ok' },
  { id: 'i-15', name: 'Tea Leaves', unit: 'g', current_stock: 2000, min_threshold: 400, stock_status: 'ok' }
];

const RECIPES = {
  'm-1': [{ item_id: 'i-1', qty: 150 }],
  'm-2': [{ item_id: 'i-2', qty: 6 }],
  'm-3': [{ item_id: 'i-3', qty: 200 }, { item_id: 'i-5', qty: 50 }],
  'm-4': [{ item_id: 'i-4', qty: 150 }],
  'm-6': [{ item_id: 'i-5', qty: 100 }, { item_id: 'i-6', qty: 50 }],
  'm-7': [{ item_id: 'i-7', qty: 100 }],
  'm-8': [{ item_id: 'i-8', qty: 150 }],
  'm-9': [{ item_id: 'i-9', qty: 100 }],
  'm-10': [{ item_id: 'i-10', qty: 200 }],
  'm-11': [{ item_id: 'i-11', qty: 150 }, { item_id: 'i-1', qty: 100 }],
  'm-12': [{ item_id: 'i-12', qty: 80 }],
  'm-13': [{ item_id: 'i-13', qty: 100 }],
  'm-14': [{ item_id: 'i-14', qty: 2 }],
  'm-15': [{ item_id: 'i-15', qty: 5 }]
};

// WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(data) {
  wss.clients.forEach(c => {
    if (c.readyState === 1) c.send(JSON.stringify(data));
  });
}

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'demoKeyForLocalSetup';
let supabase = null;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (err) {
  console.warn('Supabase client initialized in fallback mode', err.message);
}

const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));
// Serve static asset folders only, not raw legacy HTML files
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'ORDR Smart Restaurant Operating System',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/config', (req, res) => {
  const lanIp = getLocalIp();
  res.json({
    supabaseUrl: supabaseUrl,
    supabaseAnonKey: supabaseKey,
    lanIp: lanIp,
    port: 5173,
    baseUrl: `http://${lanIp}:5173`
  });
});

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

  if (password !== 'password123' || !roleMap[normalizedEmail]) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const role = roleMap[normalizedEmail];
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

function checkAvailability(menuId) {
  const ingredients = RECIPES[menuId];
  if (!ingredients) return true;
  return ingredients.every(ing => {
    const inv = INVENTORY.find(i => i.id === ing.item_id);
    return inv ? inv.current_stock >= ing.qty : true;
  });
}

// ETL Analytics Data Pipeline Endpoint
app.get('/api/analytics/pipeline', (req, res) => {
  const analytics = computeAnalyticsPipeline(ORDERS, INVENTORY, WAITLIST, REVIEWS);
  res.json(analytics);
});

// Menu API with Redis / LRU Cache Layer
app.get('/api/menu', async (req, res) => {
  const cachedMenu = await cacheGet('ordr:menu');
  if (cachedMenu) {
    return res.json(cachedMenu);
  }

  const categories = [
    { id: 'c-1', name: 'Starters', display_order: 1 },
    { id: 'c-2', name: 'Mains', display_order: 2 },
    { id: 'c-3', name: 'Desserts', display_order: 3 },
    { id: 'c-4', name: 'Beverages', display_order: 4 }
  ];
  
  const items = [
    // Starters (c-1)
    { id: 'm-1', category_id: 'c-1', name: 'Paneer Tikka', description: 'Char-grilled cottage cheese with spiced yogurt glaze', price: 249, image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500', is_veg: true, is_vegan: false, is_chef_special: true, is_available: true, prep_time_minutes: 15 },
    { id: 'm-2', category_id: 'c-1', name: 'Crispy Chicken Wings', description: 'Tossed in honey chili garlic sauce', price: 299, image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500', is_veg: false, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 18 },
    { id: 'm-7', category_id: 'c-1', name: 'Mushroom Bruschetta', description: 'Toasted sourdough with garlic mushrooms & truffle oil', price: 219, image_url: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=500', is_veg: true, is_vegan: true, is_chef_special: false, is_available: true, prep_time_minutes: 12 },
    { id: 'm-8', category_id: 'c-1', name: 'Lamb Seekh Kebab', description: 'Charcoal-grilled minced lamb skewers with mint chutney', price: 349, image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500', is_veg: false, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 16 },
    { id: 'm-16', category_id: 'c-1', name: 'Crispy Corn Chili Pepper', description: 'Sweet corn kernel wok-tossed with green chili', price: 199, image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500', is_veg: true, is_vegan: true, is_chef_special: false, is_available: true, prep_time_minutes: 10 },
    { id: 'm-17', category_id: 'c-1', name: 'Chicken Malai Tikka', description: 'Tender chicken marinated in cashew cream & cardamom', price: 329, image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500', is_veg: false, is_vegan: false, is_chef_special: true, is_available: true, prep_time_minutes: 18 },
    { id: 'm-18', category_id: 'c-1', name: 'Hara Bhara Kebab', description: 'Spinach and green pea patties with aromatic spices', price: 229, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500', is_veg: true, is_vegan: true, is_chef_special: false, is_available: true, prep_time_minutes: 12 },
    { id: 'm-19', category_id: 'c-1', name: 'Amritsari Fish Fry', description: 'Crispy carom-seed spiced river sole fritters', price: 379, image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500', is_veg: false, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 15 },
    { id: 'm-20', category_id: 'c-1', name: 'Veg Spring Rolls', description: 'Golden crunchy rolls stuffed with glass noodles & veggies', price: 189, image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', is_veg: true, is_vegan: true, is_chef_special: false, is_available: true, prep_time_minutes: 12 },
    { id: 'm-21', category_id: 'c-1', name: 'Tandoori Jumbo Prawns', description: 'Jumbo prawns charred in clay oven with red spices', price: 449, image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500', is_veg: false, is_vegan: false, is_chef_special: true, is_available: true, prep_time_minutes: 20 },
    { id: 'm-22', category_id: 'c-1', name: 'Loaded Cheese Nachos', description: 'Tortilla chips topped with melted cheddar, jalapeños & salsa', price: 239, image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 10 },
    { id: 'm-23', category_id: 'c-1', name: 'Dynamite Crispy Shrimp', description: 'Crispy fried shrimp coated in spicy sriracha mayo sauce', price: 399, image_url: 'https://images.unsplash.com/photo-1559742811-822863cc4530?w=500', is_veg: false, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 15 },

    // Mains (c-2)
    { id: 'm-3', category_id: 'c-2', name: 'Butter Chicken', description: 'Tender chicken in rich creamy tomato butter gravy', price: 349, image_url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500', is_veg: false, is_vegan: false, is_chef_special: true, is_available: true, prep_time_minutes: 22 },
    { id: 'm-4', category_id: 'c-2', name: 'Veg Dum Biryani', description: 'Fragrant long-grain basmati rice cooked with fresh veggies', price: 279, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500', is_veg: true, is_vegan: true, is_chef_special: false, is_available: true, prep_time_minutes: 20 },
    { id: 'm-9', category_id: 'c-2', name: 'Dal Makhani', description: 'Overnight slow-cooked black lentils in churned butter', price: 249, image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500', is_veg: true, is_vegan: false, is_chef_special: true, is_available: true, prep_time_minutes: 25 },
    { id: 'm-10', category_id: 'c-2', name: 'Tandoori Salmon Steak', description: 'Atlantic salmon fillet grilled with dill lemon herbs', price: 549, image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500', is_veg: false, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 20 },
    { id: 'm-11', category_id: 'c-2', name: 'Palak Paneer', description: 'Fresh cottage cheese cubes in silky garlic spinach puree', price: 269, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 18 },
    { id: 'm-24', category_id: 'c-2', name: 'Hyderabadi Chicken Biryani', description: 'Layered saffron rice with marinated chicken & fried onions', price: 349, image_url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500', is_veg: false, is_vegan: false, is_chef_special: true, is_available: true, prep_time_minutes: 22 },
    { id: 'm-25', category_id: 'c-2', name: 'Kadai Paneer', description: 'Paneer cubes cooked with bell peppers in coarsely ground spices', price: 279, image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 18 },
    { id: 'm-26', category_id: 'c-2', name: 'Mutton Rogan Josh', description: 'Traditional Kashmiri lamb curry braised with Kashmiri chilies', price: 429, image_url: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=500', is_veg: false, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 28 },
    { id: 'm-27', category_id: 'c-2', name: 'Thai Green Curry Veg', description: 'Coconut milk curry with kaffir lime, bamboo shoots & tofu', price: 299, image_url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500', is_veg: true, is_vegan: true, is_chef_special: false, is_available: true, prep_time_minutes: 20 },
    { id: 'm-28', category_id: 'c-2', name: 'Fettuccine Alfredo Chicken', description: 'Fresh fettuccine pasta in rich parmesan cream with grilled chicken', price: 339, image_url: 'https://images.unsplash.com/photo-1621996346565-e3def6164010?w=500', is_veg: false, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 18 },
    { id: 'm-29', category_id: 'c-2', name: 'Truffle Mushroom Risotto', description: 'Arborio rice simmered with wild mushrooms & black truffle butter', price: 389, image_url: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=500', is_veg: true, is_vegan: false, is_chef_special: true, is_available: true, prep_time_minutes: 25 },
    { id: 'm-30', category_id: 'c-2', name: 'Goan Prawn Curry', description: 'Tiger prawns simmered in tangy coconut & tamarind curry', price: 469, image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500', is_veg: false, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 22 },
    { id: 'm-31', category_id: 'c-2', name: 'Paneer Lababdar', description: 'Rich cottage cheese in tomato cashew gravy infused with fenugreek', price: 289, image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 18 },
    { id: 'm-32', category_id: 'c-2', name: 'Mutton Dum Biryani', description: 'Slow dum cooked lamb shoulder with long grain basmati rice', price: 449, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500', is_veg: false, is_vegan: false, is_chef_special: true, is_available: true, prep_time_minutes: 30 },

    // Desserts (c-3)
    { id: 'm-5', category_id: 'c-3', name: 'Gulab Jamun with Rabri', description: 'Warm cardamom dumplings served with saffron thickened milk', price: 139, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 8 },
    { id: 'm-12', category_id: 'c-3', name: 'Classic Tiramisu', description: 'Italian coffee dipped ladyfingers layered with mascarpone cream', price: 249, image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 8 },
    { id: 'm-13', category_id: 'c-3', name: 'Molten Lava Cake', description: 'Warm dark chocolate cake with gooey chocolate molten center', price: 279, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500', is_veg: true, is_vegan: false, is_chef_special: true, is_available: true, prep_time_minutes: 12 },
    { id: 'm-33', category_id: 'c-3', name: 'Kesari Rasmalai', description: 'Soft cottage cheese patties soaked in saffron pistachios milk', price: 149, image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 8 },
    { id: 'm-34', category_id: 'c-3', name: 'New York Cheesecake', description: 'Rich cream cheese cake on graham cracker crust with berry compote', price: 299, image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500', is_veg: true, is_vegan: false, is_chef_special: true, is_available: true, prep_time_minutes: 10 },
    { id: 'm-35', category_id: 'c-3', name: 'Saffron Mango Phirni', description: 'Traditional ground rice pudding flavored with green cardamom', price: 139, image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 8 },
    { id: 'm-36', category_id: 'c-3', name: 'Alphonso Mango Kulfi', description: 'Dense churned Indian ice cream infused with fresh mango pulp', price: 119, image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 5 },
    { id: 'm-37', category_id: 'c-3', name: 'Fudge Brownie Sizzler', description: 'Warm walnut brownie on sizzler plate with vanilla ice cream', price: 229, image_url: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 10 },
    { id: 'm-38', category_id: 'c-3', name: 'Crispy Churros & Chocolate', description: 'Spanish cinnamon sugar churros served with warm chocolate dip', price: 219, image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500', is_veg: true, is_vegan: true, is_chef_special: false, is_available: true, prep_time_minutes: 12 },
    { id: 'm-39', category_id: 'c-3', name: 'Pistachio Baklava', description: 'Flaky phyllo pastry layers with crushed pistachios & honey syrup', price: 239, image_url: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 8 },
    { id: 'm-40', category_id: 'c-3', name: 'Fresh Berries Fruit Tart', description: 'Pastry crust filled with vanilla pastry cream & seasonal berries', price: 179, image_url: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 8 },
    { id: 'm-41', category_id: 'c-3', name: 'Belgian Chocolate Gelato', description: 'Authentic Italian dark chocolate gelato scoop', price: 169, image_url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 5 },

    // Beverages (c-4)
    { id: 'm-6', category_id: 'c-4', name: 'Mango Lassi', description: 'Thick churned yogurt drink blend with Alphonso mangoes', price: 119, image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 5 },
    { id: 'm-14', category_id: 'c-4', name: 'Fresh Lemon Mint Soda', description: 'Sparkling soda pressed with fresh limes & crushed mint leaves', price: 89, image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', is_veg: true, is_vegan: true, is_chef_special: false, is_available: true, prep_time_minutes: 3 },
    { id: 'm-15', category_id: 'c-4', name: 'Cutting Masala Chai', description: 'Brewed Assam black tea simmered with ginger & green cardamom', price: 69, image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 5 },
    { id: 'm-42', category_id: 'c-4', name: 'Cold Coffee with Ice Cream', description: 'Blended espresso milk shake topped with vanilla ice cream scoop', price: 149, image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 5 },
    { id: 'm-43', category_id: 'c-4', name: 'Classic Virgin Mojito', description: 'Muddled fresh lime wedges, mint & white cane sugar topped with soda', price: 139, image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500', is_veg: true, is_vegan: true, is_chef_special: false, is_available: true, prep_time_minutes: 5 },
    { id: 'm-44', category_id: 'c-4', name: 'Watermelon Basil Cooler', description: 'Freshly pressed watermelon juice infused with basil seeds & lime', price: 129, image_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500', is_veg: true, is_vegan: true, is_chef_special: false, is_available: true, prep_time_minutes: 5 },
    { id: 'm-45', category_id: 'c-4', name: 'Wild Blueberry Smoothie', description: 'Greek yogurt blend with wild blueberries & chia seed swirl', price: 169, image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 5 },
    { id: 'm-46', category_id: 'c-4', name: 'Peach Iced Tea', description: 'Cold brewed black tea infused with sweet peach nectar', price: 119, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500', is_veg: true, is_vegan: true, is_chef_special: false, is_available: true, prep_time_minutes: 5 },
    { id: 'm-47', category_id: 'c-4', name: 'Thick Strawberry Milkshake', description: 'Fresh strawberry preserve blended with full cream milk', price: 159, image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500', is_veg: true, is_vegan: false, is_chef_special: false, is_available: true, prep_time_minutes: 5 },
    { id: 'm-48', category_id: 'c-4', name: 'Green Apple Detox Juice', description: 'Pressed green apple, celery, cucumber & lemon ginger tonic', price: 139, image_url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=500', is_veg: true, is_vegan: true, is_chef_special: false, is_available: true, prep_time_minutes: 5 },
    { id: 'm-49', category_id: 'c-4', name: 'Double Espresso Shot', description: 'Intense 100% Arabica roasted dark bean double shot espresso', price: 99, image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500', is_veg: true, is_vegan: true, is_chef_special: false, is_available: true, prep_time_minutes: 3 },
    { id: 'm-50', category_id: 'c-4', name: 'Sparkling Passion Fruit Mocktail', description: 'Tropical passionfruit pulp shaken with elderflower & sparkling tonic', price: 179, image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', is_veg: true, is_vegan: true, is_chef_special: true, is_available: true, prep_time_minutes: 5 }
  ];
  
  const payload = { categories: categories.map(c => ({...c, items: items.filter(i => i.category_id === c.id)})) };
  await cacheSet('ordr:menu', payload, 300); // 5 min TTL
  res.json(payload);
});

// Inventory API
app.get('/api/inventory', (req, res) => {
  res.json({ inventory: INVENTORY });
});

// Orders API
app.get('/api/orders', (req, res) => {
  res.json({ orders: ORDERS });
});

app.get('/api/orders/:id', (req, res) => {
  res.json({ order: ORDERS.find(o => o.id === req.params.id) });
});

app.post('/api/orders', (req, res) => {
  const { tableId, table_number, items, guestName, customer_name } = req.body;
  
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
  
  const order = {
    id: orderId,
    tableId,
    table_number,
    guestName: guestName || customer_name || `Guest`,
    customer_name: customer_name || guestName || `Guest`,
    items,
    total_amount: total,
    status: 'placed',
    created_at: new Date().toISOString()
  };
  ORDERS.push(order);
  saveDatabase({ orders: ORDERS, waitlist: WAITLIST, reviews: REVIEWS, inventory: INVENTORY });

  broadcast({ type: 'new_order', orderId });

  res.json({ success: true, orderId, order });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const order = ORDERS.find(o => o.id === req.params.id);
  if (order) {
    order.status = req.body.status;
    broadcast({ type: 'order_update', orderId: order.id, status: order.status });
    res.json({ success: true, order });
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Tables API
app.get('/api/tables', (req, res) => {
  res.json({ tables: TABLES });
});

app.patch('/api/tables/:id', (req, res) => {
  const table = TABLES.find(t => t.id === req.params.id);
  if (table) {
    Object.assign(table, req.body);
    broadcast({ type: 'table_update', tableId: table.id });
    res.json({ success: true, table });
  } else {
    res.status(404).json({ error: 'Table not found' });
  }
});

// Waitlist API
app.get('/api/waitlist', (req, res) => {
  res.json({ waitlist: WAITLIST });
});

app.post('/api/waitlist', (req, res) => {
  const { customer_name, customer_phone, party_size } = req.body;
  const entry = {
    id: 'w-' + Date.now(),
    customer_name,
    customer_phone,
    party_size,
    position: WAITLIST.length + 1,
    created_at: new Date().toISOString()
  };
  WAITLIST.push(entry);
  res.json({ success: true, waitlistEntry: entry });
});

// Reviews API
app.post('/api/reviews', (req, res) => {
  const review = {
    id: 'r-' + Date.now(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  REVIEWS.push(review);
  res.json({ success: true, review });
});

// AI Insights API
app.post('/api/ai/insights', (req, res) => {
  res.json({ insights: "Mock AI Insight: Sales are trending up! Keep pushing the Paneer Tikka." });
});

app.get('*', (req, res) => {
  const builtIndex = path.join(distDir, 'index.html');
  res.sendFile(builtIndex, (err) => {
    if (err) res.sendFile(path.join(__dirname, 'index.html'));
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ORDR Backend Express Server active on http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
