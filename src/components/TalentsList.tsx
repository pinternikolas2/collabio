import { useState, useEffect } from 'react';
import { Search, Filter, Star, Instagram, Users, Loader2, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { categories } from '../utils/constants';
import { userApi } from '../utils/api';
import { User } from '../types';
import { toast } from 'sonner';

type TalentsListProps = {
  onNavigate: (page: string, data?: any) => void;
  isLoggedIn: boolean;
  currentUserRole?: 'talent' | 'company' | 'admin' | null;
};

export default function TalentsList({ onNavigate, isLoggedIn, currentUserRole = null }: TalentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('followers');
  const [talents, setTalents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const isPreviewMode = !isLoggedIn;

  // Load talents from API
  useEffect(() => {
    loadTalents();
  }, []);

  const loadTalents = async () => {
    try {
      setLoading(true);
      const talentsData = await userApi.getTalents();

      // Filter only verified talents (KYC completed)
      const verifiedTalents = Array.isArray(talentsData)
        ? talentsData.filter(t => t && t.id && t.verified)
        : [];

      setTalents(verifiedTalents);
    } catch (error) {
      console.error('Error loading talents:', error);
      toast.error('Nepodařilo se načíst talenty', {
        description: error instanceof Error ? error.message : 'Zkuste to znovu později'
      });
      setTalents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTalents = talents.filter((talent) => {
    const matchesSearch =
      talent.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.bio?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || talent.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedTalents = [...filteredTalents].sort((a, b) => {
    if (sortBy === 'followers') {
      return (b.followers || 0) - (a.followers || 0);
    } else if (sortBy === 'name') {
      return (a.firstName || '').localeCompare(b.firstName || '');
    } else if (sortBy === 'recent') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    return 0;
  });

  const formatFollowers = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
            Seznam talentů
          </h1>
          <p className="text-gray-600">
            Najděte ideální sportovce, umělce nebo influencery pro vaši značku
          </p>
        </div>

        {/* Notice for preview mode */}
        {isPreviewMode && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg border-2 border-blue-300 shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center">
                <span className="text-white text-xl">🔒</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Omezený náhled</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Pro zobrazení detailů talentů, kontaktních údajů a možnost komunikace se musíte <strong>registrovat nebo přihlásit</strong>.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onNavigate('register')}
                    className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                  >
                    Registrovat se
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate('login')}
                  >
                    Přihlásit se
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notice for talents */}
        {currentUserRole === 'talent' && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              💡 <strong>Poznámka:</strong> Jako talent můžete procházet profily jiných talentů, ale nelze je kontaktovat. Collabio je platforma pro propojení talentů a firem.
            </p>
            <p className="text-sm text-blue-800 mt-2">
              ℹ️ Váš profil se zobrazí v seznamu po dokončení KYC verifikace (nahrání občanského průkazu).
            </p>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Hledat talenty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny kategorie</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Řadit podle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="followers">Sledovanost</SelectItem>
                  <SelectItem value="name">Jméno</SelectItem>
                  <SelectItem value="recent">Nejnovější</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? 'Načítání...' : `Nalezeno ${sortedTalents.length} ${sortedTalents.length === 1 ? 'talent' : sortedTalents.length < 5 ? 'talenty' : 'talentů'}`}
          </p>
          {!isLoggedIn && (
            <Badge variant="outline" className="bg-yellow-50 border-yellow-400 text-yellow-800">
              ⚠️ Přihlaste se pro kontakty
            </Badge>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Načítání talentů...</p>
            </div>
          </div>
        )}

        {/* Empty state - no talents */}
        {!loading && sortedTalents.length === 0 && talents.length === 0 && (
          <Card className="p-12 text-center border-2 border-blue-200">
            <div className="text-blue-400 mb-4">
              <AlertCircle className="w-16 h-16 mx-auto" />
            </div>
            {isPreviewMode ? (
              <>
                <h3 className="text-xl font-semibold mb-2">Připravujeme profily talentů</h3>
                <p className="text-gray-600 mb-4">
                  Talenti se právě registrují. Brzy zde najdete sportovce, umělce a influencery.
                </p>
                <Button
                  onClick={() => onNavigate('register')}
                  className="bg-gradient-to-r from-blue-600 to-orange-500"
                >
                  Registrovat se jako talent
                </Button>
              </>
            ) : currentUserRole === 'talent' ? (
              <>
                <h3 className="text-xl font-semibold mb-2">Váš profil zatím není veřejný</h3>
                <p className="text-gray-600 mb-4">
                  Pro zobrazení v seznamu talentů je nutné dokončit KYC verifikaci (nahrání občanského průkazu).
                </p>
                <Button
                  onClick={() => onNavigate('kyc')}
                  className="bg-gradient-to-r from-blue-600 to-orange-500"
                >
                  Dokončit KYC verifikaci
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2">Zatím žádní talenti</h3>
                <p className="text-gray-600 mb-4">
                  Talenti se právě registrují. Buďte první firma, která najde partnery!
                </p>
              </>
            )}
          </Card>
        )}

        {/* Talents Grid */}
        {!loading && sortedTalents.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {sortedTalents.map((talent) => (
              <Card
                key={talent.id}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group border hover:border-blue-500 relative overflow-hidden"
                onClick={() => {
                  if (isPreviewMode) {
                    onNavigate('register');
                  } else {
                    onNavigate('talent-profile', { userId: talent.id });
                  }
                }}
              >
                {/* Preview mode overlay */}
                {isPreviewMode && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-orange-500/10 backdrop-blur-[2px] z-10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/95 rounded-lg p-2 shadow-lg text-center">
                      <p className="font-semibold text-gray-900 mb-1 text-xs">🔒 Uzamčeno</p>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-orange-500 h-6 text-[10px] px-2">
                        Registrovat
                      </Button>
                    </div>
                  </div>
                )}
                <CardHeader className="text-center relative p-3 pb-0">
                  {talent.verified && (
                    <Badge className="absolute top-2 right-2 bg-blue-600 text-[10px] px-1.5 py-0.5 pointer-events-none">
                      ✓
                    </Badge>
                  )}
                  <Avatar className="w-14 h-14 mx-auto mb-2 ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all">
                    <AvatarImage src={talent.profileImage} alt={`${talent.firstName} ${talent.lastName}`} />
                    <AvatarFallback>{talent.firstName?.[0] || ''}{talent.lastName?.[0] || ''}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold group-hover:text-blue-600 transition-colors text-sm truncate px-1">
                    {talent.firstName} {talent.lastName}
                  </h3>
                  {talent.category && (
                    <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0 h-4">
                      {talent.category}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="p-3 pt-2">
                  {/* Stats */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 mb-2">
                    <div className="text-center">
                      <span className="font-bold text-sm block leading-none">{formatFollowers(talent.followers)}</span>
                      <span className="text-[10px] text-gray-500">Sledující</span>
                    </div>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <div className="text-center">
                      <span className="font-bold text-sm block leading-none">{talent.rating?.toFixed(1) || '5.0'}</span>
                      <span className="text-[10px] text-gray-500">Hodnocení</span>
                    </div>
                  </div>

                  {talent.bio && (
                    <p className="text-xs text-gray-500 line-clamp-2 h-8 text-center">
                      {talent.bio}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results with filters */}
        {!loading && sortedTalents.length === 0 && talents.length > 0 && (
          <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Žádní talenti nenalezeni</h3>
            <p className="text-gray-600 mb-4">
              Zkuste změnit filtry nebo hledaný výraz
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Resetovat filtry
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
