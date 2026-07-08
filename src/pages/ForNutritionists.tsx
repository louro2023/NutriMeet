import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, HeartHandshake, Sparkles, TrendingUp, UploadCloud, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { createSubscription, getApproaches, getSpecialties, getStates } from '../lib/api';
import foodHero from '../assets/food-hero.jpg';

type FormState = {
  name: string;
  crn: string;
  email: string;
  phone: string;
  description: string;
  education: string;
  experience: string;
  specialties: string[];
  approaches: string[];
  city: string;
  state: string;
  photo: string;
};

const initialForm: FormState = {
  name: '',
  crn: '',
  email: '',
  phone: '',
  description: '',
  education: '',
  experience: '',
  specialties: [],
  approaches: [],
  city: '',
  state: '',
  photo: '',
};

const MAX_PROFILE_SELECTIONS = 3;

export function ForNutritionists() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>(initialForm);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [approaches, setApproaches] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    getSpecialties().then(setSpecialties).catch(() => setSpecialties([]));
    getApproaches().then(setApproaches).catch(() => setApproaches([]));
    getStates().then(setStates).catch(() => setStates([]));
  }, []);

  const updateForm = <Key extends keyof FormState>(field: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Envie uma imagem em JPG, PNG ou WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A foto deve ter no máximo 5MB.');
      return;
    }

    try {
      const photo = await compressProfilePhoto(file);
      updateForm('photo', photo);
    } catch (error) {
      console.error(error);
      setError('Não foi possível processar a foto. Tente outra imagem.');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.photo) {
      setError('Envie uma foto de perfil para concluir a inscrição.');
      return;
    }

    if (form.specialties.length === 0 || form.approaches.length === 0 || !form.city || !form.state) {
      setError('Selecione pelo menos uma especialidade, uma abordagem e preencha a localização para concluir a inscrição.');
      return;
    }

    setSubmitting(true);
    try {
      await createSubscription({
        name: form.name,
        crn: form.crn,
        email: form.email,
        phone: form.phone,
        description: form.description,
        education: form.education,
        experience: form.experience,
        city: form.city,
        state: form.state,
        photo: form.photo,
        specialties: form.specialties,
        approaches: form.approaches,
      });
      setSubmitted(true);
      setForm(initialForm);
    } catch (error) {
      console.error(error);
      setError('Não foi possível enviar sua inscrição. Tente novamente em instantes.');
    } finally {
      setSubmitting(false);
    }
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
              Recebemos seus dados e sua foto de perfil. Após a aprovação, ela será usada no perfil público.
            </p>
            <Button onClick={() => setSubmitted(false)} className="w-full">Enviar outra inscrição</Button>
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
              Faça parte de uma rede criada para conectar profissionais verificados a pacientes que buscam orientação acessível e acolhedora, com consulta social de R$40 para atendimentos recebidos pela NutriMeet.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-14 grid gap-5 md:grid-cols-3">
          {[
            { icon: Users, title: 'Mais visibilidade', desc: 'Seu perfil aparece para pacientes que já estão procurando atendimento nutricional.' },
            { icon: HeartHandshake, title: 'Propósito social', desc: 'Atenda pacientes vindos da plataforma pelo valor social de R$40 e ajude a democratizar o cuidado alimentar.' },
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
            <p className="mt-2 text-emerald-50/70">Sua foto será revisada e exibida no perfil público após aprovação.</p>
          </div>
          <CardContent className="p-8">
            <div className="mb-6 rounded-lg border border-lime-200 bg-lime-50 p-4">
              <p className="text-sm font-bold uppercase text-emerald-800">Compromisso de valor social</p>
              <p className="mt-2 leading-7 text-slate-700">
                Toda consulta que chegar para você através da NutriMeet deve ser cobrada pelo valor social de R$40.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Nome completo"><Input required value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Ex: Dra. Ana Silva" /></Field>
                <Field label="CRN"><Input required value={form.crn} onChange={(event) => updateForm('crn', event.target.value)} placeholder="Ex: 12345/SP" /></Field>
                <Field label="E-mail"><Input type="email" required value={form.email} onChange={(event) => updateForm('email', event.target.value)} placeholder="seu@email.com" /></Field>
                <Field label="WhatsApp"><Input required value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} placeholder="(11) 99999-9999" /></Field>
              </div>

              <Field label="Sobre mim">
                <Textarea required value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Conte sobre sua trajetória e abordagem de atendimento..." className="h-32" />
              </Field>

              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Formação">
                  <Textarea required value={form.education} onChange={(event) => updateForm('education', event.target.value)} placeholder="Ex: Graduação em Nutrição pela USP. Pós-graduação em Nutrição Clínica." className="h-28" />
                </Field>
                <Field label="Experiência">
                  <Textarea required value={form.experience} onChange={(event) => updateForm('experience', event.target.value)} placeholder="Ex: 5 anos de experiência em atendimento clínico e emagrecimento." className="h-28" />
                </Field>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Especialidades">
                  <MultiSelectField
                    values={form.specialties}
                    onChange={(value) => updateForm('specialties', value)}
                    options={specialties}
                    max={MAX_PROFILE_SELECTIONS}
                    emptyText="Nenhuma especialidade disponível no momento."
                  />
                </Field>
                <Field label="Abordagens">
                  <MultiSelectField
                    values={form.approaches}
                    onChange={(value) => updateForm('approaches', value)}
                    options={approaches}
                    max={MAX_PROFILE_SELECTIONS}
                    emptyText="Nenhuma abordagem disponível no momento."
                  />
                </Field>
                <Field label="Cidade">
                  <Input required value={form.city} onChange={(event) => updateForm('city', event.target.value)} placeholder="Ex: São Paulo" />
                </Field>
                <Field label="Estado">
                  <SelectField
                    required
                    value={form.state}
                    onChange={(value) => updateForm('state', value)}
                    placeholder="Selecione o estado"
                    options={states}
                  />
                </Field>
              </div>

              <Field label="Foto de perfil">
                <label className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-8 text-center transition-colors hover:bg-emerald-50">
                  {form.photo ? (
                    <>
                      <img src={form.photo} alt="Prévia da foto de perfil" className="mb-4 h-28 w-28 rounded-full border-4 border-white object-cover shadow-md" />
                      <p className="text-sm font-semibold text-emerald-950">Foto selecionada. Clique para trocar.</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                      <p className="text-sm font-semibold text-emerald-950">Clique para enviar a foto de perfil</p>
                    </>
                  )}
                  <p className="mt-1 text-xs text-slate-500">JPG, PNG ou WebP até 5MB. A imagem será compactada para até 300 x 300 px.</p>
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handlePhotoChange} />
                </label>
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
                <label className="flex items-start gap-3">
                  <input type="checkbox" required className="mt-1 h-4 w-4 rounded text-emerald-600" />
                  <span className="text-sm leading-6 text-slate-600">Estou ciente de que toda consulta recebida pela NutriMeet deve ser cobrada pelo valor social de R$40.</span>
                </label>
              </div>

              <Button type="submit" size="lg" className="h-14 w-full text-base" disabled={submitting}>
                {submitting ? 'Enviando inscrição...' : 'Enviar inscrição'}
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

function MultiSelectField({
  values,
  onChange,
  options,
  max,
  emptyText,
}: {
  values: string[];
  onChange: (value: string[]) => void;
  options: string[];
  max: number;
  emptyText: string;
}) {
  const selectedValues = values.filter(Boolean);
  const reachedLimit = selectedValues.length >= max;

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((value) => value !== option));
      return;
    }

    if (reachedLimit) return;
    onChange([...selectedValues, option]);
  };

  if (options.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-emerald-100 bg-white p-4 text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = selectedValues.includes(option);
          const disabled = !selected && reachedLimit;

          return (
            <label
              key={option}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${
                selected
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                  : 'border-emerald-100 bg-white text-slate-600'
              } ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-emerald-300'}`}
            >
              <input
                type="checkbox"
                checked={selected}
                disabled={disabled}
                onChange={() => toggleOption(option)}
                className="mt-0.5 h-4 w-4 rounded text-emerald-600"
              />
              <span className="leading-5">{option}</span>
            </label>
          );
        })}
      </div>
      <p className="text-xs font-medium text-slate-500">
        Selecione até {max}. {selectedValues.length}/{max} selecionadas.
      </p>
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
}) {
  return (
    <select
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="flex h-10 w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function compressProfilePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read image.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Unable to load image.'));
      image.onload = () => {
        const maxSize = 300;
        const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1);
        const width = Math.round(image.width * ratio);
        const height = Math.round(image.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Canvas is not supported.'));
          return;
        }

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
