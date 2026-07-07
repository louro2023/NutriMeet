const request = require('supertest');
const { createApp } = require('../server/app.cjs');
const { createTestDatabase } = require('./testDb.cjs');

let app;
let db;
let token;

beforeAll(async () => {
  process.env.ADMIN_EMAIL = 'admin@test.local';
  process.env.ADMIN_PASSWORD = 'test-password';
  process.env.ADMIN_TOKEN_SECRET = 'test-secret';

  db = createTestDatabase();
  const res = await createApp({ db });
  app = res.app;

  const login = await request(app)
    .post('/api/admin/login')
    .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });

  expect(login.status).toBe(200);
  token = login.body.token;
});

afterAll(async () => {
  await db.close();
});

describe('API basic', () => {
  test('GET /api/nutritionists returns array', async () => {
    const res = await request(app).get('/api/nutritionists');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/search-data returns public browse data', async () => {
    const res = await request(app).get('/api/search-data');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.nutritionists)).toBe(true);
    expect(Array.isArray(res.body.specialties)).toBe(true);
    expect(Array.isArray(res.body.approaches)).toBe(true);
    expect(Array.isArray(res.body.states)).toBe(true);
  });

  test('GET /api/nutritionists/:id returns 404 for missing profile', async () => {
    const res = await request(app).get('/api/nutritionists/missing-profile');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('nutritionist not found');
  });

  test('Admin create and delete nutritionist', async () => {
    const nutri = { name: 'Test Nutri', crn: '0000/XX', specialties: ['Teste'], approaches: ['Teste'] };
    const createRes = await request(app).post('/api/nutritionists').set('x-admin-token', token).send(nutri);
    expect(createRes.status).toBe(201);
    expect(createRes.body.name).toBe('Test Nutri');
    expect(createRes.body.specialties).toEqual(['Teste']);

    const id = createRes.body.id;
    const delRes = await request(app).delete(`/api/nutritionists/${id}`).set('x-admin-token', token);
    expect(delRes.status).toBe(200);
    expect(delRes.body.deleted).toBe(true);
  });

  test('Admin update subscription status', async () => {
    await db.query(
      `
        INSERT INTO subscriptions (id, name, email, phone, crn, specialties, approaches, status, photo)
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9)
      `,
      [
        'sub-test',
        'Candidato Teste',
        'candidato@test.local',
        '11999999999',
        '12345/SP',
        JSON.stringify(['Teste']),
        JSON.stringify(['Teste']),
        'pending',
        '',
      ]
    );

    const res = await request(app)
      .put('/api/subscriptions/sub-test/status')
      .set('x-admin-token', token)
      .send({ status: 'approved' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });

  test('Public subscription stores photo and approval creates public profile', async () => {
    const photo = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2w==';
    const createRes = await request(app)
      .post('/api/subscriptions')
      .send({
        name: 'Dra. Foto Teste',
        email: 'foto@test.local',
        phone: '11977777777',
        crn: '98765/SP',
        description: 'Atendimento humanizado e baseado em rotina real.',
        city: 'São Paulo',
        state: 'SP',
        specialties: ['Nutrição Clínica'],
        approaches: ['Comportamental'],
        photo,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.photo).toBe(photo);
    expect(createRes.body.specialties).toEqual(['Nutrição Clínica']);
    expect(createRes.body.approaches).toEqual(['Comportamental']);
    expect(createRes.body.city).toBe('São Paulo');
    expect(createRes.body.state).toBe('SP');

    const approveRes = await request(app)
      .put(`/api/subscriptions/${createRes.body.id}/status`)
      .set('x-admin-token', token)
      .send({ status: 'approved' });

    expect(approveRes.status).toBe(200);

    const profileRes = await request(app).get(`/api/nutritionists/nutri-${createRes.body.id}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.name).toBe('Dra. Foto Teste');
    expect(profileRes.body.photo).toBe(photo);
    expect(profileRes.body.status).toBe('active');
    expect(profileRes.body.specialties).toEqual(['Nutrição Clínica']);
    expect(profileRes.body.approaches).toEqual(['Comportamental']);
    expect(profileRes.body.city).toBe('São Paulo');
    expect(profileRes.body.state).toBe('SP');

    const searchRes = await request(app).get('/api/search-data');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.nutritionists.some((item) => item.id === profileRes.body.id)).toBe(true);
  });

  test('Public subscription rejects profile details outside system lists', async () => {
    const photo = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2w==';
    const res = await request(app)
      .post('/api/subscriptions')
      .send({
        name: 'Dra. Lista Teste',
        email: 'lista@test.local',
        phone: '11966666666',
        crn: '56789/SP',
        description: 'Atendimento com foco em rotina possivel.',
        city: 'Sao Paulo',
        state: 'SP',
        specialties: ['Especialidade inexistente'],
        approaches: ['Comportamental'],
        photo,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid profile details');
  });
});
