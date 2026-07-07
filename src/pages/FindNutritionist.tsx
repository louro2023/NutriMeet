import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, LayoutGrid, List, MapPin, Search, Stethoscope } from 'lucide-react';
import { getApproaches, getNutritionists, getSpecialties, getStates } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import foodHero from '../assets/food-hero.jpg';

export function FindNutritionist() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedApproach, setSelectedApproach] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [approaches, setApproaches] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [shuffledList, setShuffledList] = useState<any[]>([]);
  const itemsPerPage = 9;

  useEffect(() => {
    getNutritionists().then((all: any[]) => {
      const active = all.filter((item) => item.status === 'active');
      setShuffledList([...active].sort(() => 0.5 - Math.random()));
    }).catch(() => setShuffledList([]));
    getSpecialties().then(setSpecialties).catch(() => setSpecialties([]));
    getApproaches().then(setApproaches).catch(() => setApproaches([]));
    getStates().then(setStates).catch(() => setStates([]));
  }, []);

  const filteredData = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return shuffledList.filter((item) => {
      const description = item.description || '';
      const matchSearch = item.name.toLowerCase().includes(query) || description.toLowerCase().includes(query);
      const matchSpecialty = selectedSpecialty ? item.specialties.includes(selectedSpecialty) : true;
      const matchApproach = selectedApproach ? item.approaches.includes(selectedApproach) : true;
      const matchState = selectedState ? item.state === selectedState : true;
      return matchSearch && matchSpecialty && matchApproach && matchState;
    });
  }, [shuffledList, searchTerm, selectedSpecialty, selectedApproach, selectedState]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f7fbf3]">
      <section
        className="relative overflow-hidden bg-cover bg-center py-20"
        style={{ backgroundImage: `url(${foodHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/78 via-emerald-950/46 to-white/10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <p className="mb-4 text-sm font-bold uppercase text-lime-200">Busca personalizada</p>
            <h1 className="font-serif text-4xl font-extrabold sm:text-6xl">Encontre um nutricionista para o seu momento.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50/85">
              Filtre por especialidade, abordagem e estado para descobrir profissionais alinhados ao seu objetivo.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="-mt-24 mb-12">
            <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-lg border border-emerald-100 bg-white/[0.92] p-4 shadow-xl shadow-emerald-950/10 backdrop-blur md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-emerald-500" />
                <Input
                  placeholder="Busque por nome, especialidade ou palavra-chave..."
                  className="h-12 rounded-lg border-emerald-100 bg-white pl-10 text-base"
                  value={searchTerm}
                  onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }}
                />
              </div>
              <Button size="lg" className="h-12 shrink-0 px-8" onClick={() => setCurrentPage(1)}>
                Pesquisar
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="w-full shrink-0 space-y-6 lg:w-72">
              <Card className="sticky top-24 border-emerald-100 bg-white/90 shadow-sm">
                <CardContent className="space-y-6 p-6">
                  <FilterSelect
                    icon={<Stethoscope className="h-4 w-4" />}
                    label="Especialidade"
                    value={selectedSpecialty}
                    onChange={(value) => { setSelectedSpecialty(value); setCurrentPage(1); }}
                    options={specialties}
                    placeholder="Todas as especialidades"
                  />
                  <FilterSelect
                    label="Abordagem"
                    value={selectedApproach}
                    onChange={(value) => { setSelectedApproach(value); setCurrentPage(1); }}
                    options={approaches}
                    placeholder="Todas as abordagens"
                  />
                  <FilterSelect
                    icon={<MapPin className="h-4 w-4" />}
                    label="Localização"
                    value={selectedState}
                    onChange={(value) => { setSelectedState(value); setCurrentPage(1); }}
                    options={states}
                    placeholder="Todos os estados"
                  />

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSpecialty('');
                      setSelectedApproach('');
                      setSelectedState('');
                      setCurrentPage(1);
                    }}
                  >
                    Limpar filtros
                  </Button>
                </CardContent>
              </Card>
            </aside>

            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between rounded-lg border border-emerald-100 bg-white/90 p-4 shadow-sm">
                <span className="font-medium text-slate-600">
                  Encontrados <span className="font-bold text-emerald-600">{filteredData.length}</span> profissionais
                </span>
                <div className="flex gap-2">
                  <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                    <LayoutGrid className="h-5 w-5" />
                  </Button>
                  <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                    <List className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className={viewMode === 'grid' ? 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-6'}>
                <AnimatePresence>
                  {paginatedData.map((nutri) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={nutri.id}
                    >
                      <Card className={`flex h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/10 ${viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col'}`}>
                        <div className={`${viewMode === 'list' ? 'w-full shrink-0 sm:w-48' : 'w-full'} flex flex-col items-center justify-center border-b border-emerald-100 bg-emerald-50/60 p-6 sm:border-b-0 sm:border-r`}>
                          <div className="relative">
                            <img src={nutri.photo} alt={nutri.name} className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-sm" />
                            <BadgeCheck className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-white text-emerald-500" />
                          </div>
                          <span className="mt-3 text-xs font-mono text-slate-500">CRN: {nutri.crn}</span>
                        </div>

                        <div className="flex flex-1 flex-col p-6">
                          <div className="mb-2 flex items-start justify-between">
                            <h3 className="text-lg font-bold leading-tight text-emerald-950">{nutri.name}</h3>
                            <Badge variant="secondary" className="ml-2 shrink-0 bg-lime-100 text-emerald-900">
                              R$ {nutri.price}
                            </Badge>
                          </div>

                          <div className="mb-4 flex flex-wrap gap-2">
                            {nutri.specialties.map((specialty: string) => (
                              <span key={specialty} className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{specialty}</span>
                            ))}
                          </div>

                          <p className="mb-6 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
                            {nutri.description}
                          </p>

                          <div className="mt-auto flex gap-3">
                            <Button asChild className="flex-1" variant="outline">
                              <Link to={`/nutricionista/${encodeURIComponent(nutri.id)}`}>Ver perfil</Link>
                            </Button>
                            <Button className="flex-1" onClick={() => window.open(`https://wa.me/${nutri.whatsapp}`, '_blank')}>
                              Agendar
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredData.length === 0 && (
                <div className="rounded-lg border border-dashed border-emerald-200 bg-white py-20 text-center">
                  <Search className="mx-auto mb-4 h-12 w-12 text-emerald-200" />
                  <h3 className="text-lg font-bold text-emerald-950">Nenhum profissional encontrado</h3>
                  <p className="text-slate-500">Tente ajustar seus filtros de busca.</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>
                    Anterior
                  </Button>
                  {[...Array(totalPages)].map((_, index) => (
                    <Button
                      key={index}
                      variant={currentPage === index + 1 ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(index + 1)}
                      className="w-10 px-0"
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FilterSelect({
  icon,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-emerald-950">
        {icon}
        {label}
      </h3>
      <select
        className="w-full rounded-lg border border-emerald-100 bg-[#f7fbf3] p-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}
