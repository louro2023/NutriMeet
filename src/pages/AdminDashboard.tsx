import { useEffect, useState } from 'react';
import { getNutritionists, getSubscriptions } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, FileText, CheckCircle, XCircle } from 'lucide-react';

export function AdminDashboard() {
  const [activeProfessionals, setActiveProfessionals] = useState(0);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [approvedSubscriptions, setApprovedSubscriptions] = useState(0);
  const [rejectedSubscriptions, setRejectedSubscriptions] = useState(0);
  const [recentSubscriptions, setRecentSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const [nutritionists, subscriptions] = await Promise.all([getNutritionists(), getSubscriptions()]);
        setActiveProfessionals(nutritionists.filter((item: any) => item.status === 'active').length);
        setTotalSubscriptions(subscriptions.length);
        setApprovedSubscriptions(subscriptions.filter((item: any) => item.status === 'approved').length);
        setRejectedSubscriptions(subscriptions.filter((item: any) => item.status === 'rejected').length);
        setRecentSubscriptions(subscriptions.slice(-5).reverse());
      } catch (e) {
        console.error('Failed to load dashboard stats', e);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { title: 'Profissionais Ativos', value: activeProfessionals, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { title: 'Inscrições Totais', value: totalSubscriptions, icon: FileText, color: 'text-yellow-600', bg: 'bg-yellow-100' },
          { title: 'Aprovados', value: approvedSubscriptions, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
          { title: 'Rejeitados', value: rejectedSubscriptions, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Últimas Inscrições</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubscriptions.length > 0 ? (
                recentSubscriptions.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      <img src={sub.photo || 'https://via.placeholder.com/40'} alt={sub.name} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">{sub.name}</h4>
                      <p className="text-xs text-gray-500">{new Date(sub.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${sub.status === 'approved' ? 'bg-green-100 text-green-800' : sub.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {sub.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">Nenhuma inscrição recente encontrada.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
