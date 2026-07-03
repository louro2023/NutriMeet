import { useState } from 'react';
import { getNutritionists, updateNutritionist, deleteNutritionist, createNutritionist, deleteAllNutritionists } from '../lib/api';
import { useEffect } from 'react';
import { useToast } from '../components/ui/toastContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Drawer } from '../components/ui/drawer';
import { Search, MoreVertical, Edit2, Ban, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Nutritionist } from '../types';

export function AdminProfessionals() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  useEffect(() => { getNutritionists().then(setProfessionals).catch(() => setProfessionals([])); }, []);
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [newProf, setNewProf] = useState<any>({ name: '', crn: '', photo: '', city: '', state: '', price: 0, whatsapp: '', specialties: '', approaches: '', status: 'pending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProf, setEditingProf] = useState<Nutritionist | null>(null);

  const filtered = professionals.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.crn.includes(searchTerm));

  const toast = useToast();

  const handleToggleStatus = (id: string) => {
    (async () => {
      try {
        const prof = professionals.find(p => p.id === id);
        if (!prof) return;
        const newStatus = prof.status === 'active' ? 'pending' : 'active';
        const updated = await updateNutritionist(id, { status: newStatus });
        setProfessionals(professionals.map(p => p.id === id ? updated : p));
        toast.success('Status do profissional atualizado');
      } catch (e) { console.error(e); toast.error('Erro ao alterar status'); }
    })();
  };

  const handleDelete = (id: string) => {
    (async () => {
      try {
        await deleteNutritionist(id);
        setProfessionals(professionals.filter(p => p.id !== id));
        toast.success('Profissional excluído');
      } catch (e) { console.error(e); toast.error('Erro ao excluir profissional'); }
    })();
  };

  const handleCreate = async () => {
    try {
      const payload = { ...newProf };
      // convert comma lists
      payload.specialties = (newProf.specialties || '').split(',').map((s: string) => s.trim()).filter(Boolean);
      payload.approaches = (newProf.approaches || '').split(',').map((s: string) => s.trim()).filter(Boolean);
      const created = await createNutritionist(payload);
      setProfessionals([created, ...professionals]);
      setCreatingOpen(false);
      setNewProf({ name: '', crn: '', photo: '', city: '', state: '', price: 0, whatsapp: '', specialties: '', approaches: '', status: 'pending' });
      toast.success('Profissional criado');
    } catch (e) { console.error(e); toast.error('Erro ao criar profissional'); }
  };

  const handleClearAll = async () => {
    if (!confirm('Tem certeza que deseja remover TODOS os profissionais? Esta ação é irreversível.')) return;
    try {
      await deleteAllNutritionists();
      setProfessionals([]);
      toast.success('Todos os profissionais foram removidos');
    } catch (e) { console.error(e); toast.error('Erro ao limpar profissionais'); }
  };

  const handleSaveEdit = () => {
    if (editingProf) {
      (async () => {
        try {
          const updated = await updateNutritionist(editingProf.id, editingProf);
          setProfessionals(professionals.map(p => p.id === editingProf.id ? updated : p));
          setEditingProf(null);
          toast.success('Alterações salvas');
        } catch (e) { console.error(e); toast.error('Erro ao salvar alterações'); }
      })();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profissionais</h2>
      </div>

      <Card className="border-none shadow-sm bg-white p-4">
        <div className="flex gap-2 justify-end mb-4">
          <Button variant="outline" onClick={() => setCreatingOpen(true)}>Adicionar profissional</Button>
          <Button variant="destructive" onClick={handleClearAll}>Limpar profissionais</Button>
        </div>
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar por nome ou CRN..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead>CRN</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((prof) => (
                <TableRow key={prof.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <img src={prof.photo} alt={prof.name} className="w-8 h-8 rounded-full" />
                      <span className="text-sm font-semibold">{prof.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{prof.crn}</TableCell>
                  <TableCell className="text-gray-600">{prof.city}, {prof.state}</TableCell>
                  <TableCell>
                    {prof.status === 'active' 
                      ? <Badge variant="secondary" className="bg-green-100 text-green-800">Ativo</Badge> 
                      : <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inativo</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content align="end" className="w-48 bg-white rounded-md shadow-lg border border-gray-100 p-1 z-50">
                          <DropdownMenu.Item className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none" onClick={() => setEditingProf(prof)}>
                            <Edit2 className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenu.Item>
                          <DropdownMenu.Item className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none" onClick={() => handleToggleStatus(prof.id)}>
                            <Ban className="h-4 w-4 mr-2" /> {prof.status === 'active' ? 'Desativar' : 'Ativar'}
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                          <DropdownMenu.Item className="flex items-center px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none" onClick={() => handleDelete(prof.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Drawer isOpen={creatingOpen} onClose={() => setCreatingOpen(false)} title="Adicionar Profissional">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input value={newProf.name} onChange={e => setNewProf({...newProf, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">CRN</label>
            <Input value={newProf.crn} onChange={e => setNewProf({...newProf, crn: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">WhatsApp</label>
            <Input value={newProf.whatsapp} onChange={e => setNewProf({...newProf, whatsapp: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cidade</label>
            <Input value={newProf.city} onChange={e => setNewProf({...newProf, city: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <Input value={newProf.state} onChange={e => setNewProf({...newProf, state: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Especialidades (vírgula-separated)</label>
            <Input value={newProf.specialties} onChange={e => setNewProf({...newProf, specialties: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Abordagens (vírgula-separated)</label>
            <Input value={newProf.approaches} onChange={e => setNewProf({...newProf, approaches: e.target.value})} />
          </div>
          <div className="pt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreatingOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Criar</Button>
          </div>
        </div>
      </Drawer>

      <Drawer
        isOpen={!!editingProf}
        onClose={() => setEditingProf(null)}
        title="Editar Profissional"
      >
        {editingProf && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input 
                value={editingProf.name} 
                onChange={e => setEditingProf({...editingProf, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CRN</label>
              <Input 
                value={editingProf.crn} 
                onChange={e => setEditingProf({...editingProf, crn: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">WhatsApp</label>
              <Input 
                value={editingProf.whatsapp} 
                onChange={e => setEditingProf({...editingProf, whatsapp: e.target.value})}
              />
            </div>
            <div className="pt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingProf(null)}>Cancelar</Button>
              <Button onClick={handleSaveEdit}>Salvar</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
