import { Outlet, Link, useLocation } from 'react-router-dom';
import { Leaf, Users, FileText, Settings, LayoutDashboard, LogOut, AlertTriangle } from 'lucide-react';
import { ScrollRestoration } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getHealth } from '../lib/api';

export function AdminLayout() {
  const location = useLocation();
  const [databaseMode, setDatabaseMode] = useState<string | null>(null);

  useEffect(() => {
    getHealth()
      .then((health) => setDatabaseMode(health.databaseMode || 'unknown'))
      .catch(() => setDatabaseMode('unknown'));
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Inscrições', path: '/admin/inscricoes', icon: FileText },
    { name: 'Profissionais', path: '/admin/profissionais', icon: Users },
    { name: 'Configurações', path: '/admin/configuracoes', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans">
      <ScrollRestoration />
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-500" />
            <span className="font-bold text-xl tracking-tight text-gray-900">NutriAdmin</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Link
            to="/login-admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b flex items-center px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">
            {menuItems.find((item) => item.path === location.pathname)?.name || 'Admin'}
          </h1>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {databaseMode === 'memory' && (
            <div className="mb-6 flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
              <div>
                <p className="font-bold">Banco temporário em uso</p>
                <p className="mt-1 leading-6">
                  O sistema está sem conexão persistente com Neon/PostgreSQL. O login funciona, mas inscrições e profissionais podem desaparecer entre acessos ou deploys. Configure `DATABASE_URL` na Vercel para gerenciar dados reais.
                </p>
              </div>
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
