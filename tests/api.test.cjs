const request = require('supertest');
const { createApp } = require('../server/app.cjs');

let app;
let server;

beforeAll(async () => {
  const res = await createApp({});
  app = res.app;
});

describe('API basic', () => {
  test('GET /api/nutritionists returns array', async () => {
    const res = await request(app).get('/api/nutritionists');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Admin create and delete nutritionist', async () => {
    const token = process.env.ADMIN_TOKEN;
    if (!token) throw new Error('ADMIN_TOKEN environment variable is required for admin tests');
    const nutri = { name: 'Test Nutri', crn: '0000/XX', specialties: ['Teste'], approaches: ['Teste'] };
    const createRes = await request(app).post('/api/nutritionists').set('x-admin-token', token).send(nutri);
    expect(createRes.status).toBe(201);
    expect(createRes.body.name).toBe('Test Nutri');

    const id = createRes.body.id;
    const delRes = await request(app).delete(`/api/nutritionists/${id}`).set('x-admin-token', token);
    expect(delRes.status).toBe(200);
    expect(delRes.body.deleted).toBe(true);
  });

  test('Admin update subscription status', async () => {
    const token = process.env.ADMIN_TOKEN;
    if (!token) throw new Error('ADMIN_TOKEN environment variable is required for admin tests');
    // get first subscription
    const subs = await request(app).get('/api/subscriptions');
    expect(subs.status).toBe(200);
    if (subs.body.length === 0) return;
    const id = subs.body[0].id;
    const res = await request(app).put(`/api/subscriptions/${id}/status`).set('x-admin-token', token).send({ status: 'approved' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });
});
