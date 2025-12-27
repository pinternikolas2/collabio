import { useState, useEffect } from 'react';
import { Search, Filter, Building2, Loader2, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { categories } from '../utils/constants';
import { userApi } from '../utils/api';
import { User } from '../types';
import { toast } from 'sonner';

type CompaniesListProps = {
  onNavigate: (page: string, data?: any) => void;
  isLoggedIn: boolean;
  currentUserRole?: 'talent' | 'company' | 'admin' | null;
};

export default function CompaniesList({ onNavigate, isLoggedIn, currentUserRole = null }: CompaniesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [companies, setCompanies] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const isPreviewMode = !isLoggedIn;

  // Load companies from API
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const companiesData = await userApi.getCompanies();

      // Filter only verified companies (KYC completed)
      const verifiedCompanies = Array.isArray(companiesData)
        ? companiesData.filter(c => c && c.id && c.verified)
        : [];

      setCompanies(verifiedCompanies);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Nepodařilo se načíst firmy', {
        description: error instanceof Error ? error.message : 'Zkuste to znovu později'
      });
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.bio?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || company.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
            Seznam firem
          </h1>
          <p className="text-gray-600">
            Objevte firmy a značky hledající talentované partnery pro spolupráci
          </p>
        </div>

        {/* Auth Gate for Non-authenticated users */}
        {isPreviewMode ? (
          <div className="flex items-center justify-center min-h-[500px] p-8 bg-gradient-to-r from-blue-50 to-orange-50 rounded-3xl border-2 border-blue-300 shadow-xl text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-200/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 shadow-lg flex items-center justify-center mb-6 ring-8 ring-white/50">
                <span className="text-4xl">🔒</span>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Omezený náhled seznamu firem
              </h2>

              <p className="text-lg text-gray-700 mb-8 max-w-lg leading-relaxed">
                Pro zobrazení ověřených firem, detailů o jejich projektech a možnost navázání spolupráce se musíte <strong>přihlásit</strong> nebo <strong>zaregistrovat</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                <Button
                  size="lg"
                  onClick={() => onNavigate('register')}
                  className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-bold text-base px-24 py-6 h-auto rounded-xl shadow-lg transition-transform hover:-translate-y-1 min-w-[300px]"
                >
                  Registrovat se zdarma
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigate('login')}
                  className="border-2 border-gray-300 text-gray-700 font-bold text-lg px-10 py-6 h-auto rounded-xl hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Přihlásit se
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Notice for companies */}
            {currentUserRole === 'company' && (
              <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-900">
                  💡 <strong>Poznámka:</strong> Jako firma můžete procházet profily jiných firem, ale nelze je kontaktovat. Collabio je platforma pro propojení talentů a firem.
                </p>
                <p className="text-sm text-orange-800 mt-2">
                  ℹ️ Váš profil se zobrazí v seznamu po dokončení KYC verifikace (nahrání IČO SRO nebo občanského průkazu).
                </p>
              </div>
            )}

            {/* Filters */}
            <Card className="mb-8 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Hledat firmy..."
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
                </div>
              </CardContent>
            </Card>

            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                {loading ? 'Načítání...' : `Nalezeno ${filteredCompanies.length} ${filteredCompanies.length === 1 ? 'firma' : filteredCompanies.length < 5 ? 'firmy' : 'firem'}`}
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
                  <p className="text-gray-600">Načítání firem...</p>
                </div>
              </div>
            )}

            {/* Empty state - no companies */}
            {!loading && filteredCompanies.length === 0 && companies.length === 0 && (
              <Card className="p-12 text-center border-2 border-orange-200">
                <div className="text-orange-400 mb-4">
                  <AlertCircle className="w-16 h-16 mx-auto" />
                </div>
                {currentUserRole === 'company' ? (
                  <>
                    <h3 className="text-xl font-semibold mb-2">Váš profil zatím není veřejný</h3>
                    <p className="text-gray-600 mb-4">
                      Pro zobrazení v seznamu firem je nutné dokončit KYC verifikaci (nahrání IČO SRO nebo občanského průkazu).
                    </p>
                    <Button
                      onClick={() => onNavigate('kyc')}
                      className="bg-gradient-to-r from-orange-500 to-orange-400"
                    >
                      Dokončit KYC verifikaci
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-2">Zatím žádné firmy</h3>
                    <p className="text-gray-600 mb-4">
                      Firmy se právě registrují. Buďte první talent, který najde partnery!
                    </p>
                  </>
                )}
              </Card>
            )}

            {/* Companies Grid */}
            {!loading && filteredCompanies.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCompanies.map((company) => (
                  <Card
                    key={company.id}
                    className="group overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer border-2 hover:border-orange-500 relative bg-white flex flex-col h-full"
                    onClick={() => {
                      onNavigate('company-profile', { userId: company.id });
                    }}
                  >
                    {/* Header Image Area */}
                    <div className="relative h-40 overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 group-hover:from-orange-100 group-hover:to-amber-100 transition-colors duration-500">
                      <div className="absolute top-0 right-0 p-3 z-20">
                        {company.verified && (
                          <Badge className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
                            <span className="mr-1">✓</span> Ověřeno
                          </Badge>
                        )}
                      </div>

                      <Avatar className="w-24 h-24 ring-4 ring-white shadow-xl group-hover:scale-110 transition-transform duration-500 rounded-xl">
                        <AvatarImage src={company.profileImage} alt={company.companyName} className="object-cover" />
                        <AvatarFallback className="bg-orange-600 text-white rounded-xl">
                          <Building2 className="w-10 h-10" />
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          {company.category && (
                            <Badge variant="secondary" className="bg-orange-50 text-orange-800 hover:bg-orange-100 border-orange-100">
                              {company.category}
                            </Badge>
                          )}
                          <div className="flex items-center text-yellow-500 text-xs font-bold gap-1">
                            <span className="text-gray-400 font-normal">Hodnocení:</span>
                            {(company as any).rating?.toFixed(1) || '5.0'}
                          </div>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                          {company.companyName || `${company.firstName} ${company.lastName}`}
                        </h3>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-2 gap-2 mb-4 py-3 border-y border-gray-100">
                        <div className="text-center">
                          <span className="font-bold text-gray-900 block">3</span>
                          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Projekty</span>
                        </div>
                        <div className="text-center border-l border-gray-100">
                          <span className="font-bold text-gray-900 block">100%</span>
                          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Aktivita</span>
                        </div>
                      </div>

                      {company.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                          {company.bio}
                        </p>
                      )}

                      <div className="mt-auto flex justify-end">
                        <span className="text-sm font-semibold text-orange-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Zobrazit profil <Building2 className="w-4 h-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results with filters */}
            {!loading && filteredCompanies.length === 0 && companies.length > 0 && (
              <Card className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Žádné firmy nenalezeny</h3>
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
          </>
        )}
      </div>
    </div>
  );
}
