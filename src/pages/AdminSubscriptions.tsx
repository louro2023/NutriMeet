import { useEffect, useState } from 'react';
import { deleteAllSubscriptions, getSubscriptions, updateSubscriptionStatus } from '../lib/api';
import { useToast } from '../components/ui/toastContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Drawer } from '../components/ui/drawer';
import { Subscription } from '../types';

export function AdminSubscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  useEffect(() => {
    setLoading(true);
    getSubscriptions()
      .then(setSubs)
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="secondary" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejected': return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    }
  };

  const toast = useToast();

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const updated = await updateSubscriptionStatus(id, action);
      setSubs(subs.map((s) => (s.id === id ? updated : s)));
      if (selectedSub?.id === id) setSelectedSub(updated);
      toast.success('Status atualizado');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      await deleteAllSubscriptions();
      setSubs([]);
      toast.success('Todas as inscrições foram removidas');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao remover inscrições');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Inscrições</h2>
        <Button variant="destructive" size="sm" onClick={handleDeleteAll} disabled={deleting || subs.length === 0}>
          Limpar todas as inscrições
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Profissional</TableHead>
              <TableHead>CRN</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subs.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <ProfilePhoto photo={sub.photo} name={sub.name} size="sm" />
                    <div>
                      <p className="text-sm font-semibold">{sub.name}</p>
                      <p className="text-xs text-gray-500">{sub.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{sub.crn}</TableCell>
                <TableCell className="text-gray-600">{new Date(sub.date).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{getStatusBadge(sub.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSub(sub)}>
                    Analisar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Drawer
        isOpen={!!selectedSub}
        onClose={() => setSelectedSub(null)}
        title="Detalhes da Inscrição"
      >
        {selectedSub && (
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <ProfilePhoto photo={selectedSub.photo} name={selectedSub.name} size="lg" />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Nome</label>
                <p className="text-sm font-medium text-gray-900">{selectedSub.name}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Email & Telefone</label>
                <p className="text-sm font-medium text-gray-900">{selectedSub.email} / {selectedSub.phone}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">CRN</label>
                <p className="text-sm font-medium text-gray-900">{selectedSub.crn}</p>
              </div>
              {(selectedSub.city || selectedSub.state) && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Localização</label>
                  <p className="text-sm font-medium text-gray-900">{[selectedSub.city, selectedSub.state].filter(Boolean).join(', ')}</p>
                </div>
              )}
              {selectedSub.description && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Sobre mim</label>
                  <p className="text-sm leading-6 text-gray-700">{selectedSub.description}</p>
                </div>
              )}
              {selectedSub.education && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Formação</label>
                  <p className="text-sm leading-6 text-gray-700">{selectedSub.education}</p>
                </div>
              )}
              {selectedSub.experience && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Experiência</label>
                  <p className="text-sm leading-6 text-gray-700">{selectedSub.experience}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Especialidades</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedSub.specialties.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Status Atual</label>
                <div className="mt-1">{getStatusBadge(selectedSub.status)}</div>
              </div>
            </div>

            <div className="pt-6 border-t flex gap-3">
              <Button 
                className="flex-1 bg-green-500 hover:bg-green-600"
                disabled={selectedSub.status === 'approved'}
                onClick={() => handleAction(selectedSub.id, 'approved')}
              >
                Aprovar
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                disabled={selectedSub.status === 'rejected'}
                onClick={() => handleAction(selectedSub.id, 'rejected')}
              >
                Rejeitar
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function ProfilePhoto({ photo, name, size }: { photo?: string; name: string; size: 'sm' | 'lg' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const className = size === 'lg'
    ? 'w-24 h-24 rounded-full border-2 border-gray-200 object-cover'
    : 'w-8 h-8 rounded-full object-cover';

  if (photo) return <img src={photo} alt={name} className={className} />;

  return (
    <div className={`${className} flex items-center justify-center bg-emerald-100 text-xs font-bold text-emerald-800`}>
      {initials || 'NM'}
    </div>
  );
}
