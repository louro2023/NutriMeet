const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = path.resolve(__dirname, '../data/db.sqlite');

(async function main(){
  const SQL = await initSqlJs();
  const SPECIALTIES = [
    'Nutrição Esportiva','Nutrição Clínica','Emagrecimento','Materno Infantil','Oncológica','Comportamental','Vegetariana','Funcional'
  ];
  const APPROACHES = [
    'Comportamental','Low Carb','Jejum Intermitente','Dieta Flexível','Mindful Eating','Ortomolecular','Alergias Alimentares','Saúde da Mulher'
  ];
  const STATES = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
  ];

  const db = new SQL.Database();
  db.run(`
    CREATE TABLE nutritionists (id TEXT PRIMARY KEY, name TEXT, photo TEXT, crn TEXT, specialties TEXT, approaches TEXT, city TEXT, state TEXT, description TEXT, whatsapp TEXT, status TEXT, price INTEGER, experience TEXT, education TEXT, languages TEXT, modality TEXT);
    CREATE TABLE testimonials (id TEXT PRIMARY KEY, author TEXT, content TEXT, rating INTEGER);
    CREATE TABLE faqs (id TEXT PRIMARY KEY, question TEXT, answer TEXT);
    CREATE TABLE subscriptions (id TEXT PRIMARY KEY, name TEXT, email TEXT, phone TEXT, crn TEXT, specialties TEXT, approaches TEXT, status TEXT, date TEXT, photo TEXT);
    CREATE TABLE lists (key TEXT PRIMARY KEY, value TEXT);
  `);

  const insertNutri = db.prepare('INSERT INTO nutritionists VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  for (let i=0;i<30;i++){
    const id = `nutri-${i+1}`;
    const name = `Nutricionista ${i+1}`;
    const photo = `https://i.pravatar.cc/300?img=${i+10}`;
    const crn = `${Math.floor(10000 + Math.random() * 90000)}/SP`;
    const specialties = JSON.stringify([SPECIALTIES[i % SPECIALTIES.length], SPECIALTIES[(i+2) % SPECIALTIES.length]]);
    const approaches = JSON.stringify([APPROACHES[i % APPROACHES.length], APPROACHES[(i+3) % APPROACHES.length]]);
    const city = 'São Paulo';
    const state = 'SP';
    const description = 'Sou um profissional dedicado a ajudar você a alcançar seus objetivos de saúde através de uma alimentação equilibrada e consciente. Atendimento personalizado e humanizado.';
    const whatsapp = '5511999999999';
    const status = i % 5 === 0 ? 'pending' : 'active';
    const price = 40;
    const experience = 'Mais de 5 anos atuando em consultório clínico.';
    const education = 'Graduação em Nutrição pela USP. Pós-graduação em Nutrição Esportiva.';
    const languages = JSON.stringify(['Português','Inglês']);
    const modality = JSON.stringify(['online']);
    insertNutri.run([id,name,photo,crn,specialties,approaches,city,state,description,whatsapp,status,price,experience,education,languages,modality]);
  }

  const insertTest = db.prepare('INSERT INTO testimonials VALUES (?,?,?,?)');
  insertTest.run(['1','Maria Silva','O atendimento foi excelente. Consegui atingir meus objetivos de forma sustentável.',5]);
  insertTest.run(['2','João Souza','Profissional muito atencioso, o plano alimentar foi perfeitamente adaptado à minha rotina.',5]);
  insertTest.run(['3','Ana Paula','Mudei minha relação com a comida. Recomendo muito a plataforma!',4]);

  const insertFaq = db.prepare('INSERT INTO faqs VALUES (?,?,?)');
  insertFaq.run(['1','Como funciona a primeira consulta?','A primeira consulta é uma anamnese completa para entender sua rotina, objetivos e histórico de saúde.']);
  insertFaq.run(['2','As consultas são apenas online?','Sim, todas as consultas na NutriMeet são realizadas 100% online para oferecer mais conforto e acessibilidade.']);
  insertFaq.run(['3','Qual o valor das consultas?','O valor fixo na plataforma é de R$40 (valor social) aplicável para todos os profissionais parceiros nesta modalidade.']);

  const insertSub = db.prepare('INSERT INTO subscriptions VALUES (?,?,?,?,?,?,?,?,?,?)');
  for (let i=0;i<15;i++){
    const id = `sub-${i+1}`;
    const name = `Candidato ${i+1}`;
    const email = `candidato${i+1}@email.com`;
    const phone = '11988888888';
    const crn = `${Math.floor(10000 + Math.random() * 90000)}/RJ`;
    const specialties = JSON.stringify([SPECIALTIES[i % SPECIALTIES.length]]);
    const approaches = JSON.stringify([APPROACHES[i % APPROACHES.length]]);
    const status = i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'approved' : 'rejected';
    const date = new Date(Date.now() - Math.random() * 10000000000).toISOString();
    const photo = `https://i.pravatar.cc/150?img=${i + 40}`;
    insertSub.run([id,name,email,phone,crn,specialties,approaches,status,date,photo]);
  }

  const insertList = db.prepare('INSERT INTO lists VALUES (?,?)');
  insertList.run(['specialties', JSON.stringify(SPECIALTIES)]);
  insertList.run(['approaches', JSON.stringify(APPROACHES)]);
  insertList.run(['states', JSON.stringify(STATES)]);

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  console.log('Database initialized at', DB_PATH);
})();
