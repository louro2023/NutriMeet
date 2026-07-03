import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Encontre um Nutricionista', path: '/encontre-nutricionista' },
    { name: 'Sou Nutricionista', path: '/sou-nutricionista' },
  ];

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-500" />
              <span className="font-bold text-xl tracking-tight text-gray-900">NutriMeet</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-green-600 ${
                  location.pathname === link.path ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Button asChild variant="outline" className="ml-4">
              <Link to="/login-admin">Login Admin</Link>
            </Button>
          </div>

          <div className="flex md:hidden items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/login-admin"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-green-600 hover:bg-green-50"
            >
              Login Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
