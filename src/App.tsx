import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { AdminLayout } from './components/AdminLayout';
import { Home } from './pages/Home';
import { FindNutritionist } from './pages/FindNutritionist';
import { NutritionistProfile } from './pages/NutritionistProfile';
import { ForNutritionists } from './pages/ForNutritionists';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminSubscriptions } from './pages/AdminSubscriptions';
import { AdminProfessionals } from './pages/AdminProfessionals';
import { AdminSettings } from './pages/AdminSettings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'encontre-nutricionista', element: <FindNutritionist /> },
      { path: 'nutricionista/:id', element: <NutritionistProfile /> },
      { path: 'sou-nutricionista', element: <ForNutritionists /> },
    ],
  },
  {
    path: '/login-admin',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'inscricoes', element: <AdminSubscriptions /> },
      { path: 'profissionais', element: <AdminProfessionals /> },
      { path: 'configuracoes', element: <AdminSettings /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
