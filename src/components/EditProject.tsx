import { useState, useEffect } from 'react';
import { Briefcase, DollarSign, X, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { projectApi } from '../utils/api';
import { Project } from '../types';

type EditProjectProps = {
  onNavigate: (page: string, data?: any) => void;
  projectId: string;
};

export default function EditProject({ onNavigate, projectId }: EditProjectProps) {
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
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Chyba při načítání projektu', {
        description: error instanceof Error ? error.message : 'Zkuste to znovu'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category || !budget) {
      toast.error('Vyplňte všechna povinná pole');
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
      });

      toast.success('Projekt aktualizován!', {
        description: 'Změny byly úspěšně uloženy',
      });

      // Navigate to project detail
      setTimeout(() => {
        onNavigate('project-detail', { projectId: updatedProject.id });
      }, 1000);

    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Chyba při aktualizaci projektu', {
        description: error instanceof Error ? error.message : 'Zkuste to prosím znovu',
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
          <p className="text-gray-600">Načítání projektu...</p>
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
            ← Zpět na detail projektu
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
              Upravit projekt
            </h1>
          </div>
          <p className="text-gray-600 mt-2">
            Aktualizujte informace o vašem projektu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Základní informace</h3>
              <CardDescription>
                Základní detaily o vašem projektu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Název projektu <span className="text-red-500">*</span>
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
                  Popis projektu <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Popište váš projekt, cíle, očekávání..."
                  required
                />
                <p className="text-sm text-gray-500">{description.length}/2000 znaků</p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Kategorie <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte kategorii" />
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
              <h3 className="text-xl font-semibold">Rozpočet a časový rámec</h3>
              <CardDescription>
                Finanční podmínky a délka projektu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Budget */}
                <div className="space-y-2">
                  <Label htmlFor="budget">
                    Rozpočet (Kč) <span className="text-red-500">*</span>
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
                  <p className="text-xs text-gray-500">+ 21% DPH</p>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Délka projektu</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Např. 3 měsíce"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Tags */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Dovednosti a tagy</h3>
              <CardDescription>
                Klíčová slova pro lepší vyhledávání
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skills">Přidat tag</Label>
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
                    placeholder="Např. Social Media, Instagram, TikTok..."
                  />
                  <Button type="button" onClick={handleAddSkill} variant="outline">
                    Přidat
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
                  Zrušit
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Ukládání...
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-5 h-5 mr-2" />
                      Uložit změny
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
