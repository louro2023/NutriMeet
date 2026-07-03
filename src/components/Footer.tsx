import { Link } from 'react-router-dom';
import { Leaf, Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-green-500" />
              <span className="font-bold text-lg tracking-tight text-gray-900">NutriMeet</span>
            </Link>
            <p className="text-sm text-gray-500">
              Conectando você aos melhores nutricionistas do Brasil. Sua jornada de saúde começa aqui.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-500"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-green-500"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-green-500"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/encontre-nutricionista" className="hover:text-green-500">Encontrar Profissional</Link></li>
              <li><Link to="/sou-nutricionista" className="hover:text-green-500">Sou Nutricionista</Link></li>
              <li><Link to="/" className="hover:text-green-500">Como Funciona</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Institucional</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-green-500">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-green-500">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-green-500">Código de Ética (CFN)</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>contato@nutrimeet.com</li>
              <li>(11) 9999-9999</li>
              <li>São Paulo, SP</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 flex justify-between items-center flex-wrap gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} NutriMeet. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-400">
            A NutriMeet não substitui atendimento médico.
          </p>
        </div>
      </div>
    </footer>
  );
}
