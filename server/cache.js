const Redis = require('ioredis');

// Fallback in-memory TTL LRU Cache if Redis server is offline
class MemoryCache {
  constructor() {
    this.cache = new Map();
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  set(key, value, ttlSeconds = 60) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }
  del(key) {
    this.cache.delete(key);
  }
  flush() {
    this.cache.clear();
  }
}

let redisClient = null;
const memCache = new MemoryCache();

try {
  redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 1
  });
  redisClient.connect().catch(() => {
    console.log('⚡ Redis offline — Falling back to high-performance in-memory TTL cache manager');
    redisClient = null;
  });
} catch (e) {
  redisClient = null;
}

async function cacheGet(key) {
  if (redisClient && redisClient.status === 'ready') {
    try {
      const val = await redisClient.get(key);
      return val ? JSON.parse(val) : null;
    } catch {}
  }
  return memCache.get(key);
}

async function cacheSet(key, value, ttl = 60) {
  if (redisClient && redisClient.status === 'ready') {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
      return;
    } catch {}
  }
  memCache.set(key, value, ttl);
}

async function cacheDel(key) {
  if (redisClient && redisClient.status === 'ready') {
    try { await redisClient.del(key); } catch {}
  }
  memCache.del(key);
}

module.exports = { cacheGet, cacheSet, cacheDel };
