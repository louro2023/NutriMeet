import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { getSpecialties, getApproaches, updateList } from '../lib/api';
import { useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { useToast } from '../components/ui/toastContext';

export function AdminSettings() {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [approaches, setApproaches] = useState<string[]>([]);

  useEffect(() => {
    getSpecialties().then((s: string[]) => setSpecialties(s)).catch(() => setSpecialties([]));
    getApproaches().then((a: string[]) => setApproaches(a)).catch(() => setApproaches([]));
  }, []);
  const toast = useToast();
  
  const [newSpec, setNewSpec] = useState('');
  const [newAppr, setNewAppr] = useState('');

  const handleAddSpec = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSpec) {
      const next = [...specialties, newSpec];
      setSpecialties(next); setNewSpec('');
      updateList('specialties', next).then(() => toast.success('Especialidade adicionada')).catch(() => toast.error('Erro ao adicionar'));
    }
  };

  const handleAddAppr = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAppr) {
      const next = [...approaches, newAppr];
      setApproaches(next); setNewAppr('');
      updateList('approaches', next).then(() => toast.success('Abordagem adicionada')).catch(() => toast.error('Erro ao adicionar'));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h2>

      <Tabs.Root defaultValue="lists" className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Tabs.List className="flex border-b">
          <Tabs.Trigger value="lists" className="px-6 py-4 text-sm font-medium text-gray-500 data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 outline-none transition-colors">
            Listas (Especialidades/Abordagens)
          </Tabs.Trigger>
          <Tabs.Trigger value="content" className="px-6 py-4 text-sm font-medium text-gray-500 data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 outline-none transition-colors">
            Conteúdo / FAQ
          </Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="lists" className="p-6 space-y-8 outline-none">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Especialidades</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSpec} className="flex gap-2 mb-4">
                  <Input value={newSpec} onChange={e => setNewSpec(e.target.value)} placeholder="Nova especialidade" />
                  <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
                </form>
                <ul className="space-y-2">
                  {specialties.map(s => (
                    <li key={s} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <span className="text-sm">{s}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => {
                        const next = specialties.filter(x => x !== s);
                        setSpecialties(next);
                        updateList('specialties', next).then(() => toast.success('Especialidade removida')).catch(() => toast.error('Erro ao remover'));
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Abordagens</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAppr} className="flex gap-2 mb-4">
                  <Input value={newAppr} onChange={e => setNewAppr(e.target.value)} placeholder="Nova abordagem" />
                  <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
                </form>
                <ul className="space-y-2">
                  {approaches.map(a => (
                    <li key={a} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <span className="text-sm">{a}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => {
                        const next = approaches.filter(x => x !== a);
                        setApproaches(next);
                        updateList('approaches', next).then(() => toast.success('Abordagem removida')).catch(() => toast.error('Erro ao remover'));
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </Tabs.Content>
        
        <Tabs.Content value="content" className="p-6 space-y-6 outline-none">
          <p className="text-gray-500">Módulo de edição de conteúdo da Home e FAQ.</p>
          <Button>Salvar Conteúdo</Button>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
