import { Link } from 'react-router-dom';
import { Facebook, Instagram, Leaf, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { preloadSearchData } from '../lib/api';

export function Footer() {
  return (
    <footer className="border-t border-emerald-100 bg-emerald-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-5 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-300 text-emerald-950">
                <Leaf className="h-5 w-5" />
              </span>
              <span className="font-serif text-2xl font-bold">NutriMeet</span>
            </Link>
            <p className="max-w-xs text-sm leading-6 text-emerald-50/75">
              Nutrição mais próxima, humana e acessível para quem quer cuidar da rotina com orientação profissional.
            </p>
            <div className="flex gap-3">
              <a href="#" className="rounded-full bg-white/10 p-2 text-emerald-50 hover:bg-lime-300 hover:text-emerald-950" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="rounded-full bg-white/10 p-2 text-emerald-50 hover:bg-lime-300 hover:text-emerald-950" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="rounded-full bg-white/10 p-2 text-emerald-50 hover:bg-lime-300 hover:text-emerald-950" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase text-lime-200">Explore</h4>
            <ul className="space-y-3 text-sm text-emerald-50/75">
              <li><Link to="/encontre-nutricionista" onFocus={preloadSearchData} onMouseEnter={preloadSearchData} className="hover:text-lime-200">Encontrar profissional</Link></li>
              <li><Link to="/sou-nutricionista" className="hover:text-lime-200">Cadastrar nutricionista</Link></li>
              <li><Link to="/" className="hover:text-lime-200">Como funciona</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase text-lime-200">Confiança</h4>
            <ul className="space-y-3 text-sm text-emerald-50/75">
              <li><a href="#" className="hover:text-lime-200">Termos de uso</a></li>
              <li><a href="#" className="hover:text-lime-200">Política de privacidade</a></li>
              <li><a href="#" className="hover:text-lime-200">Código de ética profissional</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase text-lime-200">Contato</h4>
            <ul className="space-y-3 text-sm text-emerald-50/75">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-lime-200" /> contato@nutrimeet.com</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-lime-200" /> (11) 9999-9999</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-lime-200" /> São Paulo, SP</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-emerald-50/60">
          <p>© {new Date().getFullYear()} NutriMeet. Todos os direitos reservados.</p>
          <p>A NutriMeet não substitui atendimento médico ou emergencial.</p>
        </div>
      </div>
    </footer>
  );
}
