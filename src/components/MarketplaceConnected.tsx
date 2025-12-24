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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Hledat projekty, talenты, kategorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 w-full lg:w-auto">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Vše</SelectItem>
                  <SelectItem value="offer">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Nabídky talentů
                    </div>
                  </SelectItem>
                  <SelectItem value="demand">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Poptávky firem
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-[180px]">
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
                <SelectTrigger className="w-full lg:w-[180px]">
                  <TrendingUp className="h-4 w-4 mr-2" />
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

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Aktivní projekty</p>
                  <p className="text-3xl font-bold">{projects?.length || 0}</p>
                </div>
                <Briefcase className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Talenti</p>
                  <p className="text-3xl font-bold">
                    {users?.filter((u: User) => u.role === 'talent').length || 0}
                  </p>
                </div>
                <Sparkles className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Firmy</p>
                  <p className="text-3xl font-bold">
                    {users?.filter((u: User) => u.role === 'company').length || 0}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            Zobrazeno <span className="font-semibold">{sortedProjects.length}</span> projektů
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Obnovit
          </Button>
        </div>

        {/* Projects Grid */}
        {sortedProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Žádné projekty nenalezeny</p>
            <p className="text-gray-400 mt-2">Zkuste změnit filtry nebo vyhledávání</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProjects.map((project: Project) => {
              const owner = getOwnerInfo(project.ownerId);
              const isOffer = isTalentOffer(project);

              return (
                <Card 
                  key={project.id} 
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                  onClick={() => onNavigate('project-detail', project)}
                >
                  {/* Image */}
                  {project.images && project.images.length > 0 ? (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={project.images?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop'} 
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className={isOffer ? 'bg-orange-500' : 'bg-blue-500'}>
                          {isOffer ? (
                            <><Sparkles className="h-3 w-3 mr-1" /> Nabídka</>
                          ) : (
                            <><Briefcase className="h-3 w-3 mr-1" /> Poptávka</>
                          )}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center">
                      <div className="text-center">
                        {isOffer ? (
                          <Sparkles className="h-12 w-12 mx-auto text-orange-400 mb-2" />
                        ) : (
                          <Briefcase className="h-12 w-12 mx-auto text-blue-400 mb-2" />
                        )}
                        <p className="text-gray-500 text-sm">{project.category}</p>
                      </div>
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold line-clamp-1">{project.title}</h3>
                      {project.featured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 shrink-0">
                          ⭐ Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {project.description}
                    </p>
                  </CardHeader>

                  <CardContent>
                    {/* Owner info */}
                    {owner && (
                      <div className="flex items-center gap-2 mb-3">
                        {owner.profileImage ? (
                          <img 
                            src={owner.profileImage} 
                            alt={owner.firstName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white text-sm">
                            {owner.firstName[0]}{owner.lastName[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {owner.role === 'company' && owner.companyName 
                              ? owner.companyName 
                              : `${owner.firstName} ${owner.lastName}`}
                          </p>
                          {owner.rating && owner.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-600">
                                {owner.rating.toFixed(1)} ({owner.ratingCount || 0})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Price & Date */}
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Rozpočet</p>
                        <p className="font-semibold text-lg">
                          {new Intl.NumberFormat('cs-CZ', {
                            style: 'currency',
                            currency: project.currency
                          }).format(project.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(project.createdAt).toLocaleDateString('cs-CZ')}
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('project-detail', project);
                      }}
                    >
                      Zobrazit detail
                    </Button>
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
