const bcrypt = require('bcryptjs');

const DEFAULT_ADMIN_EMAIL = 'henrique-louro@hotmail.com';
const DEFAULT_ADMIN_PASSWORD_HASH = '$2b$12$kpESEPGhUJgHnOXMTwLHdeSiUCToE5o5BFk7iF4TTCtUXv3I6roQ.';

const DEFAULT_LISTS = {
  specialties: [
    'Nutri\u00e7\u00e3o Esportiva',
    'Nutri\u00e7\u00e3o Cl\u00ednica',
    'Emagrecimento',
    'Materno Infantil',
    'Oncol\u00f3gica',
    'Comportamental',
    'Vegetariana',
    'Funcional',
  ],
  approaches: [
    'Comportamental',
    'Low Carb',
    'Jejum Intermitente',
    'Dieta Flex\u00edvel',
    'Mindful Eating',
    'Ortomolecular',
    'Alergias Alimentares',
    'Sa\u00fade da Mulher',
  ],
  states: [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ],
};

const DROP_SCHEMA_SQL = `
  DROP TABLE IF EXISTS subscriptions CASCADE;
  DROP TABLE IF EXISTS nutritionists CASCADE;
  DROP TABLE IF EXISTS testimonials CASCADE;
  DROP TABLE IF EXISTS faqs CASCADE;
  DROP TABLE IF EXISTS lists CASCADE;
  DROP TABLE IF EXISTS admins CASCADE;
`;

const CREATE_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS nutritionists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    photo TEXT NOT NULL DEFAULT '',
    crn TEXT NOT NULL DEFAULT '',
    specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
    approaches JSONB NOT NULL DEFAULT '[]'::jsonb,
    city TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    whatsapp TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected')),
    price INTEGER NOT NULL DEFAULT 0,
    experience TEXT NOT NULL DEFAULT '',
    education TEXT NOT NULL DEFAULT '',
    languages JSONB NOT NULL DEFAULT '[]'::jsonb,
    modality JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL DEFAULT '',
    answer TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    crn TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    experience TEXT NOT NULL DEFAULT '',
    education TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL DEFAULT '',
    specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
    approaches JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    photo TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS lists (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS nutritionists_status_idx ON nutritionists (status);
  CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions (status);
`;

const MIGRATION_SQL = `
  ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
  ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS experience TEXT NOT NULL DEFAULT '';
  ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS education TEXT NOT NULL DEFAULT '';
  ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT '';
  ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS state TEXT NOT NULL DEFAULT '';
`;

function adminIdFor(email) {
  return `admin-${Buffer.from(email).toString('hex').slice(0, 24)}`;
}

async function resolveAdminSeed() {
  const email = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ||
    (process.env.ADMIN_PASSWORD
      ? await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
      : DEFAULT_ADMIN_PASSWORD_HASH);

  return {
    id: adminIdFor(email),
    email,
    passwordHash,
  };
}

async function createSchema(db, options = {}) {
  if (options.reset) {
    await db.query(DROP_SCHEMA_SQL);
  }
  await db.query(CREATE_SCHEMA_SQL);
  await db.query(MIGRATION_SQL);
}

async function seedLists(db) {
  for (const [key, value] of Object.entries(DEFAULT_LISTS)) {
    await db.query(
      `
        INSERT INTO lists (key, value)
        VALUES ($1, $2::jsonb)
        ON CONFLICT (key) DO NOTHING
      `,
      [key, JSON.stringify(value)]
    );
  }
}

async function seedAdmin(db, options = {}) {
  const admin = await resolveAdminSeed();
  const conflictAction = options.updateAdminPassword
    ? 'DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()'
    : 'DO NOTHING';

  await db.query(
    `
      INSERT INTO admins (id, email, password_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) ${conflictAction}
    `,
    [admin.id, admin.email, admin.passwordHash]
  );

  return { email: admin.email };
}

async function initializeDatabase(db, options = {}) {
  await createSchema(db, options);

  if (options.seed !== false) {
    await seedLists(db);
    await seedAdmin(db, options);
  }
}

module.exports = {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_LISTS,
  createSchema,
  initializeDatabase,
  resolveAdminSeed,
  seedAdmin,
  seedLists,
};
