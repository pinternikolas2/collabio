import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Users, Instagram, Linkedin, MessageSquare, Briefcase, Calendar, TrendingUp, MapPin, Tv, Eye, Plus, X, DollarSign, Tag, Loader2, Share2, AlertTriangle, User, CheckCircle, Image, PenLine } from 'lucide-react';
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
// import { mockRatings, mockCollaborations, mockProjects, mockEvents } from '../data/seedData'; 
// Use real data or empty arrays
// Mock data imports removed

import { Event, AdvertisingOptionType, User } from '../types';
import { userApi, storageApi, eventApi } from '../utils/api';

type TalentProfileProps = {
  onNavigate: (page: string, data?: any) => void;
  userId: string;
  isOwnProfile?: boolean;
  currentUserRole?: 'talent' | 'company' | 'admin' | null;
};

import { useAuth } from '../contexts/AuthContext';
// ... (imports)

export default function TalentProfile({ onNavigate, userId, isOwnProfile = false, currentUserRole = null }: TalentProfileProps) {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const [talent, setTalent] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTalent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Optimization: Use auth context for own profile to avoid unnecessary fetch
        // and validity for Test Users (who might not be in Firestore)
        if (isOwnProfile && authUser && authUser.id === userId) {
          console.log('[TalentProfile] Using auth context data');
          setTalent(authUser);
          setLoading(false);
          return;
        }

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
        // ... (error handling)
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
  }, [userId, isOwnProfile, authUser]);

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

  /* REMOVED MOCK DATA */
  /* Real implementation will come from backend, for now showing 0 to reflect empty DB state */
  const talentRatings: any[] = [];
  const avgRating = 0;
  const completedCollabs = 0;
  const totalWarnings = 0;
  /* Total earnings also 0 */


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
        {/* Header - Premium Redesign */}
        <div className="mb-8 relative">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
            {/* Background Pattern instead of Gradient */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            </div>

            <div className="relative p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start z-10">

              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-orange-600 rounded-full opacity-50 blur group-hover:opacity-75 transition duration-500"></div>
                  <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white shadow-xl bg-white relative">
                    <AvatarImage src={talent.profileImage} alt={`${talent.firstName} ${talent.lastName}`} className="object-cover" />
                    <AvatarFallback className="text-4xl font-bold bg-gray-50 text-gray-900">
                      {talent.firstName?.[0]}{talent.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {talent.verified && (
                    <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title={t('talent_profile.verified')}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Quick Social Stats (Mobile Only) */}
                <div className="flex md:hidden gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="font-bold">{formatFollowers(talent.followers)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold">{avgRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center md:text-left min-w-0 w-full">
                <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                      {talent.firstName} {talent.lastName}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 mb-6">
                      {talent.category && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 text-sm border border-blue-100 rounded-full transition-colors">
                          {talent.category}
                        </Badge>
                      )}
                      {talent.title && (
                        <span className="text-lg text-gray-500 font-medium flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                          {talent.title}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto md:mx-0">
                      {talent.bio || t('talent_profile.no_bio')}
                    </p>

                    {/* Social Assets Row */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                      {talent.instagram && (
                        <a href={`https://instagram.com/${talent.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors text-sm font-medium">
                          <Instagram className="w-4 h-4" /> Instagram
                        </a>
                      )}
                      {talent.tiktok && (
                        <a href={`https://tiktok.com/${talent.tiktok.replace('@', '')}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                          <span className="font-bold text-[10px]">Tt</span> TikTok
                        </a>
                      )}
                      {talent.linkedin && (
                        <a href={`https://linkedin.com/in/${talent.linkedin}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                          <Linkedin className="w-4 h-4" /> LinkedIn
                        </a>
                      )}
                      {talent.youtube && (
                        <a href={talent.youtube} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                          <div className="w-4 h-4 bg-red-600 text-white rounded-[4px] flex items-center justify-center text-[6px]">▶</div> YouTube
                        </a>
                      )}
                      {talent.web && (
                        <a href={talent.web} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                          <div className="w-4 h-4 border border-current rounded-full"></div> Web
                        </a>
                      )}
                    </div>

                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                    {!isOwnProfile && currentUserRole === 'company' && (
                      <>
                        <Button className="w-full sm:w-auto bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm" onClick={() => onNavigate('chat', { userId })}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {t('talent_profile.send_message')}
                        </Button>
                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                          onClick={() => onNavigate('create-project', { targetUserId: userId, targetUserName: `${talent.firstName} ${talent.lastName}` })}>
                          <Briefcase className="w-4 h-4 mr-2" />
                          {t('talent_profile.offer_collaboration')}
                        </Button>
                      </>
                    )}
                    {isOwnProfile && (
                      <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
                        <Button variant="outline" onClick={() => onNavigate('talent-analytics')}>
                          <TrendingUp className="w-4 h-4 mr-2" /> {t('talent_profile.analytics')}
                        </Button>
                        <Button variant="outline" onClick={() => onNavigate('settings')}>
                          {t('talent_profile.edit_profile')}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success(t('talent_profile.copy_link'));
                        }}>
                          <Share2 className="w-5 h-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Stats Row (Hidden on mobile as duplicate, shown on Desktop) */}
            <div className="hidden md:grid grid-cols-4 border-t border-gray-100 bg-gray-50/50 divide-x divide-gray-100">
              <div className="p-6 text-center">
                <div className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">{t('talent_profile.stats.followers')}</div>
                <div className="text-3xl font-bold text-gray-900">{formatFollowers(talent.followers)}</div>
              </div>
              <div className="p-6 text-center">
                <div className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">{t('talent_profile.stats.projects')}</div>
                <div className="text-3xl font-bold text-gray-900">{completedCollabs}</div>
              </div>
              <div className="p-6 text-center">
                <div className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">{t('talent_profile.stats.rating')}</div>
                <div className="flex items-center justify-center gap-1 text-3xl font-bold text-gray-900">
                  {avgRating.toFixed(1)} <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">{t('talent_profile.stats.member_since')}</div>
                <div className="text-3xl font-bold text-gray-900">{new Date(talent.createdAt).getFullYear()}</div>
              </div>
            </div>

          </div>
        </div>

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
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  {t('talent_profile.sections.skills')}
                </h3>
                {isOwnProfile && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600">
                        <PenLine className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upravit dovednosti</DialogTitle>
                      </DialogHeader>
                      <EditSkillsForm userId={userId} currentSkills={talent.skills || []} onSuccess={() => window.location.reload()} />
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {talent.skills && talent.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {talent.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">Zatím žádné uvedené dovednosti. {isOwnProfile && "Přidejte je v editaci!"}</p>
                )}
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
                      {/* Real collaborations will be fetched here. For now empty. */}
                      {[]
                        .map((collab: any) => {
                          return null;
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


// ... (Previous components remain the same until UpcomingEventsSection)

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
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const userEvents = await eventApi.getUserEvents(userId);
      const publicEvents = userEvents.filter(e => isOwnProfile || e.public);
      const upcoming = publicEvents
        .filter(e => new Date(e.startDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      setEvents(upcoming);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [userId, isOwnProfile]);

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
    <Card className="border-none shadow-md">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              {t('talent_profile.sections.upcoming_events')}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isOwnProfile
                ? "Správa vašich nadcházejících událostí"
                : "Kam můžete přijít podpořit nebo navázat spolupráci"}
            </p>
          </div>
          {isOwnProfile && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-orange-500 shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('talent_profile.sections.add_event_btn')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('talent_profile.add_event_form.title')}</DialogTitle>
                </DialogHeader>
                <AddEventForm
                  userId={userId}
                  onClose={() => setIsDialogOpen(false)}
                  onSuccess={() => {
                    toast.success("Událost byla úspěšně vytvořena!");
                    fetchEvents();
                    setIsDialogOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-1">{t('talent_profile.sections.no_events')}</p>
            {isOwnProfile && (
              <p className="text-sm text-gray-400">
                Přidejte svou první událost a dejte o sobě vědět.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="border border-gray-100 bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 group">
                {/* Event Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">
                        {getEventTypeLabel(event.type)}
                      </Badge>
                      {event.tvBroadcast && (
                        <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                          <Tv className="w-3 h-3 mr-1" />
                          TV Přenos
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{event.title}</h4>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">{event.description}</p>
                  </div>
                  {isOwnProfile && (
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500"
                      onClick={async () => {
                        if (confirm("Opravdu smazat tuto událost?")) {
                          await eventApi.deleteEvent(event.id);
                          toast.success("Smazáno");
                          fetchEvents();
                        }
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{formatEventDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">{event.venue || event.location} {event.city ? `, ${event.city}` : ''}</span>
                  </div>
                  {event.expectedAttendance && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Users className="w-4 h-4 text-green-500" />
                      <span>Očekáváno: <span className="font-bold">{parseInt(event.expectedAttendance as any).toLocaleString('cs-CZ')}</span> lidí</span>
                    </div>
                  )}
                  {event.streamingPlatform && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Tv className="w-4 h-4 text-purple-500" />
                      <span>Stream: <span className="font-medium">{event.streamingPlatform}</span></span>
                    </div>
                  )}
                </div>

                {/* Advertising Options */}
                {event.advertisingOptions && event.advertisingOptions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <Tag className="w-4 h-4 text-blue-600" />
                      Možnosti propagace
                    </h5>
                    <div className="grid gap-3">
                      {event.advertisingOptions.filter(opt => opt.available).map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900">
                              {getAdvertisingTypeLabel(option.type)}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {option.description}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            {option.price ? (
                              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 font-bold">
                                {formatPrice(option.price)}
                              </Badge>
                            ) : (
                              <span className="text-xs font-medium text-gray-500 italic">Dohodou</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA for companies */}
                    {!isOwnProfile && currentUserRole === 'company' && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20"
                          onClick={() => onNavigate('create-project', { targetUserId: userId, targetUserName: event.title })}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Mám zájem o propagaci
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
function AddEventForm({ userId, onClose, onSuccess }: { userId: string, onClose: () => void, onSuccess: () => void }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
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
    price_banner: '', // Simple price inputs for now
    price_clothing: '',
    price_social: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const adOptions: any[] = [];
      if (formData.price_banner) adOptions.push({ id: Date.now().toString() + '1', type: 'banner', price: parseInt(formData.price_banner), available: true, description: 'Umístění loga/banneru na místě' });
      if (formData.price_clothing) adOptions.push({ id: Date.now().toString() + '2', type: 'clothing', price: parseInt(formData.price_clothing), available: true, description: 'Logo na dresu/oblečení' });
      if (formData.price_social) adOptions.push({ id: Date.now().toString() + '3', type: 'social_post', price: parseInt(formData.price_social), available: true, description: 'Promo post na soc. sítích' });

      await eventApi.createEvent({
        ...formData,
        userId,
        expectedAttendance: formData.expectedAttendance ? parseInt(formData.expectedAttendance) : 0,
        public: true,
        advertisingOptions: adOptions
      } as any);
      onSuccess();
    } catch (e) {
      console.error(e);
      toast.error("Chyba při ukládání");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title">{t('talent_profile.add_event_form.name_label')}</Label>
          <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">{t('talent_profile.add_event_form.desc_label')}</Label>
          <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} required />
        </div>

        <div>
          <Label htmlFor="type">{t('talent_profile.add_event_form.type_label')}</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Zápas / Utkání</SelectItem>
              <SelectItem value="tournament">Turnaj</SelectItem>
              <SelectItem value="concert">Koncert / Vystoupení</SelectItem>
              <SelectItem value="show">Show</SelectItem>
              <SelectItem value="conference">Konference</SelectItem>
              <SelectItem value="other">Jiné</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="expectedAttendance">{t('talent_profile.add_event_form.attendance_label')}</Label>
          <Input id="expectedAttendance" type="number" value={formData.expectedAttendance} onChange={(e) => setFormData({ ...formData, expectedAttendance: e.target.value })} />
        </div>

        <div>
          <Label>Začátek</Label>
          <Input type="datetime-local" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required />
        </div>
        <div>
          <Label>Konec (volitelné)</Label>
          <Input type="datetime-local" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
        </div>

        <div>
          <Label htmlFor="city">Město</Label>
          <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="venue">Místo konání (Hala, Stadion...)</Label>
          <Input id="venue" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} />
        </div>

        <div className="flex items-center space-x-2 md:col-span-2">
          <Checkbox id="tvBroadcast" checked={formData.tvBroadcast} onCheckedChange={(c) => setFormData({ ...formData, tvBroadcast: c as boolean })} />
          <Label htmlFor="tvBroadcast">Bude přenášeno v TV/Online?</Label>
        </div>

        {formData.tvBroadcast && (
          <div className="md:col-span-2">
            <Label>Platforma / TV Kanál</Label>
            <Input value={formData.streamingPlatform} onChange={e => setFormData({ ...formData, streamingPlatform: e.target.value })} placeholder="Např. O2 TV, YouTube, Twitch" />
          </div>
        )}
      </div>

      {/* Simple Ad Pricing */}
      <div className="space-y-3 pt-4 border-t">
        <Label className="font-bold">Orientační ceny reklamy (Nepovinné)</Label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs">Banner/Plachta</Label>
            <Input type="number" placeholder="Kč" value={formData.price_banner} onChange={e => setFormData({ ...formData, price_banner: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Logo na oblečení</Label>
            <Input type="number" placeholder="Kč" value={formData.price_clothing} onChange={e => setFormData({ ...formData, price_clothing: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Social Post</Label>
            <Input type="number" placeholder="Kč" value={formData.price_social} onChange={e => setFormData({ ...formData, price_social: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Zrušit</Button>
        <Button type="submit" className="bg-gradient-to-r from-blue-600 to-orange-500" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : "Vytvořit událost"}
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
    } catch (error: any) {
      console.error(error);
      toast.error(t('talent_profile.portfolio_form.save_error') + ": " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const result = await storageApi.uploadAttachment(file);
        setImageUrl(result.url);
        toast.success(t('talent_profile.portfolio_form.upload_success'));
      } catch (error) {
        console.error('Upload error:', error);
        toast.error("Upload failed. Make sure you are logged in.");
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
            <SelectItem value="image">Obrázek / Fotka</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="social">Sociální sítě</SelectItem>
            <SelectItem value="project">Projekt</SelectItem>
            <SelectItem value="achievement">Úspěch / Ocenění</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Název</Label>
        <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Např. Mistrovství ČR 2024" />
      </div>

      <div className="space-y-2">
        <Label>Popis</Label>
        <Textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Krátký popis..." />
      </div>

      <div className="space-y-2">
        <Label>Obrázek (URL nebo Upload)</Label>
        <div className="flex flex-col gap-3">
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
              <Plus className="w-6 h-6 text-gray-500" />
              <span className="text-xs">Nahrát</span>
            </Button>

            <div className="h-24 flex flex-col gap-2 p-3 border rounded-lg bg-gray-50 justify-center">
              <span className="text-xs font-semibold mb-1">Nebo vložte URL</span>
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
        <Label>Odkaz (volitelné)</Label>
        <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-blue-600">
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Přidat do portfolia"}
      </Button>
    </form>
  );
}
