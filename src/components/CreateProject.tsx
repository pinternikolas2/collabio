import { useState } from 'react';
import { Briefcase, DollarSign, Calendar, Users, FileText, Image, X, Sparkles, Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { UserRole, ProjectType, PaymentType, Milestone } from '../types';
import { projectApi } from '../utils/api';
import ProjectTypeSelector from './ProjectTypeSelector';
import MilestoneManager from './MilestoneManager';

type CreateProjectProps = {
  onNavigate: (page: string, data?: any) => void;
  userId: string;
  userRole: UserRole;
  targetUserId?: string;
  targetUserName?: string;
};

export default function CreateProject({ onNavigate, userId, userRole, targetUserId, targetUserName }: CreateProjectProps) {
  const { t } = useTranslation();

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Determine if this is a talent offering services or a company seeking talent
  const isTalentOffer = userRole === 'talent';
  const isDirectOffer = !!targetUserId;

  // Step 1: Project Type
  const [projectType, setProjectType] = useState<ProjectType>('direct');
  const [paymentType, setPaymentType] = useState<PaymentType>('one-time');

  // Step 2: Basic Info (for direct) or all info (for negotiable)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [duration, setDuration] = useState('');
  const [talentType, setTalentType] = useState('');
  const [followersMin, setFollowersMin] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [deliverables, setDeliverables] = useState('');

  // Step 3: Milestones (optional)
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Step 4: Requirements
  const [requirements, setRequirements] = useState<string[]>([]);
  const [currentRequirement, setCurrentRequirement] = useState('');

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

  const handleAddRequirement = () => {
    if (currentRequirement.trim() && !requirements.includes(currentRequirement.trim())) {
      setRequirements([...requirements, currentRequirement.trim()]);
      setCurrentRequirement('');
    }
  };

  const handleRemoveRequirement = (req: string) => {
    setRequirements(requirements.filter((r) => r !== req));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Project type is always valid (has default)
        return true;
      case 2:
        if (!title || !description || !category || !budget) {
          toast.error('Vyplňte všechna povinná pole');
          return false;
        }
        if (projectType === 'direct' && !deliveryDays) {
          toast.error('Zadejte dobu dodání pro bleskovou nabídku');
          return false;
        }
        return true;
      case 3:
        // Milestones are optional, but if payment type is milestones, must have at least one
        if (paymentType === 'milestones' && milestones.length === 0) {
          toast.error('Přidejte alespoň jeden milník');
          return false;
        }
        // Validate milestone sum equals budget
        if (paymentType === 'milestones' && milestones.length > 0) {
          const sum = milestones.reduce((acc, m) => acc + Number(m.price), 0);
          if (Math.abs(sum - Number(budget)) > 0.01) {
            toast.error(`Součet milníků (${sum} Kč) se neshoduje s celkovou cenou (${budget} Kč)`);
            return false;
          }
        }
        return true;
      case 4:
        // Requirements are optional for negotiable, but recommended for direct
        if (projectType === 'direct' && requirements.length === 0) {
          toast.warning('Doporučujeme přidat alespoň jeden požadavek pro bleskovou nabídku');
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // Skip step 3 if payment type is one-time
      if (currentStep === 2 && paymentType === 'one-time') {
        setCurrentStep(4);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    // Skip step 3 if payment type is one-time
    if (currentStep === 4 && paymentType === 'one-time') {
      setCurrentStep(2);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

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
        type: projectType,
        paymentType: paymentType,
        deliveryTimeDays: projectType === 'direct' ? parseInt(deliveryDays) : undefined,
        requirements: requirements.length > 0 ? requirements : undefined,
        milestones: paymentType === 'milestones' ? milestones : undefined,
        duration: duration || '',
        talentType: talentType || '',
        followersMin: followersMin ? parseInt(followersMin) : 0,
        tags: skills,
        deliverables: deliverables || '',
        images: [],
        available: true,
        targetUserId: targetUserId || null,
        targetUserName: targetUserName || null,
        published: !isDirectOffer,
      };

      // Create project via API
      const createdProject = await projectApi.createProject(projectData);

      // Success message
      if (isDirectOffer) {
        toast.success('Nabídka byla odeslána', {
          description: `Nabídka byla odeslána uživateli ${targetUserName}`,
        });
      } else if (projectType === 'direct') {
        toast.success('Bleskový nákup vytvořen!', {
          description: 'Vaše nabídka je nyní viditelná na marketplace',
        });
      } else {
        toast.success(isTalentOffer ? 'Nabídka vytvořena!' : 'Projekt vytvořen!', {
          description: isTalentOffer
            ? 'Vaše nabídka je nyní viditelná na marketplace'
            : 'Váš projekt je nyní viditelný na marketplace',
        });
      }

      // Navigate to project detail or marketplace
      setTimeout(() => {
        if (isDirectOffer) {
          onNavigate('marketplace');
        } else {
          onNavigate('project-detail', { projectId: createdProject.id });
        }
      }, 1500);

    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Chyba při vytváření projektu', {
        description: error instanceof Error ? error.message : 'Zkuste to znovu později',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Typ projektu' },
      { number: 2, label: projectType === 'direct' ? 'Balíček' : 'Základní info' },
      { number: 3, label: 'Milníky', skip: paymentType === 'one-time' },
      { number: 4, label: 'Požadavky' },
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.filter(s => !s.skip).map((step, index, arr) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep > step.number
                    ? 'bg-green-600 text-white'
                    : currentStep === step.number
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : 'bg-gray-200 text-gray-600'
                    }`}
                >
                  {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <span className={`text-xs mt-2 font-medium ${currentStep === step.number ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
              {index < arr.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded ${currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Jaký typ projektu chcete vytvořit?</h2>
        <p className="text-gray-600">Vyberte, zda nabízíte hotovou službu nebo hledáte spolupráci</p>
      </div>
      <ProjectTypeSelector
        selectedType={projectType}
        selectedPaymentType={paymentType}
        onTypeChange={setProjectType}
        onPaymentTypeChange={setPaymentType}
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {projectType === 'direct' ? 'Definujte svůj balíček' : 'Základní informace'}
        </h2>
        <p className="text-gray-600">
          {projectType === 'direct'
            ? 'Popište, co přesně nabízíte a za kolik'
            : 'Vyplňte základní údaje o projektu'}
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Základní údaje</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              {isTalentOffer ? 'Název nabídky' : 'Název projektu'} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                projectType === 'direct'
                  ? 'např. Vytvořím 3 Instagram posty s vaším produktem'
                  : isTalentOffer
                    ? 'např. Nabízím spolupráci na sociálních sítích'
                    : 'např. Hledáme influencera pro kampaň'
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Kategorie <span className="text-red-500">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Vyberte kategorii" />
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

          <div className="space-y-2">
            <Label htmlFor="description">
              Popis <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder={
                projectType === 'direct'
                  ? 'Popište detailně, co zahrnuje váš balíček...'
                  : 'Popište váš projekt nebo nabídku...'
              }
              required
            />
            <p className="text-sm text-gray-500">{description.length}/2000 znaků</p>
          </div>
        </CardContent>
      </Card>

      {/* Budget & Timeline */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Cena a časový rámec</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">
                {projectType === 'direct' ? 'Cena balíčku' : 'Rozpočet'} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="pl-10"
                  placeholder="20000"
                  required
                />
              </div>
            </div>

            {projectType === 'direct' ? (
              <div className="space-y-2">
                <Label htmlFor="deliveryDays">
                  Doba dodání (dny) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="deliveryDays"
                  type="number"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  placeholder="7"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="duration">Časový rámec</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="např. 2-3 týdny"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills/Tags */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Klíčová slova</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skills">Přidejte klíčová slova</Label>
            <div className="flex gap-2">
              <Input
                id="skills"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="např. Instagram, TikTok, Fotografie..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button type="button" onClick={handleAddSkill} variant="outline">
                Přidat
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
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Definujte milníky projektu</h2>
        <p className="text-gray-600">Rozdělte projekt na etapy s postupným uvolňováním plateb</p>
      </div>
      <MilestoneManager
        milestones={milestones}
        totalPrice={parseFloat(budget) || 0}
        onChange={setMilestones}
      />
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Požadované podklady</h2>
        <p className="text-gray-600">
          {projectType === 'direct'
            ? 'Co budete potřebovat od firmy po zakoupení?'
            : 'Volitelné: Co budete potřebovat pro zahájení spolupráce?'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Požadavky</h3>
          <CardDescription>
            {projectType === 'direct'
              ? 'Firma vyplní tyto údaje po zakoupení vašeho balíčku'
              : 'Tyto informace pomohou zájemcům lépe připravit nabídku'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requirements">Přidejte požadavek</Label>
            <div className="flex gap-2">
              <Input
                id="requirements"
                value={currentRequirement}
                onChange={(e) => setCurrentRequirement(e.target.value)}
                placeholder="např. Logo firmy, Popis produktu, Cílová skupina..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
              />
              <Button type="button" onClick={handleAddRequirement} variant="outline">
                Přidat
              </Button>
            </div>
          </div>

          {requirements.length > 0 && (
            <div className="space-y-2">
              <Label>Požadované podklady ({requirements.length})</Label>
              <div className="space-y-2">
                {requirements.map((req, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span>{req}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(req)}
                      className="text-red-600 hover:bg-red-50 rounded p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {requirements.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Zatím jste nepřidali žádné požadavky</p>
              <p className="text-sm">
                {projectType === 'direct'
                  ? 'Doporučujeme přidat alespoň 1-3 požadavky'
                  : 'Požadavky jsou volitelné'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na marketplace
          </Button>
          <div className="flex items-center gap-3 mb-2">
            {isTalentOffer && <Sparkles className="w-8 h-8 text-orange-500" />}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
              {isDirectOffer
                ? 'Přímá nabídka'
                : (isTalentOffer ? 'Vytvořit nabídku' : 'Vytvořit projekt')}
            </h1>
          </div>
          {isDirectOffer && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <p className="text-blue-900">
                Nabídka pro <strong>{targetUserName}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět
            </Button>
          )}

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500"
            >
              Další
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vytváření...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {projectType === 'direct' ? 'Vytvořit nabídku' : 'Vytvořit projekt'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
