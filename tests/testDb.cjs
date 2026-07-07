const { newDb } = require('pg-mem');

function createTestDatabase() {
  const memoryDb = newDb({ autoCreateForeignKeyIndices: true });
  const { Pool } = memoryDb.adapters.createPg();
  const pool = new Pool();

  return {
    query: (sql, params) => pool.query(sql, params),
    close: () => pool.end(),
  };
}

module.exports = { createTestDatabase };
