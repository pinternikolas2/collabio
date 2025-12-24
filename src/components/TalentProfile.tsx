import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Users, Instagram, Linkedin, MessageSquare, Briefcase, Calendar, TrendingUp, MapPin, Tv, Eye, Plus, X, DollarSign, Tag, Loader2, Share2, AlertTriangle, User } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { mockRatings, mockCollaborations, mockProjects, mockEvents } from '../data/seedData';
import { Event, AdvertisingOptionType, User } from '../types';
import { userApi, storageApi } from '../utils/api';

type TalentProfileProps = {
  onNavigate: (page: string, data?: any) => void;
  userId: string;
  isOwnProfile?: boolean;
  currentUserRole?: 'talent' | 'company' | 'admin' | null;
};

export default function TalentProfile({ onNavigate, userId, isOwnProfile = false, currentUserRole = null }: TalentProfileProps) {
  const { t } = useTranslation();
  const [talent, setTalent] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTalent = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[TalentProfile] Loading talent profile for userId:', userId);
        const userData = await userApi.getUser(userId);
        console.log('[TalentProfile] Loaded user data:', userData);

        if (userData.role !== 'talent') {
          setError(t('talent_profile.errors.not_talent'));
          setTalent(null);
        } else {
          setTalent(userData);
        }
      } catch (err: any) {
        console.error('[TalentProfile] Error loading talent:', err);
        const errorMessage = err?.message || 'Neznámá chyba';

        // Check if it's a network error (backend offline)
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
          setError(t('talent_profile.errors.backend_unavailable'));
        } else if (errorMessage.includes('User not found')) {
          setError(t('talent_profile.errors.user_not_found'));
        } else {
          setError(t('talent_profile.errors.fetch_error', { error: errorMessage }));
        }
        setTalent(null);
      } finally {
        setLoading(false);
      }
    };

    loadTalent();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('talent_profile.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !talent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">{t('talent_profile.errors.load_error_title')}</h2>
          <p className="text-gray-700 mb-6">{error || t('talent_profile.errors.not_found')}</p>

          {error?.includes('Backend') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-yellow-900 mb-2">{t('talent_profile.errors.what_to_do')}</p>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>{t('talent_profile.errors.check_console')}</li>
                <li>{t('talent_profile.errors.backend_deploy')}</li>
                <li>{t('talent_profile.errors.docs')}</li>
              </ul>
            </div>
          )}

          <Button onClick={() => onNavigate('talents')}>{t('talent_profile.back_to_list')}</Button>
        </div>
      </div>
    );
  }

  const talentRatings = mockRatings.filter((r) => r.toUserId === userId);
  const avgRating = talentRatings.length > 0
    ? talentRatings.reduce((sum, r) => sum + r.rating, 0) / talentRatings.length
    : 0;

  const completedCollabs = mockCollaborations.filter(
    (c) => c.talentId === userId && c.status === 'completed'
  ).length;

  const totalEarnings = mockCollaborations
    .filter((c) => c.talentId === userId && c.status === 'completed' && c.escrowReleased)
    .reduce((sum, c) => sum + c.price, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatFollowers = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-4 md:py-8 overflow-x-hidden w-full">
      <div className="container mx-auto px-4 max-w-6xl w-full overflow-x-hidden">
        {/* Header Card */}
        <Card className="mb-8 max-w-full">
          {/* Cover */}
          <div className="h-24 md:h-32 bg-gradient-to-r from-blue-600 to-orange-500"></div>

          <CardContent className="relative pb-6 overflow-x-hidden max-w-full -mt-16 md:-mt-20">
            {/* Profile Image */}
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
              <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 md:border-8 border-white shadow-2xl bg-white">
                <AvatarImage src={talent.profileImage} alt={`${talent.firstName} ${talent.lastName}`} />
                <AvatarFallback className="text-4xl">{talent.firstName[0]}{talent.lastName[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 md:mb-4 min-w-0 max-w-full overflow-x-hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-full">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-bold break-words">{talent.firstName} {talent.lastName}</h1>
                      {talent.verified && (
                        <Badge className="bg-blue-600">✓ {t('talent_profile.verified')}</Badge>
                      )}
                    </div>
                    {talent.category && (
                      <Badge variant="secondary" className="mb-2">{talent.category}</Badge>
                    )}
                    {talent.title && (
                      <p className="text-lg font-medium text-gray-800 mb-2">{talent.title}</p>
                    )}
                    <p className="text-gray-600">{talent.bio}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 max-w-full">
                    {!isOwnProfile && currentUserRole === 'company' && (
                      <>
                        <Button
                          className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 whitespace-nowrap flex-shrink-0"
                          onClick={() => onNavigate('chat', { userId })}
                          size="sm"
                        >
                          <MessageSquare className="w-4 h-4 mr-1 md:mr-2" />
                          <span className="hidden sm:inline">{t('talent_profile.send_message')}</span>
                          <span className="sm:hidden">{t('talent_profile.message_short')}</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onNavigate('create-project', {
                            targetUserId: userId,
                            targetUserName: `${talent.firstName} ${talent.lastName}`
                          })}
                          className="whitespace-nowrap flex-shrink-0"
                          size="sm"
                        >
                          <Briefcase className="w-4 h-4 mr-1 md:mr-2" />
                          <span className="hidden sm:inline">{t('talent_profile.offer_collaboration')}</span>
                          <span className="sm:hidden">{t('talent_profile.collaboration_short')}</span>
                        </Button>
                      </>
                    )}
                    {!isOwnProfile && currentUserRole === 'talent' && (
                      <div className="w-full p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-900">
                          {t('talent_profile.cant_contact_talent')}
                        </p>
                      </div>
                    )}
                    {isOwnProfile && (
                      <>
                        <Button
                          onClick={() => onNavigate('talent-analytics')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 whitespace-nowrap flex-shrink-0"
                          size="sm"
                        >
                          <TrendingUp className="w-4 h-4 mr-1 md:mr-2" />
                          {t('talent_profile.analytics')}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onNavigate('settings')}
                          className="whitespace-nowrap flex-shrink-0"
                          size="sm"
                        >
                          {t('talent_profile.edit_profile')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-blue-100 text-blue-600"
                          onClick={() => {
                            navigator.share ? navigator.share({
                              title: `${talent.firstName} ${talent.lastName} - Collabio`,
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
                        className="hover:bg-blue-100 text-blue-600"
                        onClick={() => {
                          navigator.share ? navigator.share({
                            title: `${talent.firstName} ${talent.lastName} - Collabio`,
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
              <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  <p className="text-xl md:text-2xl font-bold">{formatFollowers(talent.followers)}</p>
                </div>
                <p className="text-xs md:text-sm text-gray-600">{t('talent_profile.stats.followers')}</p>
              </div>

              <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  <p className="text-xl md:text-2xl font-bold">{completedCollabs}</p>
                </div>
                <p className="text-xs md:text-sm text-gray-600">{t('talent_profile.stats.projects')}</p>
              </div>

              <div className="text-center p-3 md:p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                  <p className="text-xl md:text-2xl font-bold">{avgRating.toFixed(1)}</p>
                </div>
                <p className="text-xs md:text-sm text-gray-600">{t('talent_profile.stats.rating')}</p>
              </div>

              <div className="text-center p-3 md:p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                  <p className="text-xl md:text-2xl font-bold">
                    {new Date(talent.createdAt).toLocaleDateString('cs-CZ', { year: 'numeric' })}
                  </p>
                </div>
                <p className="text-xs md:text-sm text-gray-600">{t('talent_profile.stats.member_since')}</p>
              </div>

              {/* Celkové příjmy - pouze pro vlastníka profilu */}
              {isOwnProfile && (
                <div className="text-center p-3 md:p-4 bg-purple-50 rounded-lg col-span-2 md:col-span-1">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                    <p className="text-xl md:text-2xl font-bold">{formatPrice(totalEarnings)}</p>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600">{t('talent_profile.stats.total_earnings')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Social Media */}
            {/* Social Media */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">{t('talent_profile.sections.social_media')}</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {talent.instagram && (
                  <a
                    href={`https://instagram.com/${talent.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-pink-50 transition-colors group"
                  >
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold group-hover:text-pink-600">Instagram</p>
                      <p className="text-xs text-gray-600">{talent.instagram}</p>
                    </div>
                    <Badge variant="outline">{formatFollowers(talent.followers)}</Badge>
                  </a>
                )}
                {talent.tiktok && (
                  <a
                    href={`https://tiktok.com/${talent.tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-5 h-5 bg-black rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Tt</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">TikTok</p>
                      <p className="text-xs text-gray-600">{talent.tiktok}</p>
                    </div>
                  </a>
                )}
                {talent.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${talent.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <Linkedin className="w-5 h-5 text-blue-700" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold group-hover:text-blue-700">LinkedIn</p>
                      <p className="text-xs text-gray-600">{talent.linkedin}</p>
                    </div>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Skills/Categories */}
            {/* Skills/Categories */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">{t('talent_profile.sections.skills')}</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Content Creation</span>
                      <span className="text-sm font-semibold">95%</span>
                    </div>
                    <Progress value={95} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Social Media Marketing</span>
                      <span className="text-sm font-semibold">90%</span>
                    </div>
                    <Progress value={90} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Brand Collaboration</span>
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
            {/* Upcoming Events Section */}
            <UpcomingEventsSection
              userId={userId}
              isOwnProfile={isOwnProfile}
              currentUserRole={currentUserRole}
              onNavigate={onNavigate}
            />

            <Tabs defaultValue="portfolio">
              <TabsList className="w-full">
                <TabsTrigger value="portfolio" className="flex-1">{t('talent_profile.tabs.portfolio')}</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">
                  {t('talent_profile.tabs.reviews')} ({talentRatings.length})
                </TabsTrigger>
                <TabsTrigger value="collaborations" className="flex-1">
                  {t('talent_profile.tabs.projects')} ({completedCollabs})
                </TabsTrigger>
              </TabsList>

              {/* Portfolio Tab */}
              <TabsContent value="portfolio">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{t('talent_profile.tabs.portfolio')}</h3>
                      <p className="text-sm text-gray-500">Ukázky tvé práce</p>
                    </div>
                    {isOwnProfile && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-orange-500">
                            <Plus className="w-4 h-4 mr-2" />
                            Přidat ukázku
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Přidat položku do portfolia</DialogTitle>
                          </DialogHeader>
                          <AddPortfolioItemForm
                            userId={userId}
                            onSuccess={() => {
                              toast.success('Položka přidána!');
                              window.location.reload();
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="mb-6 flex flex-wrap h-auto gap-2 bg-transparent justify-start p-0">
                        {['all', 'image', 'video', 'social', 'project', 'achievement'].map(type => (
                          <TabsTrigger
                            key={type}
                            value={type}
                            className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 border border-gray-200 bg-white rounded-full px-4"
                          >
                            {type === 'all' && 'Vše'}
                            {type === 'image' && 'Galerie'}
                            {type === 'video' && 'Videa'}
                            {type === 'social' && 'Social Posts'}
                            {type === 'project' && 'Projekty'}
                            {type === 'achievement' && 'Úspěchy'}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {['all', 'image', 'video', 'social', 'project', 'achievement'].map(filterType => (
                        <TabsContent key={filterType} value={filterType} className="mt-0">
                          {(!talent.portfolio || talent.portfolio.filter(i => filterType === 'all' || i.type === filterType).length === 0) ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                              <p className="text-gray-500">V této sekci zatím nic není.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {talent.portfolio
                                .filter(item => filterType === 'all' || item.type === filterType)
                                .map((item) => (
                                  <div key={item.id} className="group relative rounded-xl overflow-hidden border bg-white hover:shadow-lg transition-all flex flex-col">
                                    {/* Image/Preview */}
                                    <div className="aspect-video bg-gray-100 relative overflow-hidden shrink-0">
                                      {item.type === 'video' || item.type === 'social' ? (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                                          {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover opacity-60" />
                                          ) : (
                                            item.type === 'video' ? <Tv className="w-12 h-12" /> : <Instagram className="w-12 h-12" />
                                          )}
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            {item.type === 'video' ? <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm"><Tv className="w-8 h-8" /></div> : null}
                                          </div>
                                        </div>
                                      ) : item.type === 'achievement' ? (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 text-yellow-600">
                                          <Star className="w-16 h-16" />
                                        </div>
                                      ) : (
                                        <img
                                          src={item.imageUrl || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=60'}
                                          alt={item.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=60'; }}
                                        />
                                      )}

                                      <div className="absolute top-2 right-2 flex gap-2">
                                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-sm">
                                          {item.type === 'image' && 'Obrázek'}
                                          {item.type === 'video' && 'Video'}
                                          {item.type === 'social' && 'Social'}
                                          {item.type === 'project' && 'Projekt'}
                                          {item.type === 'achievement' && 'Úspěch'}
                                        </Badge>
                                      </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 flex flex-col flex-1">
                                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{item.description}</p>

                                      {item.link && (
                                        <a
                                          href={item.link}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-blue-600 text-xs font-semibold inline-flex items-center hover:underline mt-auto"
                                        >
                                          zobrazit <TrendingUp className="w-3 h-3 ml-1" />
                                        </a>
                                      )}
                                    </div>

                                    {/* Delete Action */}
                                    {isOwnProfile && (
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 z-10"
                                        onClick={async () => {
                                          if (confirm('Opravdu smazat?')) {
                                            try {
                                              const updatedPortfolio = talent.portfolio?.filter(p => p.id !== item.id) || [];
                                              await userApi.updateUser(userId, { portfolio: updatedPortfolio });
                                              window.location.reload();
                                            } catch (e) { toast.error('Chyba při mazání'); }
                                          }
                                        }}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                            </div>
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>
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
                        <p className="text-sm text-gray-600">{t('talent_profile.reviews.count', { count: talentRatings.length })}</p>
                      </div>

                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = talentRatings.filter((r) => r.rating === rating).length;
                          const percentage = talentRatings.length > 0 ? (count / talentRatings.length) * 100 : 0;
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
                      {talentRatings.map((rating) => {
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

                      {talentRatings.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                          {t('talent_profile.reviews.none')}
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
                      .filter((c) => c.talentId === userId && c.status === 'completed')
                      .map((collab) => {
                        const project = mockProjects.find((p) => p.id === collab.projectId);
                        const company = mockUsers.find((u) => u.id === collab.companyId);
                        return (
                          <div
                            key={collab.id}
                            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={company?.profileImage} />
                              <AvatarFallback>{company?.firstName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold">{project?.title}</p>
                              <p className="text-sm text-gray-600">
                                {company?.firstName} {company?.lastName}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatPrice(collab.price)}</p>
                              <Badge className="bg-green-100 text-green-800">{t('talent_profile.projects.completed')}</Badge>
                            </div>
                          </div>
                        );
                      })}

                    {completedCollabs === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        {t('talent_profile.projects.none')}
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

// Component for Upcoming Events Section
type UpcomingEventsSectionProps = {
  userId: string;
  isOwnProfile: boolean;
  currentUserRole?: 'talent' | 'company' | 'admin' | null;
  onNavigate: (page: string, data?: any) => void;
};

function UpcomingEventsSection({ userId, isOwnProfile, currentUserRole, onNavigate }: UpcomingEventsSectionProps) {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get events for this talent
  const userEvents = (mockEvents || []).filter(e => e.userId === userId && e.public);

  // Sort by date (nearest first)
  const upcomingEvents = userEvents
    .filter(e => new Date(e.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      match: t('talent_profile.events.types.match'),
      tournament: t('talent_profile.events.types.tournament'),
      concert: t('talent_profile.events.types.concert'),
      show: t('talent_profile.events.types.show'),
      conference: t('talent_profile.events.types.conference'),
      other: t('talent_profile.events.types.other')
    };
    return labels[type] || type;
  };

  const getAdvertisingTypeLabel = (type: AdvertisingOptionType) => {
    const labels: Record<AdvertisingOptionType, string> = {
      banner: t('talent_profile.events.ad_types.banner'),
      clothing: t('talent_profile.events.ad_types.clothing'),
      social_post: t('talent_profile.events.ad_types.social_post'),
      mention: t('talent_profile.events.ad_types.mention'),
      booth: t('talent_profile.events.ad_types.booth'),
      other: t('talent_profile.events.ad_types.other')
    };
    return labels[type] || type;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">{t('talent_profile.sections.upcoming_events')}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {isOwnProfile
                ? t('talent_profile.sections.upcoming_desc_own')
                : t('talent_profile.sections.upcoming_desc_other')}
            </p>
          </div>
          {isOwnProfile && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-orange-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Přidat událost
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('talent_profile.add_event_form.title')}</DialogTitle>
                </DialogHeader>
                <AddEventForm onClose={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">{t('talent_profile.sections.no_events')}</p>
            {isOwnProfile && (
              <p className="text-sm text-gray-400">
                {t('talent_profile.sections.add_events_hint')}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
                {/* Event Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-orange-500">
                        {getEventTypeLabel(event.type)}
                      </Badge>
                      {event.tvBroadcast && (
                        <Badge variant="outline" className="text-purple-600 border-purple-600">
                          <Tv className="w-3 h-3 mr-1" />
                          {t('talent_profile.events.tv_broadcast')}
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-xl font-semibold mb-2">{event.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                  </div>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{formatEventDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span>{event.venue || event.location}</span>
                  </div>
                  {event.expectedAttendance && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Eye className="w-4 h-4 text-green-600" />
                      <span>{t('talent_profile.events.visitors', { count: event.expectedAttendance.toLocaleString('cs-CZ') })}</span>
                    </div>
                  )}
                  {event.streamingPlatform && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Tv className="w-4 h-4 text-purple-600" />
                      <span>{event.streamingPlatform}</span>
                    </div>
                  )}
                </div>

                {/* Advertising Options */}
                {event.advertisingOptions.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-semibold mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-600" />
                      Reklamní možnosti
                    </h5>
                    <div className="grid gap-3">
                      {event.advertisingOptions.filter(opt => opt.available).map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg border border-blue-100 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {getAdvertisingTypeLabel(option.type)}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {option.description}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            {option.price ? (
                              <p className="font-semibold text-blue-600">
                                {formatPrice(option.price)}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500">Cena dle dohody</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA for companies */}
                    {!isOwnProfile && currentUserRole === 'company' && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500"
                          onClick={() => onNavigate('create-project', { targetUserId: userId, targetUserName: event.title })}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {t('talent_profile.sections.contact_for_collab')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Form for adding new event
function AddEventForm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'match' as Event['type'],
    startDate: '',
    endDate: '',
    location: '',
    city: '',
    venue: '',
    expectedAttendance: '',
    tvBroadcast: false,
    streamingPlatform: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would save to database
    console.log('New event:', formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title">{t('talent_profile.add_event_form.name_label')}</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={t('talent_profile.add_event_form.name_placeholder')}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">{t('talent_profile.add_event_form.desc_label')}</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('talent_profile.add_event_form.desc_placeholder')}
            rows={3}
            required
          />
        </div>

        <div>
          <Label htmlFor="type">{t('talent_profile.add_event_form.type_label')}</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">{t('talent_profile.events.types.match')}</SelectItem>
              <SelectItem value="tournament">{t('talent_profile.events.types.tournament')}</SelectItem>
              <SelectItem value="concert">{t('talent_profile.events.types.concert')}</SelectItem>
              <SelectItem value="show">{t('talent_profile.events.types.show')}</SelectItem>
              <SelectItem value="conference">{t('talent_profile.events.types.conference')}</SelectItem>
              <SelectItem value="other">{t('talent_profile.events.types.other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="expectedAttendance">{t('talent_profile.add_event_form.attendance_label')}</Label>
          <Input
            id="expectedAttendance"
            type="number"
            value={formData.expectedAttendance}
            onChange={(e) => setFormData({ ...formData, expectedAttendance: e.target.value })}
            placeholder={t('talent_profile.add_event_form.attendance_placeholder')}
          />
        </div>

        <div>
          <Label htmlFor="startDate">{t('talent_profile.add_event_form.start_label')}</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>



        <div>
          <Label htmlFor="endDate">{t('talent_profile.add_event_form.end_label')}</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="city">{t('talent_profile.add_event_form.city_label')}</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder={t('talent_profile.add_event_form.city_placeholder')}
            required
          />
        </div>

        <div>
          <Label htmlFor="venue">{t('talent_profile.add_event_form.venue_label')}</Label>
          <Input
            id="venue"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            placeholder={t('talent_profile.add_event_form.venue_placeholder')}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="location">{t('talent_profile.add_event_form.address_label')}</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder={t('talent_profile.add_event_form.address_placeholder')}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="tvBroadcast"
            checked={formData.tvBroadcast}
            onCheckedChange={(checked) => setFormData({ ...formData, tvBroadcast: checked as boolean })}
          />
          <Label htmlFor="tvBroadcast" className="cursor-pointer">
            {t('talent_profile.add_event_form.tv_label')}
          </Label>
        </div>

        {formData.tvBroadcast && (
          <div>
            <Label htmlFor="streamingPlatform">{t('talent_profile.add_event_form.platform_label')}</Label>
            <Input
              id="streamingPlatform"
              value={formData.streamingPlatform}
              onChange={(e) => setFormData({ ...formData, streamingPlatform: e.target.value })}
              placeholder={t('talent_profile.add_event_form.platform_placeholder')}
            />
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          {t('talent_profile.add_event_form.tip')}
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          {t('talent_profile.add_event_form.cancel')}
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-blue-600 to-orange-500">
          {t('talent_profile.add_event_form.submit')}
        </Button>
      </div>
    </form >
  );
}

function AddPortfolioItemForm({ userId, onSuccess }: { userId: string, onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [type, setType] = useState<any>('image'); // Default to image
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await userApi.getUser(userId);
      const currentPortfolio = user.portfolio || [];

      const newItem = {
        id: Date.now().toString(),
        title,
        description,
        link,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
        type
      };

      await userApi.updateUser(userId, {
        portfolio: [newItem, ...currentPortfolio]
      });

      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Chyba při ukládání');
    } finally {
      setLoading(false);
    }
  };

  // Check if we also need to import api.ts methods. It seems userApi is used, need to ensure storageApi is imported or available via api import.
  // Looking at the file, imports are likely at the top. I'll need to check imports first.
  // Actually, let's just update the function. I'll assume storageApi can be imported from '../utils/api'.

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // Increased limit to 50MB for videos
        toast.error('Soubor je příliš velký (max 50MB)');
        return;
      }

      setLoading(true);
      try {
        const result = await storageApi.uploadAttachment(file);
        setImageUrl(result.url);
        toast.success('Soubor úspěšně nahrán');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Chyba při nahrávání souboru');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Typ položky</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Obrázek / Galerie</SelectItem>
            <SelectItem value="video">Video / Reel</SelectItem>
            <SelectItem value="social">Instagram Post / TikTok</SelectItem>
            <SelectItem value="project">Projekt / Spolupráce</SelectItem>
            <SelectItem value="achievement">Úspěch / Ocenění</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Název</Label>
        <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder={type === 'achievement' ? 'Např. 1. místo ve Forbes 30pod30' : "Např. Kampaň pro Nike"} />
      </div>

      <div className="space-y-2">
        <Label>Popis</Label>
        <Textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailní popis..." />
      </div>

      <div className="space-y-2">
        <Label>Obrázek / Náhled</Label>
        <div className="flex flex-col gap-3">
          {/* Preview if available */}
          {imageUrl && (
            <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => setImageUrl('')}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-24 flex flex-col gap-2 border-dashed border-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Image className="w-6 h-6 text-gray-500" />
              <span className="text-xs">Nahrát soubor</span>
            </Button>

            <div className="h-24 flex flex-col gap-2 p-3 border rounded-lg bg-gray-50 justify-center">
              <span className="text-xs font-semibold mb-1">nebo vložte URL</span>
              <Input
                value={imageUrl.startsWith('data:') ? '' : imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Odkaz na {type === 'social' ? 'post' : 'projekt'}</Label>
        <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-blue-600">
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Přidat do portfolia'}
      </Button>
    </form>
  );
}
