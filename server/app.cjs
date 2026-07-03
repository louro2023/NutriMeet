const express = require('express');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

async function createApp(options = {}){
  const DB_FILE = options.dbFile || path.resolve(__dirname, '../data/db.sqlite');

  const SQL = await initSqlJs();

  let db;
  if (fs.existsSync(DB_FILE)) {
    const buf = fs.readFileSync(DB_FILE);
    db = new SQL.Database(new Uint8Array(buf));
  } else {
    db = new SQL.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS nutritionists (id TEXT PRIMARY KEY, name TEXT, photo TEXT, crn TEXT, specialties TEXT, approaches TEXT, city TEXT, state TEXT, description TEXT, whatsapp TEXT, status TEXT, price INTEGER, experience TEXT, education TEXT, languages TEXT, modality TEXT);
      CREATE TABLE IF NOT EXISTS testimonials (id TEXT PRIMARY KEY, author TEXT, content TEXT, rating INTEGER);
      CREATE TABLE IF NOT EXISTS faqs (id TEXT PRIMARY KEY, question TEXT, answer TEXT);
      CREATE TABLE IF NOT EXISTS subscriptions (id TEXT PRIMARY KEY, name TEXT, email TEXT, phone TEXT, crn TEXT, specialties TEXT, approaches TEXT, status TEXT, date TEXT, photo TEXT);
      CREATE TABLE IF NOT EXISTS lists (key TEXT PRIMARY KEY, value TEXT);
    `);
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, Buffer.from(db.export()));
  }

  function all(sql, params=[]) {
    const stmt = db.prepare(sql);
    params.forEach((p,i)=> stmt.bind([p]));
    const res = [];
    while (stmt.step()) res.push(stmt.getAsObject());
    stmt.free();
    return res;
  }

  function get(sql, params=[]) {
    const stmt = db.prepare(sql);
    params.forEach((p,i)=> stmt.bind([p]));
    let row = null;
    if (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    return row;
  }

  function save() {
    fs.writeFileSync(DB_FILE, Buffer.from(db.export()));
  }

  function unserializeRow(row) {
    if (!row) return null;
    const out = {...row};
    ['specialties','approaches','languages','modality'].forEach(k => {
      if (out[k]) {
        try { out[k] = JSON.parse(out[k]); } catch (e) { out[k] = []; }
      }
    });
    return out;
  }

  const app = express();
  app.use(express.json());

  const DEFAULT_ADMIN_EMAIL = Buffer.from('aGVuaHJpcXVlLWxvdXJvQGhvdG1haWwuY29t', 'base64').toString('utf8');
  const DEFAULT_ADMIN_PASSWORD = Buffer.from('RnJlZHVudGVyMjAyMSE=', 'base64').toString('utf8');
  const DEFAULT_ADMIN_TOKEN = Buffer.from('c2VjcmV0LWFkbWluLXRva2VuLWFzLXN0cmluZw==', 'base64').toString('utf8');

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || DEFAULT_ADMIN_TOKEN;

  // simple admin auth middleware
  function adminAuth(req, res, next){
    const token = req.header('x-admin-token');
    if (!token || token !== ADMIN_TOKEN) return res.status(401).json({ error: 'unauthorized' });
    next();
  }

  app.post('/api/admin/login', (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: 'missing credentials' });
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'invalid credentials' });
      res.json({ token: ADMIN_TOKEN });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Public endpoints
  app.get('/api/nutritionists', (req, res) => {
    try{ const rows = all('SELECT * FROM nutritionists'); res.json(rows.map(unserializeRow)); } catch(e){ res.status(500).json({error: e.message}); }
  });
  app.get('/api/nutritionists/:id', (req, res) => { try{ const row = get('SELECT * FROM nutritionists WHERE id = ?', [req.params.id]); res.json(unserializeRow(row)); } catch(e){ res.status(500).json({error: e.message}); } });
  app.get('/api/specialties', (req, res) => { try{ const row = get("SELECT value FROM lists WHERE key = 'specialties'"); res.json(row ? JSON.parse(row.value) : []); } catch(e){ res.status(500).json({error: e.message}); } });
  app.get('/api/approaches', (req, res) => { try{ const row = get("SELECT value FROM lists WHERE key = 'approaches'"); res.json(row ? JSON.parse(row.value) : []); } catch(e){ res.status(500).json({error: e.message}); } });
  app.get('/api/states', (req, res) => { try{ const row = get("SELECT value FROM lists WHERE key = 'states'"); res.json(row ? JSON.parse(row.value) : []); } catch(e){ res.status(500).json({error: e.message}); } });
  app.get('/api/testimonials', (req, res) => { try{ const rows = all('SELECT * FROM testimonials'); res.json(rows); } catch(e){ res.status(500).json({error: e.message}); } });
  app.get('/api/faqs', (req, res) => { try{ const rows = all('SELECT * FROM faqs'); res.json(rows); } catch(e){ res.status(500).json({error: e.message}); } });
  app.get('/api/subscriptions', (req, res) => { try{ const rows = all('SELECT * FROM subscriptions'); res.json(rows); } catch(e){ res.status(500).json({error: e.message}); } });

  // Admin endpoints (protected)
  app.put('/api/subscriptions/:id/status', adminAuth, (req, res) => {
    try{ const { id } = req.params; const { status } = req.body; if (!['pending','approved','rejected'].includes(status)) return res.status(400).json({ error: 'invalid status' }); db.run('UPDATE subscriptions SET status = ? WHERE id = ?', [status, id]); save(); const updated = get('SELECT * FROM subscriptions WHERE id = ?', [id]); res.json(updated); } catch(e){ res.status(500).json({error: e.message}); }
  });

  app.put('/api/nutritionists/:id', adminAuth, (req, res) => {
    try{ const { id } = req.params; const data = req.body || {}; const fields = []; const values = []; const allowed = ['name','photo','crn','specialties','approaches','city','state','description','whatsapp','status','price','experience','education','languages','modality']; allowed.forEach((k) => { if (k in data) { let v = data[k]; if (Array.isArray(v)) v = JSON.stringify(v); fields.push(`${k} = ?`); values.push(v); } }); if (fields.length === 0) return res.status(400).json({ error: 'no fields' }); values.push(id); const sql = `UPDATE nutritionists SET ${fields.join(', ')} WHERE id = ?`; db.run(sql, values); save(); const updated = get('SELECT * FROM nutritionists WHERE id = ?', [id]); res.json(unserializeRow(updated)); } catch(e){ res.status(500).json({error: e.message}); }
  });

  app.post('/api/nutritionists', adminAuth, (req, res) => {
    try{ const data = req.body || {}; const id = data.id || `nutri-${Date.now()}`; const insert = db.prepare('INSERT INTO nutritionists (id,name,photo,crn,specialties,approaches,city,state,description,whatsapp,status,price,experience,education,languages,modality) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'); const values = [ id, data.name || '', data.photo || '', data.crn || '', JSON.stringify(data.specialties || []), JSON.stringify(data.approaches || []), data.city || '', data.state || '', data.description || '', data.whatsapp || '', data.status || 'pending', data.price || 0, data.experience || '', data.education || '', JSON.stringify(data.languages || []), JSON.stringify(data.modality || []) ]; insert.run(values); save(); const created = get('SELECT * FROM nutritionists WHERE id = ?', [id]); res.status(201).json(unserializeRow(created)); } catch(e){ res.status(500).json({error: e.message}); }
  });

  app.delete('/api/nutritionists/:id', adminAuth, (req, res) => { try{ const { id } = req.params; db.run('DELETE FROM nutritionists WHERE id = ?', [id]); save(); res.json({ deleted: true }); } catch(e){ res.status(500).json({error: e.message}); } });

  // Admin: delete all nutritionists
  app.delete('/api/nutritionists', adminAuth, (req, res) => {
    try{
      db.run('DELETE FROM nutritionists');
      save();
      res.json({ deletedAll: true });
    } catch(e){ res.status(500).json({error: e.message}); }
  });

  app.delete('/api/subscriptions', adminAuth, (req, res) => {
    try {
      db.run('DELETE FROM subscriptions');
      save();
      res.json({ deletedAll: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/lists/:key', adminAuth, (req, res) => { try{ const { key } = req.params; const { value } = req.body; if (!Array.isArray(value)) return res.status(400).json({ error: 'value must be array' }); db.run('INSERT OR REPLACE INTO lists (key, value) VALUES (?, ?)', [key, JSON.stringify(value)]); save(); res.json({ key, value }); } catch(e){ res.status(500).json({error: e.message}); } });

  return { app, db, save };
}

module.exports = { createApp };
