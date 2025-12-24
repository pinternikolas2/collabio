import { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin, TrendingUp, Calendar, Sparkles, Briefcase, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '../utils/formatting';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Project, User } from '../types';
import { categories } from '../utils/constants';
import { projectApi, userApi } from '../utils/api';
import { toast } from 'sonner';

type MarketplaceProps = {
  onNavigate: (page: string, data?: any) => void;
  isLoggedIn: boolean;
  userRole?: 'talent' | 'company' | 'admin' | null;
};

export default function Marketplace({ onNavigate, isLoggedIn, userRole }: MarketplaceProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all'); // all, offer, demand
  const [sortBy, setSortBy] = useState<string>('recent');
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  const isPreviewMode = !isLoggedIn;

  // Load projects from API
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const [projectsData, talentsData, companiesData] = await Promise.all([
        projectApi.getProjects(),
        userApi.getTalents(),
        userApi.getCompanies()
      ]);

      // Ensure projectsData is an array and filter out any null/undefined values
      const validProjects = Array.isArray(projectsData)
        ? projectsData.filter(p => p && p.id)
        : [];
      setProjects(validProjects);

      // Create user lookup map
      const userMap: Record<string, User> = {};
      const validTalents = Array.isArray(talentsData) ? talentsData : [];
      const validCompanies = Array.isArray(companiesData) ? companiesData : [];
      [...validTalents, ...validCompanies].forEach(user => {
        if (user && user.id) {
          userMap[user.id] = user;
        }
      });
      setUsers(userMap);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Nepodařilo se načíst projekty', {
        description: error instanceof Error ? error.message : 'Zkuste to znovu později'
      });
      setProjects([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine if project is a talent offer
  const isTalentOffer = (project: Project) => {
    const owner = users[project.ownerId];
    return owner?.role === 'talent';
  };

  const filteredProjects = projects.filter((project) => {
    // Filter out null/undefined projects
    if (!project || !project.id) return false;

    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;

    const projectIsTalentOffer = isTalentOffer(project);
    const matchesType = selectedType === 'all' ||
      (selectedType === 'offer' && projectIsTalentOffer) ||
      (selectedType === 'demand' && !projectIsTalentOffer);

    return matchesSearch && matchesCategory && matchesType;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    } else if (sortBy === 'price-high') {
      return (b.price || 0) - (a.price || 0);
    } else if (sortBy === 'price-low') {
      return (a.price || 0) - (b.price || 0);
    } else if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  const displayPrice = (price: number, currency: string) => {
    return formatCurrency(price, currency);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
              {t('marketplace.title')}
            </h1>
            <p className="text-gray-600">
              {t('marketplace.subtitle')}
            </p>
          </div>
          {(userRole === 'company' || userRole === 'talent') && (
            <Button
              onClick={() => onNavigate('create-project')}
              className="bg-gradient-to-r from-blue-600 to-orange-500"
            >
              + {userRole === 'talent' ? t('marketplace.add_offer') : t('marketplace.create_project')}
            </Button>
          )}
        </div>

        {/* Notice for preview mode */}
        {isPreviewMode && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg border-2 border-blue-300 shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center">
                <span className="text-white text-xl">🔒</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t('marketplace.preview_title')}</h3>
                <p className="text-sm text-gray-700 mb-3">
                  {t('marketplace.preview_desc')}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onNavigate('register')}
                    className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                  >
                    {t('marketplace.register_action')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate('login')}
                  >
                    {t('navigation.login')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder={t('marketplace.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('marketplace.filter_type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('marketplace.filter_all')}</SelectItem>
                  <SelectItem value="offer">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      {t('marketplace.filter_offer')}
                    </div>
                  </SelectItem>
                  <SelectItem value="demand">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3 h-3" />
                      {t('marketplace.filter_demand')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('marketplace.filter_category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('marketplace.filter_all_categories')}</SelectItem>
                  {/* New Categories for Talents */}
                  <SelectItem value="Sportovec">Sportovci</SelectItem>
                  <SelectItem value="Umělec">Umělci</SelectItem>
                  <SelectItem value="Influencer">Influenceři</SelectItem>
                  <SelectItem value="Jiné">Jiné</SelectItem>


                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('marketplace.sort_by')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t('marketplace.sort_recent')}</SelectItem>
                  <SelectItem value="price-high">{t('marketplace.sort_price_high')}</SelectItem>
                  <SelectItem value="price-low">{t('marketplace.sort_price_low')}</SelectItem>
                  <SelectItem value="rating">{t('marketplace.sort_rating')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? t('common.loading') : sortedProjects.length === 1
              ? t('marketplace.found_result', { count: sortedProjects.length })
              : sortedProjects.length < 5 && sortedProjects.length > 0
                ? t('marketplace.found_results_few', { count: sortedProjects.length })
                : t('marketplace.found_results', { count: sortedProjects.length })}
          </p>
          {!isLoggedIn && (
            <Badge variant="outline" className="bg-yellow-50 border-yellow-400 text-yellow-800">
              ⚠️ Přihlaste se pro plný přístup
            </Badge>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedProjects.length === 0 && (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('marketplace.no_projects')}</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all'
                ? t('marketplace.reset_filters')
                : t('marketplace.no_projects')}
            </p>
            {isLoggedIn && (userRole === 'company' || userRole === 'talent') && (
              <Button
                onClick={() => onNavigate('create-project')}
                className="bg-gradient-to-r from-blue-600 to-orange-500"
              >
                + {userRole === 'talent' ? t('marketplace.add_offer') : t('marketplace.create_project')}
              </Button>
            )}
          </div>
        )}

        {/* Project Grid */}
        {!loading && sortedProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedProjects.filter(p => p && p.id).map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 hover:border-blue-500 overflow-hidden relative"
                onClick={() => {
                  if (isPreviewMode) {
                    onNavigate('register');
                  } else {
                    onNavigate('project-detail', { projectId: project.id });
                  }
                }}
              >
                {/* Preview mode overlay */}
                {isPreviewMode && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-orange-500/10 backdrop-blur-[2px] z-10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/95 rounded-lg p-2 shadow-lg text-center max-w-[200px]">
                      <p className="font-semibold text-gray-900 mb-1 text-sm">🔒 {t('marketplace.preview_title')}</p>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-orange-500 h-8 text-xs">
                        {t('marketplace.register_action')}
                      </Button>
                    </div>
                  </div>
                )}
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={project.images?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop'}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Talent offer or company demand badge */}
                  <Badge className={`absolute top-2 left-2 ${isTalentOffer(project)
                    ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500'} text-white border-0 text-[10px] px-2 py-0.5`}>
                    {isTalentOffer(project) ? (
                      <>
                        <Sparkles className="w-3 h-3 mr-1" />
                        {t('marketplace.filter_offer')}
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-3 h-3 mr-1" />
                        {t('marketplace.filter_demand')}
                      </>
                    )}
                  </Badge>
                  {project.featured && (
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-yellow-400 text-white border-0 text-[10px] px-2 py-0.5">
                      ⭐ Top
                    </Badge>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    {project.category && (
                      <Badge variant="secondary" className="bg-white/90 text-gray-900 text-[10px] px-2 py-0.5">
                        {project.category}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold line-clamp-1 group-hover:text-blue-600 transition-colors text-base mb-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3 h-10">
                    {project.description}
                  </p>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={`${tag}-${index}`} variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 2 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                          +{project.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
                        {displayPrice(project.price || 0, project.currency || 'CZK')}
                      </p>
                    </div>
                    {(project.rating || project.ratingCount) && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">{(project.rating || 0).toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Reset Filters Button */}
        {!loading && sortedProjects.length === 0 && (searchTerm || selectedCategory !== 'all' || selectedType !== 'all') && (
          <div className="text-center mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
            >
              {t('marketplace.reset_filters')}
            </Button>
          </div>
        )}

        {/* Limited Access Warning */}
        {!isLoggedIn && sortedProjects.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-semibold mb-3">
                🔒 {t('marketplace.preview_title')}
              </h3>
              <p className="text-gray-700 mb-4">
                {t('marketplace.preview_desc')}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => onNavigate('login')}
                  variant="outline"
                >
                  {t('navigation.login')}
                </Button>
                <Button
                  onClick={() => onNavigate('register')}
                  className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                >
                  {t('marketplace.register_action')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
