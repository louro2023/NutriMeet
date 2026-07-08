import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Accordion from '@radix-ui/react-accordion';
import { motion } from 'framer-motion';
import { Apple, BadgeCheck, Brain, ChevronDown, HeartPulse, MessageCircle, Search, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { getFaqs, getTestimonials, preloadSearchData } from '../lib/api';
import foodHero from '../assets/food-hero.jpg';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const fallbackTestimonials = [
  {
    id: 'fallback-1',
    author: 'Maria Clara',
    content: 'Encontrei uma profissional acolhedora e consegui organizar minha rotina alimentar sem radicalismos.',
    rating: 5,
  },
  {
    id: 'fallback-2',
    author: 'Rafael Santos',
    content: 'A consulta foi objetiva, humana e com um plano que cabia na minha vida real.',
    rating: 5,
  },
  {
    id: 'fallback-3',
    author: 'Ana Paula',
    content: 'Gostei da facilidade para escolher a abordagem e falar direto com a nutricionista pelo WhatsApp.',
    rating: 5,
  },
];

const fallbackFaqs = [
  {
    id: 'fallback-faq-1',
    question: 'Como funciona a primeira consulta?',
    answer: 'A primeira conversa é uma avaliação completa da sua rotina, objetivos, histórico de saúde e preferências alimentares.',
  },
  {
    id: 'fallback-faq-2',
    question: 'As consultas são online?',
    answer: 'A plataforma prioriza atendimento online para facilitar o acesso, mas cada profissional informa sua modalidade no perfil.',
  },
  {
    id: 'fallback-faq-3',
    question: 'Qual é o valor das consultas?',
    answer: 'A consulta iniciada pela NutriMeet tem valor social de R$40 com os profissionais participantes da plataforma.',
  },
];

export function Home() {
  const [testimonials, setTestimonials] = useState<any[]>(fallbackTestimonials);
  const [faqs, setFaqs] = useState<any[]>(fallbackFaqs);

  useEffect(() => {
    getTestimonials()
      .then((items) => setTestimonials(items.length ? items : fallbackTestimonials))
      .catch(() => setTestimonials(fallbackTestimonials));
    getFaqs()
      .then((items) => setFaqs(items.length ? items : fallbackFaqs))
      .catch(() => setFaqs(fallbackFaqs));

    const preloadTimer = window.setTimeout(() => {
      preloadSearchData();
    }, 800);

    return () => window.clearTimeout(preloadTimer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <section
        className="relative isolate min-h-[760px] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${foodHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/[0.88] to-white/[0.18]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f7fbf3]" />

        <div className="relative z-10 mx-auto flex min-h-[760px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-2xl"
          >
            <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-lime-500" />
              Consulta social por R$40 com profissionais verificados
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-serif text-5xl font-extrabold leading-[1.02] text-emerald-950 sm:text-6xl lg:text-7xl">
              Encontre cuidado nutricional com sabor de vida real.
            </motion.h1>

            <motion.p variants={itemVariants} className="mt-6 max-w-xl text-lg leading-8 text-slate-700 sm:text-xl">
              Conecte-se a nutricionistas verificados, escolha a abordagem que combina com você e marque sua consulta pela plataforma com valor social de R$40.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="text-base">
                <Link to="/encontre-nutricionista" onFocus={preloadSearchData} onMouseEnter={preloadSearchData}>
                  Encontrar nutricionista
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/80 text-base backdrop-blur">
                <Link to="/sou-nutricionista">Sou nutricionista</Link>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ['R$40', 'consulta social'],
                ['100%', 'online e simples'],
                ['CRN', 'perfis verificados'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-white/70 bg-white/[0.72] p-4 shadow-sm backdrop-blur">
                  <p className="text-2xl font-extrabold text-emerald-900">{value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase text-slate-500">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#f7fbf3] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Como funciona"
            title="Três passos para sair da intenção e começar."
            description="A experiência foi pensada para ser clara, rápida e humana, do primeiro filtro ao primeiro contato."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: Search, title: 'Procure pelo seu momento', desc: 'Filtre por especialidade, abordagem e localização para encontrar perfis alinhados ao seu objetivo.' },
              { icon: UserCheck, title: 'Escolha com confiança', desc: 'Veja CRN, experiência, formação e estilo de atendimento antes de decidir.' },
              { icon: MessageCircle, title: 'Converse direto', desc: 'Abra o WhatsApp do profissional e combine sua consulta social de R$40 sem burocracia.' },
            ].map((step, idx) => (
              <motion.div key={step.title} whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
                <Card className="h-full overflow-hidden border-emerald-100 bg-white/90 shadow-md shadow-emerald-950/5">
                  <CardContent className="p-7">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                      <step.icon className="h-7 w-7" />
                    </div>
                    <p className="mb-3 text-sm font-bold uppercase text-lime-600">Passo {idx + 1}</p>
                    <h3 className="text-2xl font-bold text-emerald-950">{step.title}</h3>
                    <p className="mt-4 leading-7 text-slate-600">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="mb-4 text-sm font-bold uppercase text-lime-600">Por que a NutriMeet?</p>
              <h2 className="font-serif text-4xl font-extrabold text-emerald-950 sm:text-5xl">
                Saúde alimentar sem cara de dieta impossível.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                A plataforma une profissionais qualificados, consulta social de R$40 e um jeito simples de encontrar quem entende sua rotina.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { icon: HeartPulse, title: 'Acesso mais leve', desc: 'Consulta social de R$40 para aproximar nutrição de quem precisa começar.' },
                { icon: BadgeCheck, title: 'Profissionais verificados', desc: 'Perfis com CRN, formação e informações claras para você decidir melhor.' },
                { icon: Brain, title: 'Abordagem individual', desc: 'Escolha entre nutrição comportamental, clínica, esportiva, funcional e outras linhas.' },
                { icon: Apple, title: 'Rotina possível', desc: 'Planos pensados para caber no cotidiano, sem promessa mágica ou culpa.' },
              ].map((item) => (
                <Card key={item.title} className="border-emerald-100 bg-[#f7fbf3]">
                  <CardContent className="p-6">
                    <item.icon className="mb-5 h-9 w-9 text-emerald-600" />
                    <h3 className="text-xl font-bold text-emerald-950">{item.title}</h3>
                    <p className="mt-3 leading-7 text-slate-600">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Experiências"
            title="Gente real, rotina real, cuidado real."
            description="Depoimentos de quem encontrou orientação profissional com mais praticidade."
            dark
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.id} className="border-white/10 bg-white/[0.08] text-white shadow-none backdrop-blur">
                <CardContent className="p-7">
                  <div className="mb-5 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} filled={i < t.rating} />
                    ))}
                  </div>
                  <p className="leading-7 text-emerald-50/85">"{t.content}"</p>
                  <p className="mt-6 font-bold text-lime-200">{t.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7fbf3] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Dúvidas frequentes"
            title="O essencial antes de marcar sua consulta."
            description="Respostas rápidas para você entender como começar pela NutriMeet."
          />

          <Accordion.Root type="single" collapsible className="mt-10 space-y-3">
            {faqs.map((faq) => (
              <Accordion.Item key={faq.id} value={faq.id} className="overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-sm">
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full items-center justify-between gap-4 p-5 text-left text-base font-bold text-emerald-950 transition-colors hover:bg-emerald-50 [&[data-state=open]>svg]:rotate-180">
                    {faq.question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-emerald-600 transition-transform" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="px-5 pb-5 leading-7 text-slate-600 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  {faq.answer}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, dark = false }: { eyebrow: string; title: string; description: string; dark?: boolean }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className={`mb-4 text-sm font-bold uppercase ${dark ? 'text-lime-200' : 'text-lime-600'}`}>{eyebrow}</p>
      <h2 className={`font-serif text-4xl font-extrabold sm:text-5xl ${dark ? 'text-white' : 'text-emerald-950'}`}>{title}</h2>
      <p className={`mt-5 text-lg leading-8 ${dark ? 'text-emerald-50/70' : 'text-slate-600'}`}>{description}</p>
    </div>
  );
}

function Star({ filled }: { filled: boolean; key?: React.Key }) {
  return (
    <svg className={`h-5 w-5 ${filled ? 'text-lime-300' : 'text-white/25'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
