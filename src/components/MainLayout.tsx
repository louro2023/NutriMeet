import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollRestoration } from 'react-router-dom';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50/30">
      <ScrollRestoration />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
