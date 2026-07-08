const request = require('supertest');
const sharp = require('sharp');
const { createApp } = require('../server/app.cjs');
const { createTestDatabase } = require('./testDb.cjs');

let app;
let db;
let token;

async function createPhotoDataUrl(width = 640, height = 480) {
  const buffer = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: '#57b879',
    },
  }).png().toBuffer();

  return `data:image/png;base64,${buffer.toString('base64')}`;
}

async function expectCompressedProfilePhoto(photo) {
  expect(photo).toMatch(/^data:image\/jpeg;base64,/);
  const base64 = photo.slice(photo.indexOf(',') + 1);
  const metadata = await sharp(Buffer.from(base64, 'base64')).metadata();
  expect(metadata.format).toBe('jpeg');
  expect(metadata.width).toBeLessThanOrEqual(300);
  expect(metadata.height).toBeLessThanOrEqual(300);
}

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
    const photo = await createPhotoDataUrl();
    const createRes = await request(app)
      .post('/api/subscriptions')
      .send({
        name: 'Dra. Foto Teste',
        email: 'foto@test.local',
        phone: '11977777777',
        crn: '98765/SP',
        description: 'Atendimento humanizado e baseado em rotina real.',
        education: 'Graduacao em Nutricao pela USP. Pos-graduacao em Nutricao Clinica.',
        experience: '5 anos de experiencia em atendimento clinico.',
        city: 'São Paulo',
        state: 'SP',
        specialties: ['Nutri\u00e7\u00e3o Cl\u00ednica', 'Emagrecimento', 'Funcional'],
        approaches: ['Comportamental', 'Mindful Eating', 'Sa\u00fade da Mulher'],
        photo,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.photo).not.toBe(photo);
    await expectCompressedProfilePhoto(createRes.body.photo);
    expect(createRes.body.specialties).toEqual(['Nutri\u00e7\u00e3o Cl\u00ednica', 'Emagrecimento', 'Funcional']);
    expect(createRes.body.approaches).toEqual(['Comportamental', 'Mindful Eating', 'Sa\u00fade da Mulher']);
    expect(createRes.body.education).toBe('Graduacao em Nutricao pela USP. Pos-graduacao em Nutricao Clinica.');
    expect(createRes.body.experience).toBe('5 anos de experiencia em atendimento clinico.');
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
    expect(profileRes.body.photo).not.toBe(photo);
    await expectCompressedProfilePhoto(profileRes.body.photo);
    expect(profileRes.body.status).toBe('active');
    expect(profileRes.body.specialties).toEqual(['Nutri\u00e7\u00e3o Cl\u00ednica', 'Emagrecimento', 'Funcional']);
    expect(profileRes.body.approaches).toEqual(['Comportamental', 'Mindful Eating', 'Sa\u00fade da Mulher']);
    expect(profileRes.body.education).toBe('Graduacao em Nutricao pela USP. Pos-graduacao em Nutricao Clinica.');
    expect(profileRes.body.experience).toBe('5 anos de experiencia em atendimento clinico.');
    expect(profileRes.body.city).toBe('São Paulo');
    expect(profileRes.body.state).toBe('SP');

    const searchRes = await request(app).get('/api/search-data');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.nutritionists.some((item) => item.id === profileRes.body.id)).toBe(true);
  });

  test('Public subscription rejects more than three specialties or approaches', async () => {
    const res = await request(app)
      .post('/api/subscriptions')
      .send({
        name: 'Dra. Limite Teste',
        email: 'limite@test.local',
        phone: '11955555555',
        crn: '45678/SP',
        description: 'Atendimento com foco em rotina possivel.',
        education: 'Graduacao em Nutricao.',
        experience: 'Atendimento clinico.',
        city: 'Sao Paulo',
        state: 'SP',
        specialties: ['Nutri\u00e7\u00e3o Cl\u00ednica', 'Emagrecimento', 'Funcional', 'Vegetariana'],
        approaches: ['Comportamental', 'Mindful Eating', 'Sa\u00fade da Mulher', 'Low Carb'],
        photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2w==',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('too many profile selections');
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
        education: 'Graduacao em Nutricao.',
        experience: 'Atendimento clinico.',
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
