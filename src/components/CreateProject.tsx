import { useState } from 'react';
import { Briefcase, DollarSign, Calendar, Users, FileText, Image, X, Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { UserRole } from '../types';
import { projectApi } from '../utils/api';

type CreateProjectProps = {
  onNavigate: (page: string) => void;
  userId: string;
  userRole: UserRole;
  targetUserId?: string;
  targetUserName?: string;
};

export default function CreateProject({ onNavigate, userId, userRole, targetUserId, targetUserName }: CreateProjectProps) {
  const { t } = useTranslation();
  // Determine if this is a talent offering services or a company seeking talent
  const isTalentOffer = userRole === 'talent';

  // Determine if this is a direct offer to a specific user or a public marketplace project
  const isDirectOffer = !!targetUserId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [requirements, setRequirements] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [talentType, setTalentType] = useState('');
  const [followersMin, setFollowersMin] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Sport',
    'Umění',
    'Technologie',
    'Fashion',
    'Beauty & Lifestyle',
    'Fitness',
    'Hudba',
    'Gaming',
    'Cestování',
    'Jídlo & Gastronomie',
  ];

  const talentTypes = [
    'Sportovec',
    'Umělec',
    'Influencer',
    'Content Creator',
    'Fotograf',
    'Videograf',
    'Model/ka',
    'DJ/Hudebník',
  ];

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category || !budget) {
      toast.error(t('project.form.fill_required'));
      return;
    }

    setSubmitting(true);

    try {
      // Prepare project data
      const projectData = {
        title,
        description,
        category,
        price: parseFloat(budget),
        currency: 'CZK',
        vat: 21,
        duration: duration || '',
        requirements: requirements || '',
        deliverables: deliverables || '',
        talentType: talentType || '',
        followersMin: followersMin ? parseInt(followersMin) : 0,
        tags: skills,
        images: [],
        available: true,
        targetUserId: targetUserId || null,
        targetUserName: targetUserName || null,
        published: !isDirectOffer, // Direct offers are private, marketplace posts are public
      };

      // Create project via API
      const createdProject = await projectApi.createProject(projectData);

      // Success message
      if (isDirectOffer) {
        toast.success(t('project.create.direct_offer_sent'), {
          description: t('project.create.direct_offer_sent_desc', { name: targetUserName }),
        });
      } else {
        toast.success(isTalentOffer ? t('project.create.success_offer') : t('project.create.success_project'), {
          description: isTalentOffer
            ? t('project.create.success_offer_desc')
            : t('project.create.success_project_desc'),
        });
      }

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setBudget('');
      setDuration('');
      setRequirements('');
      setDeliverables('');
      setTalentType('');
      setFollowersMin('');
      setSkills([]);

      // Navigate to marketplace or project detail
      setTimeout(() => {
        if (isDirectOffer) {
          onNavigate('marketplace');
        } else {
          onNavigate('project-detail', { projectId: createdProject.id });
        }
      }, 1500);

    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(t('project.form.create_error'), {
        description: error instanceof Error ? error.message : t('project.form.try_again'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('marketplace')}
            className="mb-4"
          >
            {t('project.create.back_to_marketplace')}
          </Button>
          <div className="flex items-center gap-3 mb-2">
            {isTalentOffer && <Sparkles className="w-8 h-8 text-orange-500" />}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
              {isDirectOffer
                ? t('project.create.direct_offer_title')
                : (isTalentOffer ? t('project.create.offer_title') : t('project.create.title'))}
            </h1>
          </div>
          {isDirectOffer && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <p className="text-blue-900">
                {t('project.create.direct_offer_for')} <strong>{targetUserName}</strong>
              </p>
            </div>
          )}
          <p className="text-gray-600 mt-2">
            {isDirectOffer
              ? t('project.create.direct_offer_subtitle')
              : (isTalentOffer
                ? t('project.create.offer_subtitle')
                : t('project.create.project_subtitle'))}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">{t('project.form.basic_info')}</h3>
              <CardDescription>
                {isTalentOffer
                  ? t('project.form.basic_info_desc_offer')
                  : t('project.form.basic_info_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  {isTalentOffer ? t('project.create.offer_name') : t('project.create.project_name')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isTalentOffer
                    ? "Např. Profesionální influencer marketing - Instagram & TikTok"
                    : "Např. Brand ambasador pro sportovní značku"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  {isTalentOffer ? t('project.create.role_offer') : t('project.create.role_project')} <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder={isTalentOffer ? t('project.create.role_select_offer') : t('project.create.role_select_project')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(isTalentOffer
                      ? ['Sportovec', 'Umělec', 'Influencer', 'Jiné']
                      : categories
                    ).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isTalentOffer && (
                <div className="space-y-2">
                  <Label htmlFor="talentTypeSpec">
                    {t('project.create.talent_type_spec')}
                  </Label>
                  <Input
                    id="talentTypeSpec"
                    value={talentType}
                    onChange={(e) => setTalentType(e.target.value)}
                    placeholder="Např. MMA Zápasník, Rapper, K1, Malíř..."
                  />
                  <p className="text-xs text-gray-500">
                    {t('project.create.talent_type_help')}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">
                  {isTalentOffer ? t('project.create.desc_offer') : t('project.create.desc_project')} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder={isTalentOffer
                    ? t('project.create.desc_placeholder_offer')
                    : t('project.create.desc_placeholder_project')}
                  required
                />
                <p className="text-sm text-gray-500">{description.length}/2000 znaků</p>
              </div>
            </CardContent>
          </Card>

          {/* Budget & Timeline */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">
                {isTalentOffer ? t('project.create.budget_title_offer') : t('project.create.budget_title_project')}
              </h3>
              <CardDescription>
                {isTalentOffer
                  ? t('project.create.budget_desc_offer')
                  : t('project.create.budget_desc_project')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">
                    {isTalentOffer ? t('project.create.budget_offer') : t('project.create.budget_project')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="budget"
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="pl-10"
                      placeholder={isTalentOffer ? "20000" : "50000"}
                      required
                    />
                  </div>
                  {isTalentOffer && (
                    <p className="text-xs text-gray-500">
                      {t('project.create.budget_min_help')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">
                    {isTalentOffer ? t('project.create.duration_offer') : t('project.create.duration_project')}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="pl-10"
                      placeholder={isTalentOffer ? t('project.create.duration_placeholder_offer') : t('project.create.duration_placeholder_project')}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> {isTalentOffer
                    ? t('project.create.tip_offer')
                    : t('project.create.tip_project')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements / Skills */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">
                {isTalentOffer ? t('project.create.skills_header_offer') : t('project.create.skills_header_project')}
              </h3>
              <CardDescription>
                {isTalentOffer
                  ? t('project.create.skills_desc_offer')
                  : t('project.create.skills_desc_project')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isTalentOffer && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="talentType">{t('project.create.talent_type')}</Label>
                    <Select value={talentType} onValueChange={setTalentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte typ" />
                      </SelectTrigger>
                      <SelectContent>
                        {talentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="followersMin">{t('project.create.followers_min')}</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="followersMin"
                        type="number"
                        value={followersMin}
                        onChange={(e) => setFollowersMin(e.target.value)}
                        className="pl-10"
                        placeholder="10000"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="skills">
                  {isTalentOffer ? t('project.create.skills_offer') : t('project.create.skills_project')}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder={isTalentOffer
                      ? t('project.create.skills_placeholder_offer')
                      : t('project.create.skills_placeholder_project')}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSkill} variant="outline">
                    {t('project.form.add')}
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="pl-3 pr-1 py-1 flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">
                  {isTalentOffer ? t('project.create.ref_offer') : t('project.create.ref_project')}
                </Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                  placeholder={isTalentOffer
                    ? t('project.create.ref_placeholder_offer')
                    : t('project.create.ref_placeholder_project')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">
                {isTalentOffer ? t('project.create.outputs_header_offer') : t('project.create.outputs_header_project')}
              </h3>
              <CardDescription>
                {isTalentOffer
                  ? t('project.create.outputs_desc_offer')
                  : t('project.create.outputs_desc_project')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deliverables">
                  {isTalentOffer ? t('project.create.outputs_offer') : t('project.create.outputs_project')}
                </Label>
                <Textarea
                  id="deliverables"
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  rows={5}
                  placeholder={isTalentOffer
                    ? t('project.create.outputs_placeholder_offer')
                    : t('project.create.outputs_placeholder_project')}
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="font-medium mb-1">{t('project.create.cover_image')}</p>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  {isTalentOffer ? t('project.create.cover_image_desc_offer') : t('project.create.cover_image_desc_project')}
                  <br />
                  <span className="text-xs text-gray-400 mt-1 block">
                    {t('project.create.cover_image_note')}
                  </span>
                </p>
                <Button type="button" variant="outline" className="mt-4">
                  {t('project.create.select_cover')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate('marketplace')}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500"
            >
              {isTalentOffer ? <Sparkles className="w-4 h-4 mr-2" /> : <Briefcase className="w-4 h-4 mr-2" />}
              {isTalentOffer ? t('project.create.submit_offer') : t('project.create.submit_project')}
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>📝 Poznámka:</strong> {isTalentOffer
                ? t('project.create.note_offer')
                : t('project.create.note_project')}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
