import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Search, UserCheck, MessageCircle, HeartPulse, Brain, Apple } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTestimonials, getFaqs } from '../lib/api';
import { useEffect, useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export function Home() {
  const [TESTIMONIALS, setTESTIMONIALS] = useState<any[]>([]);
  const [FAQS, setFAQS] = useState<any[]>([]);

  useEffect(() => {
    getTestimonials().then(setTESTIMONIALS).catch(() => setTESTIMONIALS([]));
    getFaqs().then(setFAQS).catch(() => setFAQS([]));
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-green-50/50 -skew-y-3 origin-top-right transform z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="text-center lg:text-left"
            >
              <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                Sua saúde em <span className="text-green-500">boas mãos.</span> A qualquer momento.
              </motion.h1>
              <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Encontre nutricionistas especializados, agende consultas com facilidade e comece sua jornada para uma vida mais saudável e equilibrada por um valor acessível de R$40.
              </motion.p>
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                  <Link to="/encontre-nutricionista">Encontrar Nutricionista</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 rounded-full bg-white hover:bg-gray-50 border-gray-200">
                  <Link to="/sou-nutricionista">Sou Nutricionista</Link>
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mt-12 lg:mt-0 w-full"
            >
              <div className="absolute -inset-4 bg-green-100 rounded-full blur-3xl opacity-50"></div>
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop"
                alt="Nutrição e Saúde"
                className="relative rounded-3xl shadow-2xl object-cover h-[350px] sm:h-[450px] lg:h-[500px] w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-lg text-gray-600">Três passos simples para iniciar sua mudança de hábitos.</p>
          </div>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 px-4 -mx-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible md:snap-none md:gap-8 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {[
              { icon: Search, title: '1. Procurar', desc: 'Filtre por especialidade, abordagem e localização para encontrar o perfil ideal.' },
              { icon: UserCheck, title: '2. Escolher', desc: 'Analise o perfil, formações e experiências dos nossos profissionais verificados.' },
              { icon: MessageCircle, title: '3. Contatar', desc: 'Entre em contato direto via WhatsApp para agendar sua consulta.' }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center flex-none w-[85%] snap-center md:w-auto"
              >
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Por que escolher a NutriMeet?</h2>
            <p className="text-lg text-gray-600">Nossa plataforma foi desenhada para oferecer a melhor experiência.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-none shadow-md bg-gray-50">
              <CardContent className="pt-6">
                <HeartPulse className="h-10 w-10 text-green-500 mb-4" />
                <h3 className="text-lg font-bold mb-2">Saúde Acessível</h3>
                <p className="text-gray-600">Consultas com valor social de R$40 para democratizar o acesso à nutrição de qualidade.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-gray-50">
              <CardContent className="pt-6">
                <Brain className="h-10 w-10 text-green-500 mb-4" />
                <h3 className="text-lg font-bold mb-2">Profissionais Verificados</h3>
                <p className="text-gray-600">Todos os nutricionistas possuem CRN ativo e passam por rigorosa análise de perfil.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-gray-50">
              <CardContent className="pt-6">
                <Apple className="h-10 w-10 text-green-500 mb-4" />
                <h3 className="text-lg font-bold mb-2">Diversas Abordagens</h3>
                <p className="text-gray-600">Desde esportiva até comportamental. Encontre quem fala a sua língua.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Depoimentos (Simples) */}
      <section className="py-24 bg-green-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">O que dizem nossos pacientes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <Card key={t.id} className="bg-white">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} filled={i < t.rating} />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4">"{t.content}"</p>
                  <p className="font-semibold text-gray-900">{t.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Dúvidas Frequentes</h2>
          </div>
          <Accordion.Root type="single" collapsible className="space-y-4">
            {FAQS.map((faq) => (
              <Accordion.Item key={faq.id} value={faq.id} className="border rounded-lg bg-gray-50 overflow-hidden">
                <Accordion.Header>
                  <Accordion.Trigger className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-900 hover:bg-gray-100 transition-colors [&[data-state=open]>svg]:rotate-180">
                    {faq.question}
                    <ChevronDownIcon />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="p-4 pt-0 text-gray-600 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
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

function Star({ filled }: { filled: boolean; key?: React.Key }) {
  return (
    <svg className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
