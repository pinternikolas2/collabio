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


        {!isPreviewMode && currentUserRole === 'talent' && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              💡 <strong>Poznámka:</strong> Jako talent můžete procházet profily jiných talentů, ale nelze je kontaktovat. Collabio je platforma pro propojení talentů a firem.
            </p>
            <p className="text-sm text-blue-800 mt-2">
              ℹ️ Váš profil se zobrazí v seznamu po dokončení KYC verifikace (nahrání občanského průkazu).
            </p>
          </div>
        )}

        {/* Banner for Non-authenticated users */}
        {isPreviewMode && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl shrink-0">
                  🔒
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Přihlaste se pro plný přístup</h3>
                  <p className="text-gray-600 max-w-xl">
                    Prohlížíte si omezený náhled. Pro kontaktování talentů a zobrazení všech detailů je nutné se přihlásit.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button onClick={() => onNavigate('login')} variant="outline" className="bg-white">Přihlásit se</Button>
                <Button onClick={() => onNavigate('register')} className="bg-gradient-to-r from-blue-600 to-orange-500 text-white">Registrovat se</Button>
              </div>
            </div>
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
          {isPreviewMode && (
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
            {currentUserRole === 'talent' ? (
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedTalents.map((talent) => (
              <Card
                key={talent.id}
                className="group overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer border-2 hover:border-blue-500 relative bg-white flex flex-col h-full"
                onClick={() => {
                  if (isPreviewMode) {
                    onNavigate('register');
                  } else {
                    onNavigate('talent-profile', { userId: talent.id });
                  }
                }}
              >
                {/* Preview overlay */}
                {isPreviewMode && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white p-4 rounded-xl shadow-xl text-center transform scale-95 group-hover:scale-100 transition-transform">
                      <span className="text-2xl mb-2 block">🔒</span>
                      <p className="font-bold text-gray-900 text-sm mb-2">Pro detail se prosím registrujte</p>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-orange-500 w-full">
                        Registrovat zdarma
                      </Button>
                    </div>
                  </div>
                )}

                {/* Header Image Area */}
                <div className="relative h-40 overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors duration-500">
                  <div className="absolute top-0 right-0 p-3 z-20">
                    {talent.verified && (
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <span className="mr-1">✓</span> Ověřeno
                      </Badge>
                    )}
                  </div>

                  <Avatar className="w-24 h-24 ring-4 ring-white shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <AvatarImage src={talent.profileImage} alt={`${talent.firstName} ${talent.lastName}`} className="object-cover" />
                    <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                      {talent.firstName?.[0]}{talent.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      {talent.category && (
                        <Badge variant="secondary" className={
                          talent.category === 'Sportovec' ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' :
                            talent.category === 'Umělec' ? 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100' :
                              talent.category === 'Influencer' ? 'bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100' :
                                'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                        }>
                          {talent.category}
                        </Badge>
                      )}
                      <div className="flex items-center text-yellow-500 text-xs font-bold gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        {talent.rating?.toFixed(1) || '5.0'}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {talent.firstName} {talent.lastName}
                    </h3>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-2 mb-4 py-3 border-y border-gray-100">
                    <div className="text-center">
                      <span className="font-bold text-gray-900 block">{formatFollowers(talent.followers)}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Sledující</span>
                    </div>
                    <div className="text-center border-l border-gray-100">
                      <span className="font-bold text-gray-900 block">100%</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Spolehlivost</span>
                    </div>
                  </div>

                  {talent.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                      {talent.bio}
                    </p>
                  )}

                  <div className="mt-auto flex justify-end">
                    <span className="text-sm font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Zobrazit profil <Users className="w-4 h-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Limited Access Warning (Bottom) */}
        {isPreviewMode && sortedTalents.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-semibold mb-3">
                🔒 Odemkněte plný přístup
              </h3>
              <p className="text-gray-700 mb-4">
                Pro zobrazení detailů a kontaktování talentů je nutné se přihlásit.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => onNavigate('login')}
                  variant="outline"
                >
                  Přihlásit se
                </Button>
                <Button
                  onClick={() => onNavigate('register')}
                  className="bg-gradient-to-r from-blue-600 to-orange-500"
                >
                  Registrovat se zdarma
                </Button>
              </div>
            </CardContent>
          </Card>
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
