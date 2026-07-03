import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List, MapPin, BadgeCheck, Stethoscope } from 'lucide-react';
import { getNutritionists, getSpecialties, getApproaches, getStates } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export function FindNutritionist() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedApproach, setSelectedApproach] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [SPECIALTIES, setSpecialties] = useState<string[]>([]);
  const [APPROACHES, setApproaches] = useState<string[]>([]);
  const [STATES, setStates] = useState<string[]>([]);

  // Shuffle logic on load
  const [shuffledList, setShuffledList] = useState<any[]>([]);
  useEffect(() => {
    getNutritionists().then((all: any[]) => {
      const active = all.filter(n => n.status === 'active');
      const shuffled = [...active].sort(() => 0.5 - Math.random());
      setShuffledList(shuffled);
    }).catch(() => setShuffledList([]));
    getSpecialties().then((s: string[]) => setSpecialties(s)).catch(() => setSpecialties([]));
    getApproaches().then((a: string[]) => setApproaches(a)).catch(() => setApproaches([]));
    getStates().then((s: string[]) => setStates(s)).catch(() => setStates([]));
  }, []);

  const filteredData = useMemo(() => {
    return shuffledList.filter(n => {
      const matchSearch = n.name.toLowerCase().includes(searchTerm.toLowerCase()) || n.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSpecialty = selectedSpecialty ? n.specialties.includes(selectedSpecialty) : true;
      const matchApproach = selectedApproach ? n.approaches.includes(selectedApproach) : true;
      const matchState = selectedState ? n.state === selectedState : true;
      return matchSearch && matchSpecialty && matchApproach && matchState;
    });
  }, [shuffledList, searchTerm, selectedSpecialty, selectedApproach, selectedState]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Encontre seu Nutricionista</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Filtre por especialidade, abordagem e encontre o profissional perfeito para sua jornada de saúde.
          </p>
          
          <div className="max-w-4xl mx-auto bg-white p-4 rounded-2xl shadow-sm border flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Busque por nome, especialidade ou palavra-chave..." 
                className="pl-10 h-12 text-lg border-gray-200 rounded-xl"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <Button size="lg" className="h-12 px-8 rounded-xl shrink-0" onClick={() => setCurrentPage(1)}>
              Pesquisar
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-72 shrink-0 space-y-6">
            <Card className="sticky top-24 border-gray-100 shadow-sm rounded-xl">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" /> Especialidade
                  </h3>
                  <select 
                    className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 focus:ring-green-500 focus:border-green-500"
                    value={selectedSpecialty}
                    onChange={(e) => { setSelectedSpecialty(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Todas as especialidades</option>
                    {SPECIALTIES.map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Abordagem</h3>
                  <select 
                    className="w-full p-2.5 border rounded-lg text-sm bg-gray-50"
                    value={selectedApproach}
                    onChange={(e) => { setSelectedApproach(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Todas as abordagens</option>
                    {APPROACHES.map((a: string) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Localização
                  </h3>
                  <select 
                    className="w-full p-2.5 border rounded-lg text-sm bg-gray-50"
                    value={selectedState}
                    onChange={(e) => { setSelectedState(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Todos os estados</option>
                    {STATES.map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-gray-500 hover:text-gray-900"
                  onClick={() => {
                    setSearchTerm(''); setSelectedSpecialty(''); setSelectedApproach(''); setSelectedState(''); setCurrentPage(1);
                  }}
                >
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Area */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-gray-600 font-medium">
                Encontrados <span className="text-green-600 font-bold">{filteredData.length}</span> profissionais
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

            <div className={viewMode === 'grid' ? "grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
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
                    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex ${viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col'}`}>
                      <div className={`${viewMode === 'list' ? 'w-full sm:w-48 shrink-0' : 'w-full'} p-6 flex flex-col items-center justify-center bg-gray-50/50 border-b sm:border-b-0 sm:border-r border-gray-100`}>
                        <div className="relative">
                           <img src={nutri.photo} alt={nutri.name} className="w-24 h-24 rounded-full object-cover shadow-sm border-4 border-white" />
                           <BadgeCheck className="absolute bottom-0 right-0 h-6 w-6 text-blue-500 bg-white rounded-full" />
                        </div>
                        <span className="mt-3 text-xs font-mono text-gray-500">CRN: {nutri.crn}</span>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-gray-900 leading-tight">{nutri.name}</h3>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 shrink-0 ml-2">
                            R$ {nutri.price}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {nutri.specialties.map(s => (
                             <span key={s} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">{s}</span>
                          ))}
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-3 mb-6 flex-1">
                          {nutri.description}
                        </p>
                        
                        <div className="flex gap-3 mt-auto">
                           <Button asChild className="flex-1" variant="outline">
                             <Link to={`/nutricionista/${nutri.id}`}>Ver Perfil</Link>
                           </Button>
                           <Button 
                             className="flex-1 bg-green-500 hover:bg-green-600"
                             onClick={() => window.open(`https://wa.me/${nutri.whatsapp}`, '_blank')}
                           >
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
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhum profissional encontrado</h3>
                <p className="text-gray-500">Tente ajustar seus filtros de busca.</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <Button 
                  variant="outline" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Anterior
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button 
                    key={i} 
                    variant={currentPage === i + 1 ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(i + 1)}
                    className="w-10"
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
