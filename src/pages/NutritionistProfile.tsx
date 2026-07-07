import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Globe, GraduationCap, LoaderCircle, MapPin, MessageCircle } from 'lucide-react';
import { getNutritionist } from '../lib/api';
import type { Nutritionist } from '../types';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import foodHero from '../assets/food-hero.jpg';

type LoadStatus = 'loading' | 'ready' | 'not-found';

export function NutritionistProfile() {
  const { id } = useParams();
  const [nutri, setNutri] = useState<Nutritionist | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    if (!id) {
      setStatus('not-found');
      setNutri(null);
      return () => {
        cancelled = true;
      };
    }

    setStatus('loading');
    getNutritionist(id)
      .then((profile: Nutritionist | null) => {
        if (cancelled) return;
        if (!profile?.id) {
          setNutri(null);
          setStatus('not-found');
          return;
        }
        setNutri(profile);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setNutri(null);
        setStatus('not-found');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7fbf3]">
        <div className="flex items-center gap-3 rounded-full border border-emerald-100 bg-white px-5 py-3 text-sm font-semibold text-emerald-900 shadow-sm">
          <LoaderCircle className="h-5 w-5 animate-spin text-emerald-600" />
          Carregando perfil profissional
        </div>
      </div>
    );
  }

  if (!nutri) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7fbf3] px-4">
        <div className="max-w-md rounded-lg border border-emerald-100 bg-white p-8 text-center shadow-xl shadow-emerald-950/10">
          <h2 className="mb-3 font-serif text-3xl font-bold text-emerald-950">Perfil profissional não encontrado</h2>
          <p className="mb-6 text-sm leading-6 text-slate-600">
            Esse cadastro pode ter sido removido ou ainda não está ativo na busca.
          </p>
          <Button asChild>
            <Link to="/encontre-nutricionista">Voltar para busca</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <ProfileContent nutri={nutri} />;
}

function ProfileContent({ nutri }: { nutri: Nutritionist }) {
  const location = [nutri.city, nutri.state].filter(Boolean).join(', ') || 'Localização em breve';
  const modality = nutri.modality?.length ? nutri.modality.join(' e ') : 'online';
  const price = useMemo(() => (
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(nutri.price || 0))
  ), [nutri.price]);
  const whatsapp = String(nutri.whatsapp || '').replace(/\D/g, '');

  return (
    <div className="min-h-screen bg-[#f7fbf3] pb-16">
      <section
        className="relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${foodHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/82 via-emerald-950/46 to-emerald-950/10" />
        <div className="relative mx-auto flex min-h-72 max-w-7xl flex-col justify-between px-4 py-10 sm:px-6 lg:px-8">
          <Link to="/encontre-nutricionista" className="inline-flex w-fit items-center rounded-full bg-white/[0.9] px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm backdrop-blur transition hover:bg-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para resultados
          </Link>
          <div className="max-w-2xl pb-8 text-white">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-lime-200">Perfil profissional</p>
            <h1 className="font-serif text-4xl font-extrabold leading-tight sm:text-5xl">{nutri.name}</h1>
            <p className="mt-4 flex items-center gap-2 text-emerald-50">
              <MapPin className="h-5 w-5 text-lime-200" />
              {location}
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-8">
            <Card className="overflow-hidden shadow-xl shadow-emerald-950/10">
              <CardContent className="p-0">
                <div className="border-b border-emerald-100 bg-white p-6 sm:p-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <ProfilePhoto src={nutri.photo} name={nutri.name} />
                    <div className="min-w-0 flex-1">
                      <Badge className="mb-3 bg-lime-100 text-emerald-900">CRN: {nutri.crn || 'Em análise'}</Badge>
                      <h2 className="break-words font-serif text-3xl font-extrabold text-emerald-950 sm:text-4xl">{nutri.name}</h2>
                      <p className="mt-3 text-slate-600">{location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 p-6 sm:p-8">
                  <div>
                    <h3 className="mb-3 text-xl font-bold text-emerald-950">Sobre o atendimento</h3>
                    <p className="whitespace-pre-wrap leading-8 text-slate-600">
                      {nutri.description || 'Descrição em breve.'}
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <InfoBlock icon={<GraduationCap className="h-5 w-5" />} title="Formação" text={nutri.education} />
                    <InfoBlock icon={<Clock className="h-5 w-5" />} title="Experiência" text={nutri.experience} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <h3 className="mb-6 text-2xl font-bold text-emerald-950">Especialidades e abordagens</h3>
                <ProfileTags title="Especialidades" items={nutri.specialties} emptyText="Especialidades em breve." />
                <div className="mt-7">
                  <ProfileTags title="Abordagens" items={nutri.approaches} emptyText="Abordagens em breve." variant="outline" />
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="lg:sticky lg:top-24">
            <Card className="shadow-xl shadow-emerald-950/10">
              <CardContent className="p-6">
                <div className="mb-6 border-b border-emerald-100 pb-6 text-center">
                  <p className="mb-1 text-sm text-slate-500">Valor da consulta</p>
                  <p className="font-serif text-5xl font-extrabold text-emerald-950">{price}</p>
                </div>

                <div className="mb-8 space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin className="h-5 w-5 shrink-0 text-emerald-500" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Globe className="h-5 w-5 shrink-0 text-emerald-500" />
                    <span className="capitalize">{modality}</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  disabled={!whatsapp}
                  className="flex h-14 w-full items-center gap-2 bg-[#25D366] text-base font-bold hover:bg-[#128C7E] disabled:bg-slate-300"
                  onClick={() => window.open(`https://wa.me/${whatsapp}`, '_blank')}
                >
                  <MessageCircle className="h-6 w-6" />
                  Agendar no WhatsApp
                </Button>
                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  Você será redirecionado para conversar direto com o profissional.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}

function ProfilePhoto({ src, name }: { src?: string; name: string }) {
  if (!src) {
    return (
      <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-4 border-white bg-emerald-100 text-3xl font-bold text-emerald-800 shadow-lg">
        {initials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="h-32 w-32 shrink-0 rounded-full border-4 border-white bg-emerald-50 object-cover shadow-lg"
    />
  );
}

function ProfileTags({
  title,
  items,
  emptyText,
  variant,
}: {
  title: string;
  items?: string[];
  emptyText: string;
  variant?: 'outline';
}) {
  const values = items?.filter(Boolean) || [];

  return (
    <div>
      <h4 className="mb-3 text-sm font-bold uppercase text-slate-500">{title}</h4>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((item) => (
            <Badge
              key={item}
              variant={variant}
              className={variant === 'outline' ? 'border-emerald-200 px-3 py-1 text-slate-600' : 'bg-emerald-100 px-3 py-1 text-emerald-800'}
            >
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{emptyText}</p>
      )}
    </div>
  );
}

function InfoBlock({ icon, title, text }: { icon: React.ReactNode; title: string; text?: string }) {
  return (
    <div className="rounded-lg bg-emerald-50/70 p-5">
      <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-emerald-950">
        <span className="text-emerald-600">{icon}</span>
        {title}
      </h3>
      <p className="leading-7 text-slate-600">{text || 'Informação em breve.'}</p>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NM';
}
