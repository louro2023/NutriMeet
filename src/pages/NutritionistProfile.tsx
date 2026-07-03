import { useParams, Link } from 'react-router-dom';
import { MapPin, GraduationCap, Clock, Globe, ArrowLeft, MessageCircle } from 'lucide-react';
import { getNutritionist } from '../lib/api';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export function NutritionistProfile() {
  const { id } = useParams();
  const [nutri, setNutri] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    getNutritionist(id).then(setNutri).catch(() => setNutri(null));
  }, [id]);

  if (!nutri) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profissional não encontrado</h2>
          <Button asChild>
            <Link to="/encontre-nutricionista">Voltar para busca</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/encontre-nutricionista" className="inline-flex items-center text-gray-500 hover:text-green-600 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para resultados
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden border-none shadow-sm">
              <div className="h-32 bg-gradient-to-r from-green-400 to-green-600"></div>
              <CardContent className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 mb-6">
                  <img src={nutri.photo} alt={nutri.name} className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover" />
                  <div className="flex-1">
                    <h1 className="text-3xl font-extrabold text-gray-900">{nutri.name}</h1>
                    <p className="text-sm font-mono text-gray-500 mt-1">CRN: {nutri.crn}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sobre mim</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{nutri.description}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-green-500" /> Formação
                    </h3>
                    <p className="text-gray-600">{nutri.education}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-green-500" /> Experiência
                    </h3>
                    <p className="text-gray-600">{nutri.experience}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Especialidades e Abordagens</h3>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Especialidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {nutri.specialties.map(s => (
                      <Badge key={s} variant="secondary" className="px-3 py-1 bg-green-50 text-green-700">{s}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Abordagens</h4>
                  <div className="flex flex-wrap gap-2">
                    {nutri.approaches.map(a => (
                      <Badge key={a} variant="outline" className="px-3 py-1 text-gray-600">{a}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6 pb-6 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Valor da consulta</p>
                  <p className="text-4xl font-extrabold text-gray-900">R$ {nutri.price}<span className="text-lg text-gray-500 font-normal">,00</span></p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span>{nutri.city}, {nutri.state}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <span className="capitalize">{nutri.modality.join(' e ')}</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold bg-[#25D366] hover:bg-[#128C7E] flex items-center gap-2"
                  onClick={() => window.open(`https://wa.me/${nutri.whatsapp}`, '_blank')}
                >
                  <MessageCircle className="h-6 w-6" />
                  Agendar no WhatsApp
                </Button>
                <p className="text-xs text-center text-gray-400 mt-4">
                  Ao clicar, você será redirecionado para o WhatsApp do profissional.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
