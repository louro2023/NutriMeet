import { useEffect, useState } from 'react';
import type React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Globe, GraduationCap, MapPin, MessageCircle } from 'lucide-react';
import { getNutritionist } from '../lib/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import foodHero from '../assets/food-hero.jpg';

export function NutritionistProfile() {
  const { id } = useParams();
  const [nutri, setNutri] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    getNutritionist(id).then(setNutri).catch(() => setNutri(null));
  }, [id]);

  if (!nutri) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7fbf3]">
        <div className="text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-emerald-950">Profissional não encontrado</h2>
          <Button asChild>
            <Link to="/encontre-nutricionista">Voltar para busca</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fbf3] pb-16">
      <section
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${foodHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/76 via-emerald-950/36 to-transparent" />
      </section>

      <div className="mx-auto -mt-40 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link to="/encontre-nutricionista" className="relative z-10 mb-8 inline-flex items-center rounded-full bg-white/[0.85] px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm backdrop-blur hover:bg-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para resultados
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card className="overflow-hidden shadow-xl shadow-emerald-950/10">
              <CardContent className="p-8">
                <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end">
                  <img src={nutri.photo} alt={nutri.name} className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg" />
                  <div className="flex-1">
                    <Badge className="mb-3 bg-lime-100 text-emerald-900">CRN: {nutri.crn}</Badge>
                    <h1 className="font-serif text-4xl font-extrabold text-emerald-950">{nutri.name}</h1>
                    <p className="mt-3 text-slate-600">{nutri.city}, {nutri.state}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="mb-3 text-xl font-bold text-emerald-950">Sobre o atendimento</h3>
                  <p className="whitespace-pre-wrap leading-8 text-slate-600">{nutri.description}</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <InfoBlock icon={<GraduationCap className="h-5 w-5" />} title="Formação" text={nutri.education} />
                  <InfoBlock icon={<Clock className="h-5 w-5" />} title="Experiência" text={nutri.experience} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h3 className="mb-6 text-2xl font-bold text-emerald-950">Especialidades e abordagens</h3>
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-bold uppercase text-slate-500">Especialidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {nutri.specialties.map((specialty: string) => (
                      <Badge key={specialty} className="bg-emerald-100 px-3 py-1 text-emerald-800">{specialty}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-bold uppercase text-slate-500">Abordagens</h4>
                  <div className="flex flex-wrap gap-2">
                    {nutri.approaches.map((approach: string) => (
                      <Badge key={approach} variant="outline" className="border-emerald-200 px-3 py-1 text-slate-600">{approach}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card className="sticky top-24 shadow-xl shadow-emerald-950/10">
              <CardContent className="p-6">
                <div className="mb-6 border-b border-emerald-100 pb-6 text-center">
                  <p className="mb-1 text-sm text-slate-500">Valor da consulta</p>
                  <p className="font-serif text-5xl font-extrabold text-emerald-950">R$ {nutri.price}<span className="text-lg font-normal text-slate-500">,00</span></p>
                </div>

                <div className="mb-8 space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin className="h-5 w-5 text-emerald-500" />
                    <span>{nutri.city}, {nutri.state}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Globe className="h-5 w-5 text-emerald-500" />
                    <span className="capitalize">{nutri.modality?.join(' e ') || 'online'}</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="flex h-14 w-full items-center gap-2 bg-[#25D366] text-base font-bold hover:bg-[#128C7E]"
                  onClick={() => window.open(`https://wa.me/${nutri.whatsapp}`, '_blank')}
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
      </div>
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
