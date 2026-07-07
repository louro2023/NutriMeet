const { Pool } = require('pg');

let cachedPool;
let cachedMode;
let warnedAboutMemoryFallback = false;

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.NEON_DATABASE_URL
  );
}

function hasPgEnvConfig() {
  return Boolean(process.env.PGHOST && process.env.PGDATABASE && process.env.PGUSER && process.env.PGPASSWORD);
}

function shouldUseSsl(connectionStringOrHost = '') {
  if (process.env.PGSSL === 'false') return false;
  if (process.env.PGSSLMODE === 'disable') return false;
  if (connectionStringOrHost.includes('sslmode=disable')) return false;
  return (
    process.env.PGSSL === 'true' ||
    process.env.PGSSLMODE === 'require' ||
    connectionStringOrHost.includes('sslmode=require') ||
    connectionStringOrHost.includes('.neon.tech')
  );
}

function createPostgresConfig(connectionString) {
  const base = {
    allowExitOnIdle: true,
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
    max: Number(process.env.PG_POOL_MAX || (process.env.VERCEL ? 1 : 5)),
  };

  if (connectionString) {
    return {
      ...base,
      connectionString,
      ...(shouldUseSsl(connectionString) ? { ssl: { rejectUnauthorized: false } } : {}),
    };
  }

  return {
    ...base,
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ...(shouldUseSsl(process.env.PGHOST || '') ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

function createPool() {
  const connectionString = getDatabaseUrl();
  const pgEnvConfigAvailable = hasPgEnvConfig();
  if (!connectionString && !pgEnvConfigAvailable) {
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
    const config = createPostgresConfig(connectionString);
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
