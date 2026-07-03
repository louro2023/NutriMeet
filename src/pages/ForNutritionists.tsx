import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle2, UploadCloud, Users, TrendingUp, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

export function ForNutritionists() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
          <Card className="text-center p-8 border-none shadow-lg">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscrição Enviada!</h2>
            <p className="text-gray-600 mb-8">
              Recebemos seus dados com sucesso. Nossa equipe fará a validação do seu CRN e perfil em até 48 horas. Você receberá um e-mail com os próximos passos.
            </p>
            <Button onClick={() => setSubmitted(false)} className="w-full">Voltar</Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-green-50/50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Junte-se à maior rede de nutricionistas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Amplie seus atendimentos, gerencie pacientes com facilidade e faça parte de um movimento que democratiza a saúde.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-6">
            <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Mais Pacientes</h3>
            <p className="text-gray-600">Aumente sua visibilidade e receba contatos diretos de pacientes interessados no seu perfil.</p>
          </div>
          <div className="text-center p-6">
            <HeartHandshake className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Propósito</h3>
            <p className="text-gray-600">Atenda com um valor social e ajude a democratizar o acesso à saúde nutricional.</p>
          </div>
          <div className="text-center p-6">
            <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Crescimento</h3>
            <p className="text-gray-600">Construa sua reputação online através de avaliações e um perfil profissional completo.</p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto">
          <Card className="border-gray-200 shadow-xl rounded-2xl overflow-hidden">
            <div className="bg-gray-900 p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Formulário de Inscrição</h2>
              <p className="text-gray-400">Preencha seus dados para análise da nossa equipe</p>
            </div>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                    <Input required placeholder="Ex: Dra. Ana Silva" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">CRN</label>
                    <Input required placeholder="Ex: 12345/SP" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">E-mail</label>
                    <Input type="email" required placeholder="seu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">WhatsApp</label>
                    <Input required placeholder="(11) 99999-9999" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sobre mim</label>
                  <Textarea required placeholder="Conte um pouco sobre sua trajetória, formação e como você atende seus pacientes..." className="h-32" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Foto de Perfil</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <UploadCloud className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Clique ou arraste para fazer upload</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG até 5MB</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" required className="mt-1 w-4 h-4 text-green-600 rounded" />
                    <span className="text-sm text-gray-600">
                      Declaro que minhas informações são verdadeiras e estou de acordo com os <a href="#" className="text-green-600 underline">Termos de Uso</a>.
                    </span>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" required className="mt-1 w-4 h-4 text-green-600 rounded" />
                    <span className="text-sm text-gray-600">
                      Comprometo-me a seguir o Código de Ética do CFN em todos os atendimentos via plataforma.
                    </span>
                  </label>
                </div>

                <Button type="submit" size="lg" className="w-full text-lg h-14 mt-4">
                  Enviar Inscrição
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
