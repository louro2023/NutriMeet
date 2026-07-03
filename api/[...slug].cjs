// Vercel API route for NutriMeet.
// This serverless function exposes the same /api/* routes used by the frontend.
// It supports login with hidden default admin credentials and retries SQLite in tmpfs
// when the deployment filesystem is not writable.

const fs = require('fs');
const path = require('path');
const os = require('os');
const initSqlJs = require('sql.js');

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.sqlite');
const TMP_DB_FILE = path.join(os.tmpdir(), 'nutrimeet-db.sqlite');

const DEFAULT_ADMIN_EMAIL = Buffer.from('aGVuaHJpcXVlLWxvdXJvQGhvdG1haWwuY29t', 'base64').toString('utf8');
const DEFAULT_ADMIN_PASSWORD = Buffer.from('RnJlZHVudGVyMjAyMCE=', 'base64').toString('utf8');
const DEFAULT_ADMIN_TOKEN = Buffer.from('c2VjcmV0LWFkbWluLXRva2VuLWFzLXN0cmluZw==', 'base64').toString('utf8');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || DEFAULT_ADMIN_TOKEN;

let cachedDb;
let cachedSql;
let dbIsWritable;

function ensureWritable(filePath) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.accessSync(path.dirname(filePath), fs.constants.W_OK);
    return true;
  } catch (e) {
    return false;
  }
}

function jsonResponse(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function buildPathname(req) {
  const url = new URL(req.url, 'http://localhost');
  let pathname = url.pathname || '/';
  if (pathname.startsWith('/api')) pathname = pathname.slice(4) || '/';
  return pathname.replace(/\/+/g, '/');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (req.method === 'GET' || req.method === 'DELETE') return resolve({});
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function openDatabase() {
  if (cachedDb) return cachedDb;
  if (!cachedSql) cachedSql = await initSqlJs();

  dbIsWritable = ensureWritable(DB_FILE);
  let dbPath = DB_FILE;
  if (!fs.existsSync(DB_FILE) && !dbIsWritable && fs.existsSync(TMP_DB_FILE)) {
    dbPath = TMP_DB_FILE;
  }

  let db;
  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath);
    db = new cachedSql.Database(new Uint8Array(buf));
  } else {
    db = new cachedSql.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS nutritionists (id TEXT PRIMARY KEY, name TEXT, photo TEXT, crn TEXT, specialties TEXT, approaches TEXT, city TEXT, state TEXT, description TEXT, whatsapp TEXT, status TEXT, price INTEGER, experience TEXT, education TEXT, languages TEXT, modality TEXT);
      CREATE TABLE IF NOT EXISTS testimonials (id TEXT PRIMARY KEY, author TEXT, content TEXT, rating INTEGER);
      CREATE TABLE IF NOT EXISTS faqs (id TEXT PRIMARY KEY, question TEXT, answer TEXT);
      CREATE TABLE IF NOT EXISTS subscriptions (id TEXT PRIMARY KEY, name TEXT, email TEXT, phone TEXT, crn TEXT, specialties TEXT, approaches TEXT, status TEXT, date TEXT, photo TEXT);
      CREATE TABLE IF NOT EXISTS lists (key TEXT PRIMARY KEY, value TEXT);
    `);
    const targetPath = dbIsWritable ? DB_FILE : TMP_DB_FILE;
    fs.writeFileSync(targetPath, Buffer.from(db.export()));
  }

  function run(sql, params = []) {
    const stmt = db.prepare(sql);
    params.forEach((param) => stmt.bind([param]));
    stmt.step();
    stmt.free();
  }

  function all(sql, params = []) {
    const stmt = db.prepare(sql);
    params.forEach((param) => stmt.bind([param]));
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  function get(sql, params = []) {
    const stmt = db.prepare(sql);
    params.forEach((param) => stmt.bind([param]));
    let row = null;
    if (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    return row;
  }

  function save() {
    const targetPath = dbIsWritable ? DB_FILE : TMP_DB_FILE;
    fs.writeFileSync(targetPath, Buffer.from(db.export()));
  }

  function unserializeRow(row) {
    if (!row) return null;
    const out = { ...row };
    ['specialties', 'approaches', 'languages', 'modality'].forEach((key) => {
      if (out[key]) {
        try { out[key] = JSON.parse(out[key]); } catch (e) { out[key] = []; }
      }
    });
    return out;
  }

  cachedDb = { db, run, all, get, save, unserializeRow };
  return cachedDb;
}

function requireAdminToken(req) {
  const token = req.headers['x-admin-token'];
  return token && token === ADMIN_TOKEN;
}

function normalizePath(pathname) {
  if (pathname === '/') return '/';
  return pathname.replace(/\/$/, '');
}

module.exports = async function (req, res) {
  try {
    const pathname = normalizePath(buildPathname(req));
    const method = req.method;
    const body = await parseBody(req);
    const { all, get, run, save, unserializeRow } = await openDatabase();

    if (method === 'POST' && pathname === '/admin/login') {
      const { email, password } = body || {};
      if (!email || !password) return jsonResponse(res, 400, { error: 'missing credentials' });
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return jsonResponse(res, 401, { error: 'invalid credentials' });
      return jsonResponse(res, 200, { token: ADMIN_TOKEN });
    }

    if (method === 'GET' && pathname === '/nutritionists') {
      return jsonResponse(res, 200, all('SELECT * FROM nutritionists').map(unserializeRow));
    }

    if (method === 'GET' && pathname.startsWith('/nutritionists/')) {
      const id = pathname.slice('/nutritionists/'.length);
      return jsonResponse(res, 200, unserializeRow(get('SELECT * FROM nutritionists WHERE id = ?', [id])));
    }

    if (method === 'GET' && pathname === '/specialties') {
      const row = get("SELECT value FROM lists WHERE key = 'specialties'");
      return jsonResponse(res, 200, row ? JSON.parse(row.value) : []);
    }

    if (method === 'GET' && pathname === '/approaches') {
      const row = get("SELECT value FROM lists WHERE key = 'approaches'");
      return jsonResponse(res, 200, row ? JSON.parse(row.value) : []);
    }

    if (method === 'GET' && pathname === '/states') {
      const row = get("SELECT value FROM lists WHERE key = 'states'");
      return jsonResponse(res, 200, row ? JSON.parse(row.value) : []);
    }

    if (method === 'GET' && pathname === '/testimonials') {
      return jsonResponse(res, 200, all('SELECT * FROM testimonials'));
    }

    if (method === 'GET' && pathname === '/faqs') {
      return jsonResponse(res, 200, all('SELECT * FROM faqs'));
    }

    if (method === 'GET' && pathname === '/subscriptions') {
      return jsonResponse(res, 200, all('SELECT * FROM subscriptions'));
    }

    const isAdmin = requireAdminToken(req);
    if (!isAdmin && [
      { method: 'PUT', path: '/subscriptions/' },
      { method: 'PUT', path: '/nutritionists/' },
      { method: 'POST', path: '/nutritionists' },
      { method: 'DELETE', path: '/nutritionists' },
      { method: 'DELETE', path: '/subscriptions' },
      { method: 'PUT', path: '/lists/' }
    ].some(route => method === route.method && pathname === route.path || pathname.startsWith(route.path))) {
      return jsonResponse(res, 401, { error: 'unauthorized' });
    }

    if (method === 'PUT' && pathname.startsWith('/subscriptions/') && pathname.endsWith('/status')) {
      const id = pathname.slice('/subscriptions/'.length, -'/status'.length);
      const status = body.status;
      if (!['pending','approved','rejected'].includes(status)) return jsonResponse(res, 400, { error: 'invalid status' });
      run('UPDATE subscriptions SET status = ? WHERE id = ?', [status, id]);
      save();
      return jsonResponse(res, 200, get('SELECT * FROM subscriptions WHERE id = ?', [id]));
    }

    if (method === 'PUT' && pathname.startsWith('/nutritionists/')) {
      const id = pathname.slice('/nutritionists/'.length);
      const data = body || {};
      const fields = [];
      const values = [];
      const allowed = ['name','photo','crn','specialties','approaches','city','state','description','whatsapp','status','price','experience','education','languages','modality'];
      allowed.forEach((key) => {
        if (key in data) {
          let value = data[key];
          if (Array.isArray(value)) value = JSON.stringify(value);
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      if (fields.length === 0) return jsonResponse(res, 400, { error: 'no fields' });
      values.push(id);
      run(`UPDATE nutritionists SET ${fields.join(', ')} WHERE id = ?`, values);
      save();
      return jsonResponse(res, 200, unserializeRow(get('SELECT * FROM nutritionists WHERE id = ?', [id])));
    }

    if (method === 'POST' && pathname === '/nutritionists') {
      const data = body || {};
      const id = data.id || `nutri-${Date.now()}`;
      run('INSERT INTO nutritionists (id,name,photo,crn,specialties,approaches,city,state,description,whatsapp,status,price,experience,education,languages,modality) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
        id,
        data.name || '',
        data.photo || '',
        data.crn || '',
        JSON.stringify(data.specialties || []),
        JSON.stringify(data.approaches || []),
        data.city || '',
        data.state || '',
        data.description || '',
        data.whatsapp || '',
        data.status || 'pending',
        data.price || 0,
        data.experience || '',
        data.education || '',
        JSON.stringify(data.languages || []),
        JSON.stringify(data.modality || []),
      ]);
      save();
      return jsonResponse(res, 201, unserializeRow(get('SELECT * FROM nutritionists WHERE id = ?', [id])));
    }

    if (method === 'DELETE' && pathname.startsWith('/nutritionists/') && pathname !== '/nutritionists') {
      const id = pathname.slice('/nutritionists/'.length);
      run('DELETE FROM nutritionists WHERE id = ?', [id]);
      save();
      return jsonResponse(res, 200, { deleted: true });
    }

    if (method === 'DELETE' && pathname === '/nutritionists') {
      run('DELETE FROM nutritionists');
      save();
      return jsonResponse(res, 200, { deletedAll: true });
    }

    if (method === 'DELETE' && pathname === '/subscriptions') {
      run('DELETE FROM subscriptions');
      save();
      return jsonResponse(res, 200, { deletedAll: true });
    }

    if (method === 'PUT' && pathname.startsWith('/lists/')) {
      const key = pathname.slice('/lists/'.length);
      const value = body.value;
      if (!Array.isArray(value)) return jsonResponse(res, 400, { error: 'value must be array' });
      run('INSERT OR REPLACE INTO lists (key, value) VALUES (?, ?)', [key, JSON.stringify(value)]);
      save();
      return jsonResponse(res, 200, { key, value });
    }

    return jsonResponse(res, 404, { error: 'Route not found' });
  } catch (error) {
    return jsonResponse(res, 500, { error: error.message });
  }
};
