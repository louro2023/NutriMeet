import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { ApiError, loginAdmin } from '../lib/api';
import foodHero from '../assets/food-hero.jpg';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await loginAdmin(email, password);
      try { localStorage.setItem('adminToken', data.token); } catch(e) {}
      navigate('/admin');
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      } else {
        setError('Erro no servidor. Verifique /api/health e os logs da Vercel.');
      }
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${foodHero})` }}
    >
      <div className="absolute inset-0 bg-emerald-950/45 backdrop-blur-[2px]" />
      <Card className="relative w-full max-w-md border-white/40 bg-white/[0.92] shadow-2xl shadow-emerald-950/25 backdrop-blur">
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-emerald-950">Acesso restrito</h2>
          <p className="text-sm text-slate-500">Painel administrativo NutriMeet</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">E-mail corporativo</label>
              <Input 
                type="email" 
                value={email}
                placeholder="seu@email.com"
                onChange={e => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <Input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button type="submit" className="w-full mt-6" size="lg">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
