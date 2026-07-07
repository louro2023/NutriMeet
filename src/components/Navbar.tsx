import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Encontrar nutricionista', path: '/encontre-nutricionista' },
    { name: 'Sou nutricionista', path: '/sou-nutricionista' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/[0.85] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm shadow-emerald-900/20">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-serif text-2xl font-bold text-emerald-950">NutriMeet</span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  location.pathname === link.path
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Button asChild variant="outline" className="ml-3 gap-2">
              <Link to="/login-admin">
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            </Button>
          </div>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full p-2 text-emerald-900 hover:bg-emerald-50"
              aria-label="Abrir menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-emerald-100 bg-white md:hidden">
          <div className="space-y-1 px-3 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block rounded-lg px-3 py-2 text-base font-semibold ${
                  location.pathname === link.path
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/login-admin"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
