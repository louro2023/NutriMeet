const { Pool } = require('pg');

let cachedPool;
let cachedMode;
let warnedAboutMemoryFallback = false;

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
}

function shouldUseSsl(connectionString) {
  if (process.env.PGSSL === 'false') return false;
  if (connectionString.includes('sslmode=disable')) return false;
  return (
    process.env.PGSSL === 'true' ||
    connectionString.includes('sslmode=require') ||
    connectionString.includes('.neon.tech')
  );
}

function createPool() {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    if (!cachedPool) {
      const { newDb } = require('pg-mem');
      const memoryDb = newDb({ autoCreateForeignKeyIndices: true });
      const { Pool: MemoryPool } = memoryDb.adapters.createPg();
      cachedPool = new MemoryPool();
      cachedMode = 'memory';
    }

    if (!warnedAboutMemoryFallback) {
      console.warn('DATABASE_URL was not found. Using an in-memory database fallback.');
      warnedAboutMemoryFallback = true;
    }

    return cachedPool;
  }

  if (!cachedPool) {
    const config = {
      connectionString,
      allowExitOnIdle: true,
      idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
      max: Number(process.env.PG_POOL_MAX || (process.env.VERCEL ? 1 : 5)),
    };

    if (shouldUseSsl(connectionString)) {
      config.ssl = { rejectUnauthorized: false };
    }

    cachedPool = new Pool(config);
    cachedMode = 'postgres';
    cachedPool.on('error', (error) => {
      console.error('Unexpected PostgreSQL pool error', error);
    });
  }

  return cachedPool;
}

function createDatabase(options = {}) {
  const pool = options.pool || createPool();
  const isCachedPool = pool === cachedPool;
  return {
    query: (text, params) => pool.query(text, params),
    close: async () => {
      await pool.end();
      if (isCachedPool) {
        cachedPool = null;
        cachedMode = null;
      }
    },
    mode: options.mode || cachedMode || 'custom',
  };
}

module.exports = { createDatabase, getDatabaseUrl };
