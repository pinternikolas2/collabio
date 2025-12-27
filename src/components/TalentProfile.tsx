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
        const errorMessage = err?.message || t('common.unknown_error');

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 md:py-12 overflow-x-hidden w-full">
      <div className="container mx-auto px-4 max-w-6xl w-full overflow-x-hidden">
        {/* Header Card */}
        <Card className="mb-8 max-w-full overflow-hidden border-none shadow-xl bg-white/80 backdrop-blur-md">
          {/* Cover - Full Gradient */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 via-purple-500 to-orange-500 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <CardContent className="relative pb-8 overflow-x-hidden max-w-full -mt-20 md:-mt-24 px-6 md:px-10">
            {/* Profile Image & Info */}
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-orange-600 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <Avatar className="w-32 h-32 md:w-48 md:h-48 border-4 border-white shadow-2xl bg-white relative">
                  <AvatarImage src={talent.profileImage} alt={`${talent.firstName} ${talent.lastName}`} className="object-cover" />
                  <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-blue-100 to-orange-100 text-blue-900">{talent.firstName[0]}{talent.lastName[0]}</AvatarFallback>
                </Avatar>
                {talent.verified && (
                  <div className="absolute bottom-2 right-2 bg-blue-600 text-white p-1.5 rounded-full border-4 border-white shadow-lg" title={t('talent_profile.verified')}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 md:mb-6 min-w-0 max-w-full overflow-x-hidden">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 max-w-full">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h1 className="text-3xl md:text-5xl font-bold break-words bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        {talent.firstName} {talent.lastName}
                      </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      {talent.category && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 text-sm border border-blue-200">
                          {talent.category}
                        </Badge>
                      )}
                      {talent.title && (
                        <span className="text-lg text-gray-600 font-medium border-l-2 border-gray-300 pl-3">
                          {talent.title}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">{talent.bio}</p>
                  </div>

                  <div className="flex flex-wrap gap-3 max-w-full mt-4 md:mt-0">
                    {!isOwnProfile && currentUserRole === 'company' && (
                      <>
                        <Button
                          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                          onClick={() => onNavigate('chat', { userId })}
                          size="lg"
                        >
                          <MessageSquare className="w-5 h-5 mr-2" />
                          <span className="hidden sm:inline">{t('talent_profile.send_message')}</span>
                          <span className="sm:hidden">{t('talent_profile.message_short')}</span>
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 border-none"
                          onClick={() => onNavigate('create-project', {
                            targetUserId: userId,
                            targetUserName: `${talent.firstName} ${talent.lastName}`
                          })}
                          size="lg"
                        >
                          <Briefcase className="w-5 h-5 mr-2" />
                          <span className="hidden sm:inline">{t('talent_profile.offer_collaboration')}</span>
                          <span className="sm:hidden">{t('talent_profile.collaboration_short')}</span>
                        </Button>
                      </>
                    )}
                    {!isOwnProfile && currentUserRole === 'talent' && (
                      <div className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-500 italic">
                        {t('talent_profile.cant_contact_talent')}
                      </div>
                    )}
                    {isOwnProfile && (
                      <>
                        <Button
                          onClick={() => onNavigate('talent-analytics')}
                          className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                          size="lg"
                        >
                          <TrendingUp className="w-5 h-5 mr-2" />
                          {t('talent_profile.analytics')}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onNavigate('settings')}
                          className="border-gray-200 hover:bg-gray-50"
                          size="lg"
                        >
                          {t('talent_profile.edit_profile')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-blue-50 text-blue-600 rounded-full w-12 h-12"
                          onClick={() => {
                            navigator.share ? navigator.share({
                              title: `${talent.firstName} ${talent.lastName} - Collabio`,
                              url: window.location.href
                            }).catch(() => { }) : (navigator.clipboard.writeText(window.location.href), toast.success(t('talent_profile.copy_link')));
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
                        className="hover:bg-blue-50 text-blue-600 rounded-full w-12 h-12"
                        onClick={() => {
                          navigator.share ? navigator.share({
                            title: `${talent.firstName} ${talent.lastName} - Collabio`,
                            url: window.location.href
                          }).catch(() => { }) : (navigator.clipboard.writeText(window.location.href), toast.success(t('talent_profile.copy_link')));
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
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">{t('talent_profile.stats.followers')}</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{formatFollowers(talent.followers)}</p>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">{t('talent_profile.stats.projects')}</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{completedCollabs}</p>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                    <Star className="w-5 h-5" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">{t('talent_profile.stats.rating')}</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">{t('talent_profile.stats.member_since')}</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {new Date(talent.createdAt).getFullYear()}
                </p>
              </div>

              {/* Celkové příjmy - pouze pro vlastníka profilu */}
              {isOwnProfile && (
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 md:p-6 rounded-2xl shadow-lg text-white col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs md:text-sm font-medium opacity-90">{t('talent_profile.stats.total_earnings')}</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{formatPrice(totalEarnings)}</p>
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
                  {t('talent_profile.sections.social_media')}
                </h3>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {talent.instagram && (
                  <a
                    href={`https://instagram.com/${talent.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-transparent border border-pink-100/50 hover:border-pink-200 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-pink-600">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">Instagram</p>
                      <p className="text-xs text-gray-500">{talent.instagram}</p>
                    </div>
                    <Badge variant="secondary" className="bg-white/50">{formatFollowers(talent.followers)}</Badge>
                  </a>
                )}
                {talent.tiktok && (
                  <a
                    href={`https://tiktok.com/${talent.tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-gray-100 to-transparent border border-gray-200/50 hover:border-gray-300 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-white">
                      <span className="font-bold text-xs">Tt</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">TikTok</p>
                      <p className="text-xs text-gray-500">{talent.tiktok}</p>
                    </div>
                  </a>
                )}
                {talent.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${talent.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-transparent border border-blue-100/50 hover:border-blue-200 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-blue-700">
                      <Linkedin className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">LinkedIn</p>
                      <p className="text-xs text-gray-500">{talent.linkedin}</p>
                    </div>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Skills/Categories */}
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  {t('talent_profile.sections.skills')}
                </h3>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Content Creation</span>
                      <span className="text-sm font-bold text-blue-600">95%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 w-[95%] rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Social Media Marketing</span>
                      <span className="text-sm font-bold text-orange-600">90%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 w-[90%] rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Brand Collaboration</span>
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
            {/* Upcoming Events Section */}
            <UpcomingEventsSection
              userId={userId}
              isOwnProfile={isOwnProfile}
              currentUserRole={currentUserRole}
              onNavigate={onNavigate}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <Tabs defaultValue="portfolio" className="w-full">
                <div className="border-b border-gray-100 px-6 pt-6">
                  <TabsList className="w-full justify-start h-auto p-1 bg-gray-50/50 rounded-xl gap-1 mb-6 inline-flex">
                    <TabsTrigger
                      value="portfolio"
                      className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium transition-all"
                    >
                      {t('talent_profile.tabs.portfolio')}
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-sm font-medium transition-all"
                    >
                      {t('talent_profile.tabs.reviews')}
                      <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800 border-none">{talentRatings.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="collaborations"
                      className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm font-medium transition-all"
                    >
                      {t('talent_profile.tabs.projects')}
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-none">{completedCollabs}</Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Portfolio Tab */}
                <TabsContent value="portfolio" className="p-0 m-0">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{t('talent_profile.tabs.portfolio')}</h3>
                        <p className="text-sm text-gray-500">{t('talent_profile.portfolio.work_samples')}</p>
                      </div>
                      {isOwnProfile && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-orange-500">
                              <Plus className="w-4 h-4 mr-2" />
                              {t('talent_profile.portfolio.add_sample')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('talent_profile.portfolio.add_item')}</DialogTitle>
                            </DialogHeader>
                            <AddPortfolioItemForm
                              userId={userId}
                              onSuccess={() => {
                                toast.success(t('talent_profile.portfolio.item_added'));
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
                              {type === 'all' && t('talent_profile.portfolio.all')}
                              {type === 'image' && t('talent_profile.portfolio.gallery')}
                              {type === 'video' && t('talent_profile.portfolio.videos')}
                              {type === 'social' && t('talent_profile.portfolio.social_posts')}
                              {type === 'project' && t('talent_profile.portfolio.projects')}
                              {type === 'achievement' && t('talent_profile.portfolio.achievements')}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {['all', 'image', 'video', 'social', 'project', 'achievement'].map(filterType => (
                          <TabsContent key={filterType} value={filterType} className="mt-0">
                            {(!talent.portfolio || talent.portfolio.filter(i => filterType === 'all' || i.type === filterType).length === 0) ? (
                              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">{t('talent_profile.portfolio.empty')}</p>
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
                                            {item.type === 'image' && t('talent_profile.portfolio.image')}
                                            {item.type === 'video' && t('talent_profile.portfolio.video')}
                                            {item.type === 'social' && t('talent_profile.portfolio.social')}
                                            {item.type === 'project' && t('talent_profile.portfolio.project')}
                                            {item.type === 'achievement' && t('talent_profile.portfolio.achievement')}
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
                                            {t('talent_profile.portfolio.view')} <TrendingUp className="w-3 h-3 ml-1" />
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
                                            if (confirm(t('talent_profile.portfolio.delete_confirm'))) {
                                              try {
                                                const updatedPortfolio = talent.portfolio?.filter(p => p.id !== item.id) || [];
                                                await userApi.updateUser(userId, { portfolio: updatedPortfolio });
                                                window.location.reload();
                                              } catch (e) { toast.error(t('talent_profile.portfolio.delete_error')); }
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
                  {t('talent_profile.sections.add_event_btn')}
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
                      {t('talent_profile.events.advertising_options')}
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
                              <p className="text-sm text-gray-500">{t('talent_profile.events.price_negotiable')}</p>
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
  const { t } = useTranslation();
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
      toast.error(t('talent_profile.portfolio_form.save_error'));
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
        toast.error(t('talent_profile.portfolio_form.file_size_error'));
        return;
      }

      setLoading(true);
      try {
        const result = await storageApi.uploadAttachment(file);
        setImageUrl(result.url);
        toast.success(t('talent_profile.portfolio_form.upload_success'));
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(t('talent_profile.portfolio_form.upload_error'));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>{t('talent_profile.portfolio_form.type_label')}</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">{t('talent_profile.portfolio_form.types.image')}</SelectItem>
            <SelectItem value="video">{t('talent_profile.portfolio_form.types.video')}</SelectItem>
            <SelectItem value="social">{t('talent_profile.portfolio_form.types.social')}</SelectItem>
            <SelectItem value="project">{t('talent_profile.portfolio_form.types.project')}</SelectItem>
            <SelectItem value="achievement">{t('talent_profile.portfolio_form.types.achievement')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('talent_profile.portfolio_form.title_label')}</Label>
        <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder={type === 'achievement' ? t('talent_profile.portfolio_form.title_placeholder_achievement') : t('talent_profile.portfolio_form.title_placeholder')} />
      </div>

      <div className="space-y-2">
        <Label>{t('talent_profile.portfolio_form.desc_label')}</Label>
        <Textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder={t('talent_profile.portfolio_form.desc_placeholder')} />
      </div>

      <div className="space-y-2">
        <Label>{t('talent_profile.portfolio_form.image_label')}</Label>
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
              <span className="text-xs">{t('talent_profile.portfolio_form.upload_btn')}</span>
            </Button>

            <div className="h-24 flex flex-col gap-2 p-3 border rounded-lg bg-gray-50 justify-center">
              <span className="text-xs font-semibold mb-1">{t('talent_profile.portfolio_form.url_label')}</span>
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
        <Label>{t('talent_profile.portfolio_form.link_label', { type: type === 'social' ? 'post' : 'projekt' })}</Label>
        <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-blue-600">
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : t('talent_profile.portfolio_form.submit_btn')}
      </Button>
    </form>
  );
}
