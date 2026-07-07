const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const { createDatabase } = require('./db.cjs');
const { initializeDatabase } = require('./schema.cjs');

const JSON_ARRAY_FIELDS = new Set(['specialties', 'approaches', 'languages', 'modality']);
const NUTRITIONIST_STATUSES = new Set(['active', 'pending', 'rejected']);
const DEFAULT_ADMIN_TOKEN_SECRET = 'nutrimeet-default-admin-session-secret';
const NUTRITIONIST_FIELDS = [
  'name',
  'photo',
  'crn',
  'specialties',
  'approaches',
  'city',
  'state',
  'description',
  'whatsapp',
  'status',
  'price',
  'experience',
  'education',
  'languages',
  'modality',
];

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

async function rows(db, sql, params = []) {
  const result = await db.query(sql, params);
  return Array.isArray(result) ? result : result.rows;
}

async function row(db, sql, params = []) {
  const result = await rows(db, sql, params);
  return result[0] || null;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
}

function asTrimmedStringArray(value) {
  return [...new Set(asArray(value)
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean))];
}

function asIso(value) {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function normalizeNutritionist(input) {
  if (!input) return null;
  const output = { ...input };
  JSON_ARRAY_FIELDS.forEach((field) => {
    output[field] = asArray(output[field]);
  });
  output.price = Number(output.price || 0);
  output.created_at = asIso(output.created_at);
  output.updated_at = asIso(output.updated_at);
  return output;
}

function normalizeSubscription(input) {
  if (!input) return null;
  const output = { ...input };
  output.specialties = asArray(output.specialties);
  output.approaches = asArray(output.approaches);
  output.city = output.city || '';
  output.state = output.state || '';
  output.date = asIso(output.date);
  output.created_at = asIso(output.created_at);
  output.updated_at = asIso(output.updated_at);
  return output;
}

function defaultProfileDescription(subscription) {
  return subscription.description || 'Profissional cadastrado pela NutriMeet. Perfil em atualização pela equipe administrativa.';
}

async function upsertNutritionistFromSubscription(db, subscription) {
  const id = `nutri-${subscription.id}`;
  const created = await row(
    db,
    `
      INSERT INTO nutritionists (
        id,
        name,
        photo,
        crn,
        specialties,
        approaches,
        city,
        state,
        description,
        whatsapp,
        status,
        price,
        experience,
        education,
        languages,
        modality
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9, $10, 'active', $11, $12, $13, $14::jsonb, $15::jsonb)
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        photo = EXCLUDED.photo,
        crn = EXCLUDED.crn,
        specialties = EXCLUDED.specialties,
        approaches = EXCLUDED.approaches,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        description = EXCLUDED.description,
        whatsapp = EXCLUDED.whatsapp,
        status = 'active',
        updated_at = NOW()
      RETURNING *
    `,
    [
      id,
      subscription.name || '',
      subscription.photo || '',
      subscription.crn || '',
      JSON.stringify(asArray(subscription.specialties)),
      JSON.stringify(asArray(subscription.approaches)),
      subscription.city || '',
      subscription.state || '',
      defaultProfileDescription(subscription),
      subscription.phone || '',
      40,
      '',
      '',
      JSON.stringify(['Português']),
      JSON.stringify(['online']),
    ]
  );

  return normalizeNutritionist(created);
}

function normalizeListValue(value) {
  return asArray(value);
}

async function getListValues(db, key) {
  const result = await row(db, 'SELECT value FROM lists WHERE key = $1', [key]);
  return result ? normalizeListValue(result.value) : [];
}

function valuesAreInList(values, availableValues) {
  const allowed = new Set(availableValues);
  return values.length > 0 && values.every((value) => allowed.has(value));
}

function getTokenSecret() {
  return process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_TOKEN || DEFAULT_ADMIN_TOKEN_SECRET;
}

function base64urlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function signAdminToken(admin, secret) {
  const now = Math.floor(Date.now() / 1000);
  const ttl = Number(process.env.ADMIN_SESSION_TTL_SECONDS || 60 * 60 * 24 * 7);
  const header = base64urlJson({ alg: 'HS256', typ: 'JWT' });
  const payload = base64urlJson({
    sub: admin.id,
    email: admin.email,
    iat: now,
    exp: now + ttl,
  });
  const body = `${header}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyAdminToken(token, secret) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expected = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  if (!safeEqual(signature, expected)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

function requestToken(req) {
  const authorization = req.header('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }
  return req.header('x-admin-token');
}

function createAdminAuth(secret) {
  return (req, res, next) => {
    const admin = verifyAdminToken(requestToken(req), secret || getTokenSecret());
    if (!admin) return res.status(401).json({ error: 'unauthorized' });
    req.admin = admin;
    return next();
  };
}

async function createApp(options = {}) {
  const db = options.db || createDatabase(options);
  if (options.initialize !== false) {
    await initializeDatabase(db, {
      reset: Boolean(options.reset),
      seed: options.seed !== false,
      updateAdminPassword: Boolean(options.updateAdminPassword),
    });
  }

  const adminAuth = createAdminAuth(getTokenSecret());
  const app = express();
  app.use(express.json({ limit: '8mb' }));

  app.get('/api/health', asyncHandler(async (req, res) => {
    await row(db, 'SELECT 1 AS ok');
    res.json({ ok: true, database: true, databaseMode: db.mode || 'unknown', authConfigured: true });
  }));

  app.post('/api/admin/login', asyncHandler(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = req.body?.password;

    if (!email || typeof password !== 'string') {
      return res.status(400).json({ error: 'missing credentials' });
    }

    const admin = await row(
      db,
      'SELECT id, email, password_hash FROM admins WHERE email = $1',
      [email]
    );
    const validPassword = admin ? await bcrypt.compare(password, admin.password_hash) : false;

    if (!admin || !validPassword) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    return res.json({ token: signAdminToken(admin, getTokenSecret()) });
  }));

  app.get('/api/nutritionists', asyncHandler(async (req, res) => {
    const result = await rows(db, 'SELECT * FROM nutritionists ORDER BY created_at DESC, name ASC');
    res.json(result.map(normalizeNutritionist));
  }));

  app.get('/api/nutritionists/:id', asyncHandler(async (req, res) => {
    const result = await row(db, 'SELECT * FROM nutritionists WHERE id = $1', [req.params.id]);
    res.json(normalizeNutritionist(result));
  }));

  app.get('/api/specialties', asyncHandler(async (req, res) => {
    res.json(await getListValues(db, 'specialties'));
  }));

  app.get('/api/approaches', asyncHandler(async (req, res) => {
    res.json(await getListValues(db, 'approaches'));
  }));

  app.get('/api/states', asyncHandler(async (req, res) => {
    res.json(await getListValues(db, 'states'));
  }));

  app.get('/api/testimonials', asyncHandler(async (req, res) => {
    const result = await rows(db, 'SELECT id, author, content, rating FROM testimonials ORDER BY created_at ASC');
    res.json(result);
  }));

  app.get('/api/faqs', asyncHandler(async (req, res) => {
    const result = await rows(db, 'SELECT id, question, answer FROM faqs ORDER BY created_at ASC');
    res.json(result);
  }));

  app.get('/api/subscriptions', asyncHandler(async (req, res) => {
    const result = await rows(db, 'SELECT * FROM subscriptions ORDER BY date ASC');
    res.json(result.map(normalizeSubscription));
  }));

  app.post('/api/subscriptions', asyncHandler(async (req, res) => {
    const data = req.body || {};
    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim().toLowerCase();
    const phone = String(data.phone || '').trim();
    const crn = String(data.crn || '').trim();
    const description = String(data.description || '').trim();
    const city = String(data.city || '').trim();
    const state = String(data.state || '').trim().toUpperCase();
    const photo = String(data.photo || '').trim();
    const specialties = asTrimmedStringArray(data.specialties);
    const approaches = asTrimmedStringArray(data.approaches);

    if (!name || !email || !phone || !crn || !description || !city || !state || !photo || specialties.length === 0 || approaches.length === 0) {
      return res.status(400).json({ error: 'missing required fields' });
    }

    const [availableSpecialties, availableApproaches, availableStates] = await Promise.all([
      getListValues(db, 'specialties'),
      getListValues(db, 'approaches'),
      getListValues(db, 'states'),
    ]);

    if (
      !valuesAreInList(specialties, availableSpecialties) ||
      !valuesAreInList(approaches, availableApproaches) ||
      !availableStates.includes(state)
    ) {
      return res.status(400).json({ error: 'invalid profile details' });
    }

    if (!/^data:image\/(jpeg|jpg|png|webp);base64,/.test(photo)) {
      return res.status(400).json({ error: 'invalid photo' });
    }

    if (photo.length > 2_000_000) {
      return res.status(413).json({ error: 'photo too large' });
    }

    const id = data.id || `sub-${Date.now()}`;
    const created = await row(
      db,
      `
        INSERT INTO subscriptions (
          id,
          name,
          email,
          phone,
          crn,
          description,
          city,
          state,
          specialties,
          approaches,
          status,
          date,
          photo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, 'pending', NOW(), $11)
        RETURNING *
      `,
      [
        id,
        name,
        email,
        phone,
        crn,
        description,
        city,
        state,
        JSON.stringify(specialties),
        JSON.stringify(approaches),
        photo,
      ]
    );

    return res.status(201).json(normalizeSubscription(created));
  }));

  app.put('/api/subscriptions/:id/status', adminAuth, asyncHandler(async (req, res) => {
    const status = req.body?.status;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'invalid status' });
    }

    const updated = await row(
      db,
      'UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (!updated) return res.status(404).json({ error: 'subscription not found' });
    if (status === 'approved') {
      await upsertNutritionistFromSubscription(db, normalizeSubscription(updated));
    }
    return res.json(normalizeSubscription(updated));
  }));

  app.put('/api/nutritionists/:id', adminAuth, asyncHandler(async (req, res) => {
    const data = req.body || {};
    const assignments = [];
    const values = [];

    if ('status' in data && !NUTRITIONIST_STATUSES.has(data.status)) {
      return res.status(400).json({ error: 'invalid status' });
    }

    NUTRITIONIST_FIELDS.forEach((field) => {
      if (!(field in data)) return;

      if (JSON_ARRAY_FIELDS.has(field)) {
        values.push(JSON.stringify(asArray(data[field])));
        assignments.push(`${field} = $${values.length}::jsonb`);
        return;
      }

      if (field === 'price') {
        values.push(Number(data[field]) || 0);
      } else if (field === 'status') {
        values.push(data[field]);
      } else {
        values.push(data[field] == null ? '' : String(data[field]));
      }
      assignments.push(`${field} = $${values.length}`);
    });

    if (assignments.length === 0) {
      return res.status(400).json({ error: 'no fields' });
    }

    values.push(req.params.id);
    const updated = await row(
      db,
      `
        UPDATE nutritionists
        SET ${assignments.join(', ')}, updated_at = NOW()
        WHERE id = $${values.length}
        RETURNING *
      `,
      values
    );

    if (!updated) return res.status(404).json({ error: 'nutritionist not found' });
    return res.json(normalizeNutritionist(updated));
  }));

  app.post('/api/nutritionists', adminAuth, asyncHandler(async (req, res) => {
    const data = req.body || {};
    const id = data.id || `nutri-${Date.now()}`;
    const status = data.status || 'pending';
    if (!NUTRITIONIST_STATUSES.has(status)) {
      return res.status(400).json({ error: 'invalid status' });
    }

    const created = await row(
      db,
      `
        INSERT INTO nutritionists (
          id,
          name,
          photo,
          crn,
          specialties,
          approaches,
          city,
          state,
          description,
          whatsapp,
          status,
          price,
          experience,
          education,
          languages,
          modality
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, $16::jsonb)
        RETURNING *
      `,
      [
        id,
        data.name || '',
        data.photo || '',
        data.crn || '',
        JSON.stringify(asArray(data.specialties)),
        JSON.stringify(asArray(data.approaches)),
        data.city || '',
        data.state || '',
        data.description || '',
        data.whatsapp || '',
        status,
        Number(data.price || 0),
        data.experience || '',
        data.education || '',
        JSON.stringify(asArray(data.languages)),
        JSON.stringify(asArray(data.modality)),
      ]
    );

    return res.status(201).json(normalizeNutritionist(created));
  }));

  app.delete('/api/nutritionists/:id', adminAuth, asyncHandler(async (req, res) => {
    await db.query('DELETE FROM nutritionists WHERE id = $1', [req.params.id]);
    res.json({ deleted: true });
  }));

  app.delete('/api/nutritionists', adminAuth, asyncHandler(async (req, res) => {
    await db.query('DELETE FROM nutritionists');
    res.json({ deletedAll: true });
  }));

  app.delete('/api/subscriptions', adminAuth, asyncHandler(async (req, res) => {
    await db.query('DELETE FROM subscriptions');
    res.json({ deletedAll: true });
  }));

  app.put('/api/lists/:key', adminAuth, asyncHandler(async (req, res) => {
    const value = req.body?.value;
    if (!Array.isArray(value)) {
      return res.status(400).json({ error: 'value must be array' });
    }

    await db.query(
      `
        INSERT INTO lists (key, value)
        VALUES ($1, $2::jsonb)
        ON CONFLICT (key)
        DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `,
      [req.params.key, JSON.stringify(value)]
    );

    return res.json({ key: req.params.key, value });
  }));

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });

  return { app, db };
}

module.exports = { createApp };
