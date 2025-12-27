import { useState } from 'react';
import { Briefcase, DollarSign, Calendar, Users, FileText, Image, X, Sparkles, Loader2 } from 'lucide-react';
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
      toast.error('Vyplňte všechna povinná pole');
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
        toast.success('Nabídka spolupráce odeslána!', {
          description: `Přímá nabídka byla odeslána uživateli ${targetUserName}`,
        });
      } else {
        toast.success(isTalentOffer ? 'Nabídka vytvořena!' : 'Projekt vytvořen!', {
          description: isTalentOffer
            ? 'Vaše nabídka byla úspěšně zveřejněna na marketplace'
            : 'Váš projekt byl úspěšně zveřejněn na marketplace',
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
      toast.error('Chyba při vytváření projektu', {
        description: error instanceof Error ? error.message : 'Zkuste to prosím znovu',
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
            ← Zpět na marketplace
          </Button>
          <div className="flex items-center gap-3 mb-2">
            {isTalentOffer && <Sparkles className="w-8 h-8 text-orange-500" />}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
              {isDirectOffer
                ? 'Nabídnout spolupráci'
                : (isTalentOffer ? 'Vytvořit novou nabídku' : 'Vytvořit nový projekt')}
            </h1>
          </div>
          {isDirectOffer && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <p className="text-blue-900">
                Přímá nabídka pro: <strong>{targetUserName}</strong>
              </p>
            </div>
          )}
          <p className="text-gray-600 mt-2">
            {isDirectOffer
              ? 'Vytvořte nabídku spolupráce přímo pro tohoto uživatele'
              : (isTalentOffer
                ? 'Nabídněte své služby firmám a najděte nové příležitosti ke spolupráci'
                : 'Popište váš projekt a najděte ideálního talenta pro spolupráci')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Základní informace</h3>
              <CardDescription>
                {isTalentOffer
                  ? 'Základní detaily o vašich službách'
                  : 'Základní detaily o vašem projektu'}
              </CardDescription>
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
                  placeholder={isTalentOffer
                    ? "Např. Profesionální influencer marketing - Instagram & TikTok"
                    : "Např. Brand ambasador pro sportovní značku"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  {isTalentOffer ? 'Jsem' : 'Kategorie'} <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder={isTalentOffer ? "Vyberte kdo jste" : "Vyberte kategorii"} />
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
                    Upřesnění (Volitelné)
                  </Label>
                  <Input
                    id="talentTypeSpec"
                    value={talentType}
                    onChange={(e) => setTalentType(e.target.value)}
                    placeholder="Např. MMA Zápasník, Rapper, K1, Malíř..."
                  />
                  <p className="text-xs text-gray-500">
                    Pomozte firmám vás lépe najít specifikací vaší disciplíny.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">
                  {isTalentOffer ? 'Popis služeb' : 'Popis projektu'} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder={isTalentOffer
                    ? "Popište své služby, zkušenosti, co nabízíte..."
                    : "Podrobně popište váš projekt, cíle, očekávání..."}
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
                {isTalentOffer ? 'Ceník a dostupnost' : 'Rozpočet a časová osa'}
              </h3>
              <CardDescription>
                {isTalentOffer
                  ? 'Vaše cenové podmínky a dostupnost'
                  : 'Finanční a časové parametry projektu'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">
                    {isTalentOffer ? 'Ceník od (Kč)' : 'Rozpočet (Kč)'} <span className="text-red-500">*</span>
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
                      Minimální cena za spolupráci
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">
                    {isTalentOffer ? 'Dostupnost' : 'Délka trvání'}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="pl-10"
                      placeholder={isTalentOffer ? "Např. Okamžitě, od února" : "Např. 3 měsíce, 1 rok"}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> {isTalentOffer
                    ? 'Jasné cenové podmínky a dostupnost zvyšují šanci na úspěšnou spolupráci.'
                    : 'Projekty s jasnými rozpočty a časovými rámci dostávají o 60% více kvalitních nabídek.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements / Skills */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">
                {isTalentOffer ? 'Vaše dovednosti a specializace' : 'Požadavky na talenta'}
              </h3>
              <CardDescription>
                {isTalentOffer
                  ? 'Co umíte a v čem jste specialistou'
                  : 'Specifikujte, koho hledáte'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isTalentOffer && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="talentType">Typ talenta</Label>
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
                    <Label htmlFor="followersMin">Min. počet sledujících</Label>
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
                  {isTalentOffer ? 'Vaše dovednosti' : 'Požadované dovednosti'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder={isTalentOffer
                      ? "Např. Instagram marketing, Tvorba videí"
                      : "Např. Fotografie, Video editing"}
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

              <div className="space-y-2">
                <Label htmlFor="requirements">
                  {isTalentOffer ? 'Vaše zkušenosti a reference' : 'Další požadavky'}
                </Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                  placeholder={isTalentOffer
                    ? "Zkušenosti, úspěšné kampaně, reference od klientů..."
                    : "Zkušenosti, portfolio, reference..."}
                />
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">
                {isTalentOffer ? 'Co nabízíte' : 'Výstupy projektu'}
              </h3>
              <CardDescription>
                {isTalentOffer
                  ? 'Konkrétní služby a výstupy, které poskytujete'
                  : 'Co očekáváte jako výsledek'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deliverables">
                  {isTalentOffer ? 'Nabízené služby' : 'Očekávané výstupy'}
                </Label>
                <Textarea
                  id="deliverables"
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  rows={5}
                  placeholder={isTalentOffer
                    ? "Např:&#10;- Instagram posty (foto i video)&#10;- Instagram Stories s produktem&#10;- TikTok videa&#10;- Účast na eventch&#10;- Tvorba UGC obsahu"
                    : "Např:&#10;- 5 Instagram postů týdně&#10;- 2 TikTok videa měsíčně&#10;- Účast na 3 eventch"}
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="font-medium mb-1">Přidat úvodní obrázek (Cover)</p>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Nahrajte atraktivní fotku, která se zobrazí v seznamu {isTalentOffer ? 'nabídek' : 'projektů'}.
                  <br />
                  <span className="text-xs text-gray-400 mt-1 block">
                    (Konkrétní soubory k projektu si vyměníte později v chatu)
                  </span>
                </p>
                <Button type="button" variant="outline" className="mt-4">
                  Vybrat úvodní fotku
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
              Zrušit
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500"
            >
              {isTalentOffer ? <Sparkles className="w-4 h-4 mr-2" /> : <Briefcase className="w-4 h-4 mr-2" />}
              {isTalentOffer ? 'Zveřejnit nabídku' : 'Zveřejnit projekt'}
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>📝 Poznámka:</strong> {isTalentOffer
                ? 'Po zveřejnění nabídky vás budou firmy kontaktovat přes interní chat. Můžete si prohlédnout jejich profily před přijetím spolupráce.'
                : 'Po zveřejnění projektu budete dostávat nabídky od talentů. Můžete si prohlédnout jejich profily a vybrat nejlepšího kandidáta.'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
