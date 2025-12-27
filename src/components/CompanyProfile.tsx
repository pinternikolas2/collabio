import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Briefcase, Instagram, Linkedin, MessageSquare, Calendar, TrendingUp, Building2, CheckCircle, Loader2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { mockRatings, mockCollaborations, mockProjects, mockUsers } from '../data/seedData';
import { User } from '../types';
import { userApi } from '../utils/api';

type CompanyProfileProps = {
  onNavigate: (page: string, data?: any) => void;
  userId: string;
  isOwnProfile?: boolean;
  currentUserRole?: 'talent' | 'company' | 'admin' | null;
};

export default function CompanyProfile({ onNavigate, userId, isOwnProfile = false, currentUserRole = null }: CompanyProfileProps) {
  const { t } = useTranslation();
  const [company, setCompany] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[CompanyProfile] Loading company profile for userId:', userId);
        const userData = await userApi.getUser(userId);
        console.log('[CompanyProfile] Loaded user data:', userData);

        if (userData.role !== 'company') {
          setError(t('company_profile.errors.not_company'));
          setCompany(null);
        } else {
          setCompany(userData);
        }
      } catch (err: any) {
        console.error('[CompanyProfile] Error loading company:', err);
        const errorMessage = err?.message || 'Neznámá chyba';

        // Check if it's a network error (backend offline)
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
          setError(t('company_profile.errors.backend_unavailable'));
        } else if (errorMessage.includes('User not found')) {
          setError(t('company_profile.errors.user_not_found'));
        } else {
          setError(t('company_profile.errors.fetch_error', { error: errorMessage }));
        }
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('company_profile.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">{t('company_profile.errors.load_error_title')}</h2>
          <p className="text-gray-700 mb-6">{error || t('company_profile.errors.not_found')}</p>

          {error?.includes('Backend') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-yellow-900 mb-2">{t('company_profile.errors.what_to_do')}</p>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>{t('company_profile.errors.check_console')}</li>
                <li>{t('company_profile.errors.backend_deploy')}</li>
                <li>{t('company_profile.errors.docs')}</li>
              </ul>
            </div>
          )}

          <Button onClick={() => onNavigate('companies')}>{t('company_profile.back_to_list')}</Button>
        </div>
      </div>
    );
  }

  const companyRatings = mockRatings.filter((r) => r.toUserId === userId);
  const avgRating = companyRatings.length > 0
    ? companyRatings.reduce((sum, r) => sum + r.rating, 0) / companyRatings.length
    : 0;

  const completedCollabs = mockCollaborations.filter(
    (c) => c.companyId === userId && c.status === 'completed'
  ).length;

  const activeProjects = mockProjects.filter(
    (p) => p.companyId === userId && p.status === 'open'
  ).length;

  const totalSpent = mockCollaborations
    .filter((c) => c.companyId === userId && c.status === 'completed' && c.escrowReleased)
    .reduce((sum, c) => sum + c.price, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 md:py-12 overflow-x-hidden w-full">
      <div className="container mx-auto px-4 max-w-6xl w-full overflow-x-hidden">
        {/* Header Card */}
        <Card className="mb-8 max-w-full overflow-hidden border-none shadow-xl bg-white/80 backdrop-blur-md">
          {/* Cover - Full Gradient */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-orange-600 via-red-500 to-orange-400 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <CardContent className="relative pb-8 overflow-x-hidden max-w-full -mt-20 md:-mt-24 px-6 md:px-10">
            {/* Profile Image & Info */}
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <Avatar className="w-32 h-32 md:w-48 md:h-48 border-4 border-white shadow-2xl rounded-2xl bg-white relative">
                  <AvatarImage src={company.profileImage} alt={company.companyName || `${company.firstName} ${company.lastName}`} className="object-cover rounded-2xl" />
                  <AvatarFallback className="text-5xl rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 text-orange-900"><Building2 className="w-20 h-20" /></AvatarFallback>
                </Avatar>
                {company.verified && (
                  <div className="absolute bottom-2 right-2 bg-orange-600 text-white p-1.5 rounded-full border-4 border-white shadow-lg" title={t('company_profile.verified')}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 md:mb-6 min-w-0 max-w-full overflow-x-hidden">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 max-w-full">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h1 className="text-3xl md:text-5xl font-bold break-words bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        {company.companyName || `${company.firstName} ${company.lastName}`}
                      </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      {company.category && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 px-3 py-1 text-sm border border-orange-200">
                          {company.category}
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">{company.bio}</p>
                  </div>

                  <div className="flex flex-wrap gap-3 max-w-full mt-4 md:mt-0">
                    {!isOwnProfile && currentUserRole === 'talent' && (
                      <>
                        <Button
                          className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5"
                          onClick={() => onNavigate('chat', { userId })}
                          size="lg"
                        >
                          <MessageSquare className="w-5 h-5 mr-2" />
                          <span className="hidden sm:inline">{t('company_profile.send_message')}</span>
                          <span className="sm:hidden">{t('company_profile.message_short')}</span>
                        </Button>
                        <Button
                          className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                          onClick={() => onNavigate('create-project', {
                            targetUserId: userId,
                            targetUserName: company.companyName
                          })}
                          size="lg"
                        >
                          <Briefcase className="w-5 h-5 mr-2" />
                          <span className="hidden sm:inline">{t('company_profile.offer_collaboration')}</span>
                          <span className="sm:hidden">{t('company_profile.collaboration_short')}</span>
                        </Button>
                      </>
                    )}
                    {!isOwnProfile && currentUserRole === 'company' && (
                      <div className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-500 italic">
                        {t('company_profile.cant_contact_company')}
                      </div>
                    )}
                    {isOwnProfile && (
                      <>
                        <Button
                          onClick={() => onNavigate('company-analytics')}
                          className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                          size="lg"
                        >
                          <TrendingUp className="w-5 h-5 mr-2" />
                          {t('company_profile.analytics')}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onNavigate('settings')}
                          className="border-gray-200 hover:bg-gray-50"
                          size="lg"
                        >
                          {t('company_profile.edit_profile')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-orange-50 text-orange-600 rounded-full w-12 h-12"
                          onClick={() => {
                            navigator.share ? navigator.share({
                              title: `${company.companyName} - Collabio`,
                              url: window.location.href
                            }).catch(() => { }) : (navigator.clipboard.writeText(window.location.href), toast.success('Odkaz zkopírován'));
                          }}
                        >
                          <Share2 className="w-6 h-6" />
                        </Button>
                      </>
                    )}
                    {!isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-orange-50 text-orange-600 rounded-full w-12 h-12"
                        onClick={() => {
                          navigator.share ? navigator.share({
                            title: `${company.companyName} - Collabio`,
                            url: window.location.href
                          }).catch(() => { }) : (navigator.clipboard.writeText(window.location.href), toast.success('Odkaz zkopírován'));
                        }}
                      >
                        <Share2 className="w-6 h-6" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid - Premium Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">{t('company_profile.stats.active_projects')}</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{activeProjects}</p>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">{t('company_profile.stats.completed')}</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{completedCollabs}</p>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                    <Star className="w-5 h-5" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">{t('company_profile.stats.rating')}</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">{t('company_profile.stats.member_since')}</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {new Date(company.createdAt).getFullYear()}
                </p>
              </div>

              {/* Celkové výdaje - pouze pro vlastníka profilu */}
              {isOwnProfile && (
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 md:p-6 rounded-2xl shadow-lg text-white col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs md:text-sm font-medium opacity-90">{t('company_profile.stats.total_spent')}</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{formatPrice(totalSpent)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Social Media */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-500" />
                  {t('company_profile.sections.social_media')}
                </h3>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {company.instagram && (
                  <a
                    href={`https://instagram.com/${company.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-transparent border border-pink-100/50 hover:border-pink-200 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-pink-600">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">Instagram</p>
                      <p className="text-xs text-gray-500">{company.instagram}</p>
                    </div>
                  </a>
                )}
                {company.linkedin && (
                  <a
                    href={`https://linkedin.com/company/${company.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-transparent border border-blue-100/50 hover:border-blue-200 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-blue-700">
                      <Linkedin className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">LinkedIn</p>
                      <p className="text-xs text-gray-600">{company.linkedin}</p>
                    </div>
                  </a>
                )}
                {!company.instagram && !company.linkedin && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {t('company_profile.sections.no_socials')}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Industry Focus */}
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  {t('company_profile.sections.industry_focus')}
                </h3>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Brand Awareness</span>
                      <span className="text-sm font-bold text-blue-600">95%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 w-[95%] rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Content Marketing</span>
                      <span className="text-sm font-bold text-orange-600">90%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 w-[90%] rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Influencer Marketing</span>
                      <span className="text-sm font-bold text-purple-600">88%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 w-[88%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <Tabs defaultValue="projects" className="w-full">
                <div className="border-b border-gray-100 px-6 pt-6">
                  <TabsList className="w-full justify-start h-auto p-1 bg-gray-50/50 rounded-xl gap-1 mb-6 inline-flex">
                    <TabsTrigger
                      value="projects"
                      className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm font-medium transition-all"
                    >
                      {t('company_profile.tabs.projects')}
                      <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800 border-none">{activeProjects}</Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-sm font-medium transition-all"
                    >
                      {t('company_profile.tabs.reviews')}
                      <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800 border-none">{companyRatings.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="collaborations"
                      className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm font-medium transition-all"
                    >
                      {t('company_profile.tabs.collaborations')}
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-none">{completedCollabs}</Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Projects Tab */}
                <TabsContent value="projects" className="p-0 m-0">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      {mockProjects
                        .filter((p) => p.companyId === userId)
                        .map((project) => (
                          <div
                            key={project.id}
                            className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => onNavigate('marketplace')}
                          >
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold">{project.title}</h4>
                                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                    {project.description}
                                  </p>
                                </div>
                                <Badge
                                  className={
                                    project.status === 'open'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }
                                >
                                  {project.status === 'open' ? t('company_profile.projects.open') : t('company_profile.projects.closed')}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-3">
                                <span className="text-sm text-gray-600">
                                  <strong>{t('company_profile.projects.budget')}</strong> {formatPrice(project.budget)}
                                </span>
                                <span className="text-sm text-gray-600">
                                  <strong>{t('company_profile.projects.category')}</strong> {project.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                      {mockProjects.filter((p) => p.companyId === userId).length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                          {t('company_profile.projects.none')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      {/* Rating Summary */}
                      <div className="flex items-center gap-6 pb-6 border-b">
                        <div className="text-center">
                          <div className="text-5xl font-bold mb-2">{avgRating.toFixed(1)}</div>
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${star <= avgRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">{t('company_profile.reviews.count', { count: companyRatings.length })}</p>
                        </div>

                        <div className="flex-1 space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = companyRatings.filter((r) => r.rating === rating).length;
                            const percentage = companyRatings.length > 0 ? (count / companyRatings.length) * 100 : 0;
                            return (
                              <div key={rating} className="flex items-center gap-2">
                                <span className="text-sm w-8">{rating} ⭐</span>
                                <Progress value={percentage} className="flex-1" />
                                <span className="text-sm text-gray-600 w-8">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Individual Reviews */}
                      <div className="space-y-4">
                        {companyRatings.map((rating) => {
                          const reviewer = mockUsers.find((u) => u.id === rating.fromUserId);
                          return (
                            <div key={rating.id} className="border-b pb-4 last:border-0">
                              <div className="flex items-start gap-3 mb-2">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={reviewer?.profileImage} />
                                  <AvatarFallback>{reviewer?.firstName[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-semibold">
                                      {reviewer?.firstName} {reviewer?.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(rating.createdAt).toLocaleDateString('cs-CZ')}
                                    </p>
                                  </div>
                                  <div className="flex gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-4 h-4 ${star <= rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                          }`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-sm text-gray-700">{rating.comment}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {companyRatings.length === 0 && (
                          <p className="text-center text-gray-500 py-8">
                            {t('company_profile.reviews.none')}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Collaborations Tab */}
                <TabsContent value="collaborations">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      {mockCollaborations
                        .filter((c) => c.companyId === userId && c.status === 'completed')
                        .map((collab) => {
                          const project = mockProjects.find((p) => p.id === collab.projectId);
                          const talent = mockUsers.find((u) => u.id === collab.talentId);
                          return (
                            <div
                              key={collab.id}
                              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={talent?.profileImage} />
                                <AvatarFallback>{talent?.firstName[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-semibold">{project?.title}</p>
                                <p className="text-sm text-gray-600">
                                  {talent?.firstName} {talent?.lastName}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatPrice(collab.price)}</p>
                                <Badge className="bg-green-100 text-green-800">{t('company_profile.collaborations.completed')}</Badge>
                              </div>
                            </div>
                          );
                        })}

                      {completedCollabs === 0 && (
                        <p className="text-center text-gray-500 py-8">
                          {t('company_profile.collaborations.none')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
