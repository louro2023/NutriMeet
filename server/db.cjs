const { Pool } = require('pg');

let cachedPool;

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
    throw new Error('DATABASE_URL is required. Use the Neon PostgreSQL connection string.');
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
    cachedPool.on('error', (error) => {
      console.error('Unexpected PostgreSQL pool error', error);
    });
  }

  return cachedPool;
}

function createDatabase(options = {}) {
  const pool = options.pool || createPool();
  return {
    query: (text, params) => pool.query(text, params),
    close: () => pool.end(),
  };
}

module.exports = { createDatabase, getDatabaseUrl };
