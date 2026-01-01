import { useState, useEffect } from 'react';
import { Briefcase, DollarSign, X, Sparkles, Loader2, Image, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { projectApi, storageApi } from '../utils/api';
import { Project } from '../types';

type EditProjectProps = {
  onNavigate: (page: string, data?: any) => void;
  projectId: string;
};

export default function EditProject({ onNavigate, projectId }: EditProjectProps) {
  const { t } = useTranslation();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Image Upload State
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  // Load project data
  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const projectData = await projectApi.getProject(projectId);
      setProject(projectData);

      // Populate form with existing data
      setTitle(projectData.title || '');
      setDescription(projectData.description || '');
      setCategory(projectData.category || '');
      setBudget(projectData.price?.toString() || '');
      setDuration(projectData.duration || '');
      setSkills(projectData.tags || []);
      setImages(projectData.images || []);
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error(t('project.form.load_error'), {
        description: error instanceof Error ? error.message : t('project.form.try_again')
      });
      onNavigate('marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Soubor je příliš velký (max 5MB)');
      return;
    }

    setUploadingImage(true);
    try {
      const result = await storageApi.uploadAttachment(file);
      setImages([...images, result.url]);
      toast.success('Obrázek nahrán');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Chyba při nahrávání obrázku');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category || !budget) {
      toast.error(t('project.form.fill_required'));
      return;
    }

    setSubmitting(true);

    try {
      // Update project via API
      const updatedProject = await projectApi.updateProject(projectId, {
        title,
        description,
        category,
        price: parseFloat(budget),
        duration: duration || '',
        tags: skills,
        images: images,
      });

      toast.success(t('project.form.update_success'), {
        description: t('project.form.update_success_desc'),
      });

      // Navigate to project detail
      setTimeout(() => {
        onNavigate('project-detail', { projectId: updatedProject.id });
      }, 1000);

    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(t('project.form.update_error'), {
        description: error instanceof Error ? error.message : t('project.form.try_again'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('project-detail', { projectId })}
            className="mb-4"
          >
            {t('project.edit.back_to_detail')}
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
              {t('project.edit.title')}
            </h1>
          </div>
          <p className="text-gray-600 mt-2">
            {t('project.edit.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">{t('project.form.basic_info')}</h3>
              <CardDescription>
                {t('project.form.basic_info_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {t('project.create.project_name')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Např. Hledáme ambasadora značky pro fitness produkty"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t('project.create.desc_project')} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder={t('project.create.desc_placeholder_project')}
                  required
                />
                <p className="text-sm text-gray-500">{description.length}/2000 znaků</p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  {t('project.create.role_project')} <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('project.create.role_select_project')} />
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
            </CardContent>
          </Card>

          {/* Budget & Timeline */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">{t('project.form.budget_title')}</h3>
              <CardDescription>
                {t('project.form.budget_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Budget */}
                <div className="space-y-2">
                  <Label htmlFor="budget">
                    {t('project.create.budget_project')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="budget"
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="50000"
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">{t('project.form.budget_vat')}</p>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">{t('project.form.duration_label')}</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder={t('project.create.duration_placeholder_project')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Tags */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">{t('project.form.skills_title')}</h3>
              <CardDescription>
                {t('project.form.skills_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skills">{t('project.form.add_tag')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder={t('project.create.skills_placeholder_project')}
                  />
                  <Button type="button" onClick={handleAddSkill} variant="outline">
                    {t('project.form.add')}
                  </Button>
                </div>
              </div>

              {/* Skills Display */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media / Images */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Galerie a přílohy</h3>
              <CardDescription>
                Přidejte obrázky pro zatraktivnění vaší nabídky (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={img} alt={`Project ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group">
                  {uploadingImage ? (
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  ) : (
                    <>
                      <Image className="w-8 h-8 text-gray-400 mb-2 group-hover:text-blue-500" />
                      <span className="text-sm text-gray-500 group-hover:text-blue-600 font-medium">Nahrát</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onNavigate('project-detail', { projectId })}
                  className="flex-1"
                  disabled={submitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('project.form.saving')}
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-5 h-5 mr-2" />
                      {t('common.save_changes')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
