import { FAQ, Nutritionist, Subscription, Testimonial } from '../types';

export const SPECIALTIES = [
  'Nutrição Esportiva',
  'Nutrição Clínica',
  'Emagrecimento',
  'Materno Infantil',
  'Oncológica',
  'Comportamental',
  'Vegetariana',
  'Funcional',
];

export const APPROACHES = [
  'Comportamental',
  'Low Carb',
  'Jejum Intermitente',
  'Dieta Flexível',
  'Mindful Eating',
  'Ortomolecular',
  'Alergias Alimentares',
  'Saúde da Mulher',
];

export const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const NUTRITIONISTS: Nutritionist[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `nutri-${i + 1}`,
  name: `Nutricionista ${i + 1}`,
  photo: `https://i.pravatar.cc/300?img=${i + 10}`,
  crn: `${Math.floor(10000 + Math.random() * 90000)}/SP`,
  specialties: [SPECIALTIES[i % SPECIALTIES.length], SPECIALTIES[(i + 2) % SPECIALTIES.length]],
  approaches: [APPROACHES[i % APPROACHES.length], APPROACHES[(i + 3) % APPROACHES.length]],
  city: 'São Paulo',
  state: 'SP',
  description: 'Sou um profissional dedicado a ajudar você a alcançar seus objetivos de saúde através de uma alimentação equilibrada e consciente. Atendimento personalizado e humanizado.',
  whatsapp: '5511999999999',
  status: i % 5 === 0 ? 'pending' : 'active',
  price: 40,
  experience: 'Mais de 5 anos atuando em consultório clínico.',
  education: 'Graduação em Nutrição pela USP. Pós-graduação em Nutrição Esportiva.',
  languages: ['Português', 'Inglês'],
  modality: ['online'],
}));

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    author: 'Maria Silva',
    content: 'O atendimento foi excelente. Consegui atingir meus objetivos de forma sustentável.',
    rating: 5,
  },
  {
    id: '2',
    author: 'João Souza',
    content: 'Profissional muito atencioso, o plano alimentar foi perfeitamente adaptado à minha rotina.',
    rating: 5,
  },
  {
    id: '3',
    author: 'Ana Paula',
    content: 'Mudei minha relação com a comida. Recomendo muito a plataforma!',
    rating: 4,
  },
];

export const FAQS: FAQ[] = [
  {
    id: '1',
    question: 'Como funciona a primeira consulta?',
    answer: 'A primeira consulta é uma anamnese completa para entender sua rotina, objetivos e histórico de saúde.',
  },
  {
    id: '2',
    question: 'As consultas são apenas online?',
    answer: 'Sim, todas as consultas na NutriMeet são realizadas 100% online para oferecer mais conforto e acessibilidade.',
  },
  {
    id: '3',
    question: 'Qual o valor das consultas?',
    answer: 'O valor fixo na plataforma é de R$40 (valor social) aplicável para todos os profissionais parceiros nesta modalidade.',
  },
];

export const SUBSCRIPTIONS: Subscription[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `sub-${i + 1}`,
  name: `Candidato ${i + 1}`,
  email: `candidato${i + 1}@email.com`,
  phone: '11988888888',
  crn: `${Math.floor(10000 + Math.random() * 90000)}/RJ`,
  specialties: [SPECIALTIES[i % SPECIALTIES.length]],
  approaches: [APPROACHES[i % APPROACHES.length]],
  status: i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'approved' : 'rejected',
  date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  photo: `https://i.pravatar.cc/150?img=${i + 40}`,
}));
