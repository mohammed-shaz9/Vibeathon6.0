const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');

function ensureDbExists() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    const initialData = { orders: [], waitlist: [], reviews: [], inventory: [] };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
  }
}

function loadDatabase() {
  ensureDbExists();
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { orders: [], waitlist: [], reviews: [], inventory: [] };
  }
}

function saveDatabase(data) {
  ensureDbExists();
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error persisting database to disk:', e.message);
  }
}

module.exports = { loadDatabase, saveDatabase };
