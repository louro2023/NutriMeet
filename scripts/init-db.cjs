require('dotenv').config();

const { createDatabase } = require('../server/db.cjs');
const { DEFAULT_ADMIN_EMAIL, initializeDatabase } = require('../server/schema.cjs');

async function main() {
  const reset = process.argv.includes('--reset') || process.env.RESET_DATABASE === 'true';
  const db = createDatabase();

  try {
    await initializeDatabase(db, {
      reset,
      seed: true,
      updateAdminPassword: true,
    });

    const adminEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
    console.log(`Neon/PostgreSQL database initialized${reset ? ' with reset' : ''}.`);
    console.log(`Admin user ready: ${adminEmail}`);
  } finally {
    await db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
