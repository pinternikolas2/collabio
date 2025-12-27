import { useState } from 'react';
import { Search, Filter, Star, MapPin, TrendingUp, Calendar, Sparkles, Briefcase, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useApi } from '../hooks/useApi';
import { projectApi, userApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import type { Project, User } from '../types';

type MarketplaceProps = {
  onNavigate: (page: string, data?: any) => void;
};

const categories = ['Sport', 'Hudba', 'Umění', 'Gaming', 'Lifestyle', 'Business'];

export default function MarketplaceConnected({ onNavigate }: MarketplaceProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all'); // all, offer, demand
  const [sortBy, setSortBy] = useState<string>('recent');

  // Fetch projects from API
  const { data: projects, loading: projectsLoading, error: projectsError, refetch } = useApi(
    () => projectApi.getProjects()
  );

  // Fetch all users to determine project owners
  const { data: users, loading: usersLoading } = useApi(
    () => userApi.getTalents().then(talents =>
      userApi.getCompanies().then(companies => [...talents, ...companies])
    )
  );

  const loading = projectsLoading || usersLoading;

  // Helper to determine if project is a talent offer
  const isTalentOffer = (project: Project) => {
    const owner = users?.find((u: User) => u.id === project.ownerId);
    return owner?.role === 'talent';
  };

  const filteredProjects = (projects || []).filter((project: Project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;

    const projectIsTalentOffer = isTalentOffer(project);
    const matchesType = selectedType === 'all' ||
      (selectedType === 'offer' && projectIsTalentOffer) ||
      (selectedType === 'demand' && !projectIsTalentOffer);

    return matchesSearch && matchesCategory && matchesType;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'price-high') {
      return b.price - a.price;
    } else if (sortBy === 'price-low') {
      return a.price - b.price;
    } else if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  const getOwnerInfo = (ownerId: string) => {
    return users?.find((u: User) => u.id === ownerId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Načítání marketplace...</p>
        </div>
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Chyba při načítání projektů: {projectsError.message}</p>
          <Button onClick={() => refetch()}>Zkusit znovu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 font-sans">
      {/* Premium Glass Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <Input
                placeholder="Hledat projekty, talenty, kategorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl shadow-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full lg:w-[180px] h-12 rounded-xl bg-white border-gray-200 hover:border-blue-300 transition-all shadow-sm">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Vše</SelectItem>
                  <SelectItem value="offer">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-orange-500" />
                      Nabídky talentů
                    </div>
                  </SelectItem>
                  <SelectItem value="demand">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-500" />
                      Poptávky firem
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-[180px] h-12 rounded-xl bg-white border-gray-200 hover:border-orange-300 transition-all shadow-sm">
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny kategorie</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-[180px] h-12 rounded-xl bg-white border-gray-200 hover:border-purple-300 transition-all shadow-sm">
                  <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Nejnovější</SelectItem>
                  <SelectItem value="price-high">Cena (nejvyšší)</SelectItem>
                  <SelectItem value="price-low">Cena (nejnižší)</SelectItem>
                  <SelectItem value="rating">Hodnocení</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Briefcase className="w-32 h-32 transform rotate-12" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">+12 dnes</span>
              </div>
              <p className="text-blue-100 font-medium mb-1">Aktivní projekty</p>
              <p className="text-4xl font-bold tracking-tight">{projects?.length || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-32 h-32 transform -rotate-12" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">Top Talenti</span>
              </div>
              <p className="text-orange-100 font-medium mb-1">Talenti</p>
              <p className="text-4xl font-bold tracking-tight">
                {users?.filter((u: User) => u.role === 'talent').length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-32 h-32 transform rotate-45" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">Ověřené</span>
              </div>
              <p className="text-green-100 font-medium mb-1">Firmy</p>
              <p className="text-4xl font-bold tracking-tight">
                {users?.filter((u: User) => u.role === 'company').length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-800">Dostupné příležitosti</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 rounded-full px-3">{sortedProjects.length}</Badge>
          </div>
          <Button onClick={() => refetch()} variant="ghost" size="sm" className="hover:bg-white/50 text-gray-500">
            Obnovit výpis
          </Button>
        </div>

        {/* Projects Grid */}
        {sortedProjects.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
            <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Žádné projekty nenalezeny</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Zkuste upravit filtry nebo vyhledávání. Možná jen zatím nikdo nic nepřidal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProjects.map((project: Project) => {
              const owner = getOwnerInfo(project.ownerId);
              const isOffer = isTalentOffer(project);

              return (
                <Card
                  key={project.id}
                  className="group border-none shadow-md hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col"
                  onClick={() => onNavigate('project-detail', project)}
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={project.images?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop'}
                      alt={project.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    <div className="absolute top-4 right-4 z-10">
                      <Badge className={`${isOffer ? 'bg-orange-500' : 'bg-blue-600'} text-white border-none shadow-lg px-3 py-1`}>
                        {isOffer ? (
                          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Nabídka</span>
                        ) : (
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> Poptávka</span>
                        )}
                      </Badge>
                    </div>

                    <div className="absolute bottom-4 left-4 z-10 w-[calc(100%-2rem)]">
                      <h3 className="font-bold text-xl text-white mb-1 line-clamp-1 drop-shadow-md">{project.title}</h3>
                      <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm border border-white/10">
                          {project.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="flex-1 p-6">
                    {/* Owner & Meta */}
                    <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                      {owner ? (
                        <>
                          <div className="relative">
                            <img
                              src={owner.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${owner.id}`}
                              alt={owner.firstName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            {owner.verified && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center"><CheckCircle className="w-2.5 h-2.5 text-white" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {owner.role === 'company' && owner.companyName
                                ? owner.companyName
                                : `${owner.firstName} ${owner.lastName}`}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              {owner.role === 'talent' ? 'Talent' : 'Firma'}
                              {owner.rating && (
                                <>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full mx-1" />
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  {owner.rating.toFixed(1)}
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                          <div className="space-y-1">
                            <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
                            <div className="w-12 h-3 bg-gray-50 rounded animate-pulse" />
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 pt-0 mt-auto">
                    <div className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl group-hover:bg-blue-50/50 transition-colors">
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Rozpočet</p>
                        <p className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {new Intl.NumberFormat('cs-CZ', {
                            style: 'currency',
                            currency: project.currency,
                            maximumFractionDigits: 0
                          }).format(project.price)}
                        </p>
                      </div>
                      <Button size="icon" className="rounded-full w-10 h-10 bg-white text-gray-700 hover:bg-blue-600 hover:text-white shadow-sm border border-gray-200 hover:border-blue-600 transition-all">
                        <ArrowUpRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
