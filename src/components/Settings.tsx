
import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Lock, Bell, Shield, CreditCard, Trash2, Check, Camera, Instagram, Linkedin, Youtube, Facebook, Clock, AlertTriangle, Loader2, Globe, Moon, Sun, Monitor, Briefcase, Plus, X, Image, Video, Trophy, LayoutGrid, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { Card, CardContent, CardHeader, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { userApi, storageApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { validatePhone } from '../utils/validation';
import type { User as UserType } from '../types';

type SettingsProps = {
  onNavigate: (page: string) => void;
  userId: string;
};

export default function Settings({ onNavigate, userId }: SettingsProps) {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');

  // Social media
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [youtube, setYoutube] = useState('');
  const [facebook, setFacebook] = useState('');

  // Load user data
  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await userApi.getUser(userId);
      setCurrentUser(userData);

      // Set form values
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setEmail(userData.email || '');
      setPhone(userData.phone || '');
      setBio(userData.bio || '');
      setCategory(userData.category || '');
      setTitle(userData.title || '');
      setAddress(userData.address || '');
      setInstagram(userData.instagram || '');
      setLinkedin(userData.linkedin || '');
      setTiktok(userData.tiktok || '');
      setYoutube(userData.youtube || '');
      setFacebook(userData.facebook || '');
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error('Nepodařilo se načíst data uživatele');
    } finally {
      setLoading(false);
    }
  };

  // Notifications settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [projectNotifications, setProjectNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public');

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    if (phone && !validatePhone(phone)) {
      toast.error(t('settings.errors.phone_invalid'));
      return;
    }

    try {
      setSaving(true);
      await userApi.updateUser(userId, {
        firstName,
        lastName,
        phone,
        bio,
        category,
        title,
        address,
        instagram,
        linkedin,
        tiktok,
        youtube,
        facebook,
      });

      // Refresh user in context
      await refreshUser();

      toast.success(t('settings.profile.success'), {
        description: t('settings.profile.success_desc'),
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(t('settings.profile.error'), {
        description: error instanceof Error ? error.message : 'Zkuste to znovu později'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = () => {
    toast.success(t('settings.notifications.success'));
  };

  const handleSavePrivacy = () => {
    toast.success(t('settings.privacy.success'));
  };

  const handleChangePassword = () => {
    toast.info(t('settings.security.password_info'), {
      description: t('settings.security.password_info_desc'),
    });
  };

  const handleDeleteAccount = () => {
    toast.error(t('settings.security.delete_toast'), {
      description: t('settings.security.delete_toast_desc'),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">{t('settings.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center py-20">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">{t('settings.user_not_found')}</h2>
            <Button onClick={() => onNavigate('landing')} className="mt-4">
              {t('settings.back_home')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const categories = currentUser.role === 'talent'
    ? ['Sportovec', 'Umělec', 'Influencer'] // Updated categories as requested
    : ['Sport & Outdoor', 'Technologie', 'Beauty & Lifestyle', 'Fashion', 'Food & Beverage', 'Automotive', 'Finance'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => onNavigate('my-profile')}
              className="mb-4"
            >
              ← {t('settings.back_profile')}
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
              {t('settings.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('settings.subtitle')}
            </p>
          </div>
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
        </div>


        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              {t('settings.tabs.profile')}
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              {t('settings.tabs.notifications')}
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="w-4 h-4 mr-2" />
              {t('settings.tabs.privacy')}
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="w-4 h-4 mr-2" />
              {t('settings.tabs.security')}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Profile Picture */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">{t('settings.profile.photo_title')}</h3>
                  <CardDescription>
                    {t('settings.profile.photo_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={currentUser.profileImage} />
                      <AvatarFallback className="text-2xl">
                        {currentUser.firstName[0]}{currentUser.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:text-white"
                          disabled={saving}
                          onClick={() => document.getElementById('photo-upload')?.click()}
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                          {t('settings.profile.upload_photo')}
                        </Button>
                        <input
                          id="photo-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error(t('settings.errors.image_too_large'));
                              return;
                            }

                            try {
                              setSaving(true);
                              const result = await storageApi.uploadAvatar(file);
                              await userApi.updateUser(userId, { profileImage: result.url });
                              await loadUserData(); // Reload to show new image
                              await refreshUser(); // Update context
                              toast.success(t('settings.messages.photo_updated'));
                            } catch (error) {
                              console.error('Upload error:', error);
                              toast.error(t('settings.errors.photo_upload_error'));
                            } finally {
                              setSaving(false);
                            }
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {t('settings.profile.photo_constraints')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">{t('settings.profile.basic_info')}</h3>
                  <CardDescription>
                    {t('settings.profile.basic_info_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('settings.profile.first_name')}</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('settings.profile.last_name')}</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('settings.profile.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {currentUser.verified && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="w-4 h-4" />
                        <span>{t('settings.profile.email_verified')}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('settings.profile.phone')}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                        placeholder={t('settings.profile.phone_placeholder')}
                      />
                    </div>
                  </div>

                  {currentUser.role === 'company' && (
                    <div className="space-y-2">
                      <Label htmlFor="address">{t('settings.profile.address')}</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="pl-10"
                          placeholder={t('settings.profile.address_placeholder')}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="category">{t('settings.profile.category')}</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">{t('settings.profile.job_title')}</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('settings.profile.job_title_placeholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">{currentUser.role === 'talent' ? t('settings.profile.bio_talent') : t('settings.profile.bio_company')}</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      placeholder={currentUser.role === 'talent' ? t('settings.profile.bio_placeholder_talent') : t('settings.profile.bio_placeholder_company')}
                    />
                    <p className="text-sm text-gray-500">{t('settings.profile.bio_limit', { count: bio.length })}</p>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                  >
                    {t('settings.profile.save')}
                  </Button>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">{t('settings.social.title')}</h3>
                  <CardDescription>
                    {t('settings.social.desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-3 h-4 w-4 text-pink-600" />
                      <Input
                        id="instagram"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="pl-10"
                        placeholder={t('settings.social.instagram_placeholder')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-3 h-4 w-4 text-blue-700" />
                      <Input
                        id="linkedin"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="pl-10"
                        placeholder="vase-jmeno"
                      />
                    </div>
                  </div>

                  {currentUser.role === 'talent' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="tiktok">TikTok</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-sm">🎵</span>
                          <Input
                            id="tiktok"
                            value={tiktok}
                            onChange={(e) => setTiktok(e.target.value)}
                            className="pl-10"
                            placeholder={t('settings.social.instagram_placeholder')}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="youtube">YouTube</Label>
                        <div className="relative">
                          <Youtube className="absolute left-3 top-3 h-4 w-4 text-red-600" />
                          <Input
                            id="youtube"
                            value={youtube}
                            onChange={(e) => setYoutube(e.target.value)}
                            className="pl-10"
                            placeholder="@kanal"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook</Label>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                          <Input
                            id="facebook"
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            className="pl-10"
                            placeholder="vase.jmeno"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('settings.social.saving')}
                      </>
                    ) : (
                      t('settings.social.save')
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">{t('settings.notifications.title')}</h3>
                <CardDescription>
                  {t('settings.notifications.desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notifications.email')}</Label>
                    <p className="text-sm text-gray-500">
                      {t('settings.notifications.email_desc')}
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notifications.push')}</Label>
                    <p className="text-sm text-gray-500">
                      {t('settings.notifications.push_desc')}
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notifications.messages')}</Label>
                    <p className="text-sm text-gray-500">
                      {t('settings.notifications.messages_desc')}
                    </p>
                  </div>
                  <Switch
                    checked={messageNotifications}
                    onCheckedChange={setMessageNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notifications.projects')}</Label>
                    <p className="text-sm text-gray-500">
                      {t('settings.notifications.projects_desc')}
                    </p>
                  </div>
                  <Switch
                    checked={projectNotifications}
                    onCheckedChange={setProjectNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notifications.marketing')}</Label>
                    <p className="text-sm text-gray-500">
                      {t('settings.notifications.marketing_desc')}
                    </p>
                  </div>
                  <Switch
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                  />
                </div>

                <Button
                  onClick={handleSaveNotifications}
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                >
                  {t('settings.notifications.save')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>



          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">{t('settings.privacy.title')}</h3>
                <CardDescription>
                  {t('settings.privacy.desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t('settings.privacy.visibility')}</Label>
                  <Select value={profileVisibility} onValueChange={(v: any) => setProfileVisibility(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{t('settings.privacy.public')}</SelectItem>
                      <SelectItem value="private">{t('settings.privacy.private')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>🔒 {t('settings.privacy.note')}:</strong> {t('settings.privacy.note_text')}
                  </p>
                </div>

                <Button
                  onClick={handleSavePrivacy}
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                >
                  {t('settings.privacy.save')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              {/* KYC Verification */}
              <Card className={currentUser.verificationStatus === 'verified' ? 'border-green-200' : 'border-yellow-200'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        {t('settings.security.kyc_title')}
                      </h3>
                      <CardDescription>
                        {currentUser.role === 'talent'
                          ? t('settings.security.kyc_desc_talent')
                          : t('settings.security.kyc_desc_company')}
                      </CardDescription>
                    </div>
                    {currentUser.verificationStatus === 'verified' ? (
                      <Badge className="bg-green-100 text-green-700">
                        <Check className="w-3 h-3 mr-1" />
                        {t('settings.security.verified')}
                      </Badge>
                    ) : currentUser.verificationStatus === 'pending' ? (
                      <Badge className="bg-yellow-100 text-yellow-700">
                        <Clock className="w-3 h-3 mr-1" />
                        {t('settings.security.pending')}
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {t('settings.security.unverified')}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentUser.verificationStatus !== 'verified' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 mb-2">
                      <p className="text-xs text-yellow-800 leading-tight">
                        <strong>⚠️ {t('settings.security.mandatory_verification')}:</strong> {t('settings.security.mandatory_text')} {currentUser.role === 'talent' ? t('settings.security.kyc_desc_talent_short', { defaultValue: 'občanského průkazu' }) : t('settings.security.kyc_desc_company_short', { defaultValue: 'výpisu z obchodního rejstříku nebo živnostenského listu' })}.
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={() => onNavigate('kyc-verification')}
                    className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {currentUser.verificationStatus === 'verified'
                      ? t('settings.security.view_btn')
                      : t('settings.security.verify_btn')}
                  </Button>
                  {currentUser.verificationStatus === 'verified' && (
                    <p className="text-sm text-green-600 text-center">
                      ✓ {t('settings.security.verified_text')}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Password */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">{t('settings.security.password_title')}</h3>
                  <CardDescription>
                    {t('settings.security.password_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleChangePassword}
                    variant="outline"
                    className="w-full"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {t('settings.security.change_password')}
                  </Button>
                  <p className="text-sm text-gray-500">
                    {t('settings.security.password_note')}
                  </p>
                </CardContent>
              </Card>

              {/* Two-Factor Auth */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">{t('settings.security.two_factor_title')}</h3>
                  <CardDescription>
                    {t('settings.security.two_factor_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t('settings.security.two_factor_inactive')}</p>
                      <p className="text-sm text-gray-500">
                        {t('settings.security.two_factor_desc')}
                      </p>
                    </div>
                    <Button variant="outline">
                      {t('settings.security.two_factor_activate')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">{t('settings.security.payment_title')}</h3>
                  <CardDescription>
                    {t('settings.security.payment_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Stripe Connect</p>
                        <p className="text-sm text-gray-500">
                          {currentUser.stripeId ? t('settings.security.stripe_connected') : t('settings.security.stripe_disconnected')}
                        </p>
                      </div>
                    </div>
                    {currentUser.stripeId ? (
                      <Badge className="bg-green-100 text-green-800">{t('settings.security.verified')}</Badge>
                    ) : (
                      <Button variant="outline">{t('settings.security.stripe_connect')}</Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Delete Account */}
              <Card className="border-red-200">
                <CardHeader>
                  <h3 className="text-xl font-semibold text-red-600">{t('settings.security.danger_zone')}</h3>
                  <CardDescription>
                    {t('settings.security.danger_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">
                        <strong>⚠️ {t('settings.security.delete_warning')}:</strong> {t('settings.security.delete_text')}
                      </p>
                    </div>
                    <Button
                      onClick={handleDeleteAccount}
                      variant="destructive"
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('settings.security.delete_account')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs >
      </div >
    </div >
  );
}


