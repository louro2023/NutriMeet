import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, HeartHandshake, Sparkles, TrendingUp, UploadCloud, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import foodHero from '../assets/food-hero.jpg';

export function ForNutritionists() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7fbf3] p-4">
        <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
          <Card className="border-emerald-100 p-8 text-center shadow-xl shadow-emerald-950/10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-lime-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-emerald-950">Inscrição enviada!</h2>
            <p className="mb-8 mt-3 leading-7 text-slate-600">
              Recebemos seus dados. Nossa equipe fará a validação do CRN e do perfil em até 48 horas.
            </p>
            <Button onClick={() => setSubmitted(false)} className="w-full">Voltar</Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fbf3]">
      <section
        className="relative overflow-hidden bg-cover bg-center py-24"
        style={{ backgroundImage: `url(${foodHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
              <Sparkles className="h-4 w-4 text-lime-500" />
              Para nutricionistas
            </p>
            <h1 className="font-serif text-5xl font-extrabold leading-tight text-emerald-950 sm:text-6xl">
              Amplie seus atendimentos com uma plataforma mais humana.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-700">
              Faça parte de uma rede criada para conectar profissionais verificados a pacientes que buscam orientação acessível e acolhedora.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-14 grid gap-5 md:grid-cols-3">
          {[
            { icon: Users, title: 'Mais visibilidade', desc: 'Seu perfil aparece para pacientes que já estão procurando atendimento nutricional.' },
            { icon: HeartHandshake, title: 'Propósito social', desc: 'Atenda com valor acessível e ajude a democratizar o cuidado alimentar.' },
            { icon: TrendingUp, title: 'Crescimento digital', desc: 'Construa presença online com perfil profissional, filtros e contato direto.' },
          ].map((benefit) => (
            <Card key={benefit.title} className="bg-white/90">
              <CardContent className="p-7">
                <benefit.icon className="mb-5 h-10 w-10 text-emerald-600" />
                <h3 className="text-xl font-bold text-emerald-950">{benefit.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{benefit.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mx-auto max-w-4xl overflow-hidden border-emerald-100 shadow-xl shadow-emerald-950/10">
          <div className="bg-emerald-950 p-8 text-center text-white">
            <p className="text-sm font-bold uppercase text-lime-200">Cadastro profissional</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Conte para nós sobre seu atendimento</h2>
            <p className="mt-2 text-emerald-50/70">Essas informações ajudam nossa equipe a avaliar e montar um perfil mais completo.</p>
          </div>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Nome completo"><Input required placeholder="Ex: Dra. Ana Silva" /></Field>
                <Field label="CRN"><Input required placeholder="Ex: 12345/SP" /></Field>
                <Field label="E-mail"><Input type="email" required placeholder="seu@email.com" /></Field>
                <Field label="WhatsApp"><Input required placeholder="(11) 99999-9999" /></Field>
              </div>

              <Field label="Sobre mim">
                <Textarea required placeholder="Conte sobre sua trajetória, formação e abordagem de atendimento..." className="h-32" />
              </Field>

              <Field label="Foto de perfil">
                <div className="cursor-pointer rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-8 text-center transition-colors hover:bg-emerald-50">
                  <UploadCloud className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                  <p className="text-sm font-semibold text-emerald-950">Clique ou arraste para fazer upload</p>
                  <p className="mt-1 text-xs text-slate-500">JPG ou PNG até 5MB</p>
                </div>
              </Field>

              <div className="space-y-4 border-t border-emerald-100 pt-4">
                <label className="flex items-start gap-3">
                  <input type="checkbox" required className="mt-1 h-4 w-4 rounded text-emerald-600" />
                  <span className="text-sm leading-6 text-slate-600">Declaro que minhas informações são verdadeiras e estou de acordo com os termos de uso.</span>
                </label>
                <label className="flex items-start gap-3">
                  <input type="checkbox" required className="mt-1 h-4 w-4 rounded text-emerald-600" />
                  <span className="text-sm leading-6 text-slate-600">Comprometo-me a seguir o Código de Ética do CFN em todos os atendimentos via plataforma.</span>
                </label>
              </div>

              <Button type="submit" size="lg" className="h-14 w-full text-base">
                Enviar inscrição
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-emerald-950">{label}</label>
      {children}
    </div>
  );
}
