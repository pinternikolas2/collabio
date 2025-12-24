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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 overflow-x-hidden w-full">
      <div className="container mx-auto px-3 md:px-4 max-w-6xl w-full overflow-x-hidden">
        {/* Header Card */}
        <Card className="mb-8 max-w-full">
          {/* Cover */}
          <div className="h-24 md:h-32 bg-gradient-to-r from-orange-600 to-orange-400"></div>

          <CardContent className="relative pb-6 overflow-x-hidden max-w-full -mt-16 md:-mt-20">
            {/* Profile Image */}
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
              <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 md:border-8 border-white shadow-2xl rounded-xl bg-white">
                <AvatarImage src={company.profileImage} alt={company.companyName || `${company.firstName} ${company.lastName}`} />
                <AvatarFallback className="text-4xl rounded-xl"><Building2 className="w-20 h-20" /></AvatarFallback>
              </Avatar>

              <div className="flex-1 md:mb-4 min-w-0 max-w-full overflow-x-hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-full">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-bold break-words">
                        {company.companyName || `${company.firstName} ${company.lastName}`}
                      </h1>
                      {company.verified && (
                        <Badge className="bg-orange-600">✓ {t('company_profile.verified')}</Badge>
                      )}
                    </div>
                    {company.category && (
                      <Badge variant="secondary" className="mb-2 bg-orange-100 text-orange-800">{company.category}</Badge>
                    )}
                    <p className="text-gray-600">{company.bio}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 max-w-full">
                    {!isOwnProfile && currentUserRole === 'talent' && (
                      <>
                        <Button
                          className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 whitespace-nowrap flex-shrink-0"
                          onClick={() => onNavigate('chat', { userId })}
                          size="sm"
                        >
                          <MessageSquare className="w-4 h-4 mr-1 md:mr-2" />
                          <span className="hidden sm:inline">{t('company_profile.send_message')}</span>
                          <span className="sm:hidden">{t('company_profile.message_short')}</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onNavigate('create-project', {
                            targetUserId: userId,
                            targetUserName: company.companyName
                          })}
                          className="whitespace-nowrap flex-shrink-0"
                          size="sm"
                        >
                          <Briefcase className="w-4 h-4 mr-1 md:mr-2" />
                          <span className="hidden sm:inline">{t('company_profile.offer_collaboration')}</span>
                          <span className="sm:hidden">{t('company_profile.collaboration_short')}</span>
                        </Button>
                      </>
                    )}
                    {!isOwnProfile && currentUserRole === 'company' && (
                      <div className="w-full p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm text-orange-900">
                          {t('company_profile.cant_contact_company')}
                        </p>
                      </div>
                    )}
                    {isOwnProfile && (
                      <>
                        <Button
                          onClick={() => onNavigate('company-analytics')}
                          className="bg-gradient-to-r from-orange-600 to-orange-500 whitespace-nowrap flex-shrink-0"
                          size="sm"
                        >
                          <TrendingUp className="w-4 h-4 mr-1 md:mr-2" />
                          {t('company_profile.analytics')}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onNavigate('settings')}
                          className="whitespace-nowrap flex-shrink-0"
                          size="sm"
                        >
                          {t('company_profile.edit_profile')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-orange-100 text-orange-600"
                          onClick={() => {
                            navigator.share ? navigator.share({
                              title: `${company.companyName} - Collabio`,
                              url: window.location.href
                            }).catch(() => { }) : (navigator.clipboard.writeText(window.location.href), toast.success('Odkaz zkopírován'));
                          }}
                        >
                          <Share2 className="w-5 h-5" />
                        </Button>
                      </>
                    )}
                    {!isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-orange-100 text-orange-600"
                        onClick={() => {
                          navigator.share ? navigator.share({
                            title: `${company.companyName} - Collabio`,
                            url: window.location.href
                          }).catch(() => { }) : (navigator.clipboard.writeText(window.location.href), toast.success('Odkaz zkopírován'));
                        }}
                      >
                        <Share2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="text-center p-3 md:p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                  <p className="text-xl md:text-2xl font-bold">{activeProjects}</p>
                </div>
                <p className="text-xs md:text-sm text-gray-600">{t('company_profile.stats.active_projects')}</p>
              </div>

              <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  <p className="text-xl md:text-2xl font-bold">{completedCollabs}</p>
                </div>
                <p className="text-xs md:text-sm text-gray-600">{t('company_profile.stats.completed')}</p>
              </div>

              <div className="text-center p-3 md:p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                  <p className="text-xl md:text-2xl font-bold">{avgRating.toFixed(1)}</p>
                </div>
                <p className="text-xs md:text-sm text-gray-600">{t('company_profile.stats.rating')}</p>
              </div>

              <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  <p className="text-xl md:text-2xl font-bold">
                    {new Date(company.createdAt).toLocaleDateString('cs-CZ', { year: 'numeric' })}
                  </p>
                </div>
                <p className="text-xs md:text-sm text-gray-600">{t('company_profile.stats.member_since')}</p>
              </div>

              {/* Celkové výdaje - pouze pro vlastníka profilu */}
              {isOwnProfile && (
                <div className="text-center p-3 md:p-4 bg-purple-50 rounded-lg col-span-2 md:col-span-1">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                    <p className="text-xl md:text-2xl font-bold">{formatPrice(totalSpent)}</p>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600">{t('company_profile.stats.total_spent')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Social Media */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">{t('company_profile.sections.social_media')}</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.instagram && (
                  <a
                    href={`https://instagram.com/${company.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-pink-50 transition-colors group"
                  >
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold group-hover:text-pink-600">Instagram</p>
                      <p className="text-xs text-gray-600">{company.instagram}</p>
                    </div>
                  </a>
                )}
                {company.linkedin && (
                  <a
                    href={`https://linkedin.com/company/${company.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <Linkedin className="w-5 h-5 text-blue-700" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold group-hover:text-blue-700">LinkedIn</p>
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
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">{t('company_profile.sections.industry_focus')}</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Brand Awareness</span>
                      <span className="text-sm font-semibold">95%</span>
                    </div>
                    <Progress value={95} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Content Marketing</span>
                      <span className="text-sm font-semibold">90%</span>
                    </div>
                    <Progress value={90} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Influencer Marketing</span>
                      <span className="text-sm font-semibold">88%</span>
                    </div>
                    <Progress value={88} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="projects">
              <TabsList className="w-full">
                <TabsTrigger value="projects" className="flex-1">
                  {t('company_profile.tabs.projects')} ({activeProjects})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">
                  {t('company_profile.tabs.reviews')} ({companyRatings.length})
                </TabsTrigger>
                <TabsTrigger value="collaborations" className="flex-1">
                  {t('company_profile.tabs.collaborations')} ({completedCollabs})
                </TabsTrigger>
              </TabsList>

              {/* Projects Tab */}
              <TabsContent value="projects">
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
  );
}
