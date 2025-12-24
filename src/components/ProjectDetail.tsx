import { useState, useEffect } from 'react';
import { Briefcase, DollarSign, Calendar, Users, Star, MessageSquare, Send, Building2, MapPin, CheckCircle, Clock, AlertCircle, Loader2, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { Project, User } from '../types';
import { projectApi, userApi } from '../utils/api';

type ProjectDetailProps = {
  onNavigate: (page: string, data?: any) => void;
  projectId: string;
  userId?: string;
  userRole?: string;
};

export default function ProjectDetail({ onNavigate, projectId, userId, userRole }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [ownerRatings, setOwnerRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [proposalDelivery, setProposalDelivery] = useState('');
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load project and owner data
  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load project
      const projectData = await projectApi.getProject(projectId);
      setProject(projectData);
      
      // Load owner
      if (projectData.ownerId) {
        const ownerData = await userApi.getUser(projectData.ownerId);
        setOwner(ownerData);
        
        // Load owner ratings
        try {
          const ratings = await userApi.getUserRatings(projectData.ownerId);
          setOwnerRatings(Array.isArray(ratings) ? ratings : []);
        } catch (e) {
          setOwnerRatings([]);
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setError(error instanceof Error ? error.message : 'Nepodařilo se načíst projekt');
      toast.error('Chyba při načítání projektu', {
        description: error instanceof Error ? error.message : 'Zkuste to znovu později'
      });
    } finally {
      setLoading(false);
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

  if (error || !project || !owner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {error || 'Projekt nenalezen'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'Tento projekt neexistuje nebo byl smazán'}
          </p>
          <Button onClick={() => onNavigate('marketplace')}>Zpět na marketplace</Button>
        </div>
      </div>
    );
  }

  const avgRating = ownerRatings.length > 0
    ? ownerRatings.reduce((sum, r) => sum + r.rating, 0) / ownerRatings.length
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: project.currency || 'CZK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSubmitProposal = () => {
    if (!proposalPrice || !proposalMessage) {
      toast.error('Vyplňte všechna povinná pole');
      return;
    }

    // In real app, this would call API
    toast.success('Nabídka odeslána!', {
      description: `${owner.role === 'company' ? 'Firma' : 'Talent'} obdrží vaši nabídku a případně vás kontaktuje.`,
    });

    setIsApplicationDialogOpen(false);
    setProposalPrice('');
    setProposalMessage('');
    setProposalDelivery('');
  };

  const handleContactCompany = () => {
    onNavigate('chat', { userId: owner.id });
  };

  const handleEditProject = () => {
    // Navigate to edit project page
    onNavigate('edit-project', { projectId: project.id });
  };

  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      await projectApi.deleteProject(projectId);
      toast.success('Projekt smazán', {
        description: 'Váš projekt byl úspěšně odstraněn'
      });
      // Navigate back to marketplace
      onNavigate('marketplace');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Chyba při mazání projektu', {
        description: error instanceof Error ? error.message : 'Zkuste to znovu'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwnProject = userId === owner.id;
  // Talent can apply to company projects, company can apply to talent offers
  const canApply = !isOwnProject && (
    (userRole === 'talent' && owner.role === 'company') ||
    (userRole === 'company' && owner.role === 'talent')
  );

  const statusConfig = {
    open: {
      label: 'Otevřeno',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    active: {
      label: 'Aktivní',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    in_progress: {
      label: 'Probíhá',
      color: 'bg-blue-100 text-blue-800',
      icon: Clock,
    },
    closed: {
      label: 'Uzavřeno',
      color: 'bg-gray-100 text-gray-800',
      icon: AlertCircle,
    },
  };

  const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.active;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => onNavigate('marketplace')}
          className="mb-6"
        >
          ← Zpět na marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      {project.category && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {project.category}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                    <p className="text-gray-600">
                      Zveřejněno {formatDate(project.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Rozpočet</p>
                    <p className="font-bold">{formatPrice(project.price || 0)}</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Délka</p>
                    <p className="font-bold">{project.duration || '3 měsíce'}</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Nabídky</p>
                    <p className="font-bold">{project.proposalCount || 0}</p>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Briefcase className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Typ</p>
                    <p className="font-bold text-sm">{project.projectType || 'Dlouhodobé'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold">Popis projektu</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {project.description}
                </p>
              </CardContent>
            </Card>

            {/* Tags/Skills */}
            {project.tags && project.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold">Požadované dovednosti</h2>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <Badge key={`${tag}-${index}`} variant="secondary" className="px-3 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">{owner.role === 'company' ? 'O firmě' : 'O talentu'}</h3>
              </CardHeader>
              <CardContent>
                <div
                  className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={() => onNavigate(owner.role === 'company' ? 'company-profile' : 'talent-profile', { userId: owner.id })}
                >
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={owner.profileImage} />
                    <AvatarFallback>
                      {owner.role === 'company' ? <Building2 className="w-8 h-8" /> : `${owner.firstName?.[0] || ''}${owner.lastName?.[0] || ''}`}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {owner.role === 'company' ? owner.companyName : `${owner.firstName} ${owner.lastName}`}
                      </p>
                      {owner.verified && (
                        <Badge className="bg-orange-600 text-xs">✓</Badge>
                      )}
                    </div>
                    {ownerRatings.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({ownerRatings.length})</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  {owner.category && (
                    <div className="flex items-start gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600">{owner.category}</span>
                    </div>
                  )}
                  {owner.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600">{owner.address}</span>
                    </div>
                  )}
                </div>

                {owner.bio && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {owner.bio}
                    </p>
                  </>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => onNavigate(owner.role === 'company' ? 'company-profile' : 'talent-profile', { userId: owner.id })}
                >
                  Zobrazit profil {owner.role === 'company' ? 'firmy' : 'talentu'}
                </Button>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {canApply && (project.status === 'open' || project.status === 'active') && (
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-orange-50">
                <CardContent className="pt-6">
                  <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-orange-500 mb-3">
                        <Send className="w-4 h-4 mr-2" />
                        Podat nabídku
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Podat nabídku na projekt</DialogTitle>
                        <DialogDescription>
                          Vyplňte informace o vaší nabídce. {owner.role === 'company' ? 'Firma' : 'Talent'} si prohlédne váš profil a nabídku.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="proposalPrice">
                            Vaše cenová nabídka (Kč) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="proposalPrice"
                            type="number"
                            value={proposalPrice}
                            onChange={(e) => setProposalPrice(e.target.value)}
                            placeholder="50000"
                          />
                          <p className="text-sm text-gray-500">
                            Rozpočet projektu: {formatPrice(project.price || 0)}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="proposalDelivery">Doba dodání</Label>
                          <Input
                            id="proposalDelivery"
                            value={proposalDelivery}
                            onChange={(e) => setProposalDelivery(e.target.value)}
                            placeholder="Např. 3 měsíce"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="proposalMessage">
                            Motivační zpráva <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="proposalMessage"
                            value={proposalMessage}
                            onChange={(e) => setProposalMessage(e.target.value)}
                            rows={8}
                            placeholder="Popište, proč jste ideální kandidát pro tento projekt, vaše zkušenosti, nápady..."
                          />
                          <p className="text-sm text-gray-500">{proposalMessage.length}/1000 znaků</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            <strong>💡 Tip:</strong> Zmiňte konkrétní zkušenosti a ukažte, že jste 
                            si projekt pečlivě přečetli. Nabídky s personalizovanou zprávou mají 
                            o 80% vyšší šanci na úspěch!
                          </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsApplicationDialogOpen(false)}
                            className="flex-1"
                          >
                            Zrušit
                          </Button>
                          <Button
                            onClick={handleSubmitProposal}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Odeslat nabídku
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleContactCompany}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Kontaktovat {owner.role === 'company' ? 'firmu' : 'talent'}
                  </Button>

                  <p className="text-xs text-gray-600 text-center mt-3">
                    Komunikujte bezpečně přes náš chat
                  </p>
                </CardContent>
              </Card>
            )}

            {isOwnProject && (
              <Card className="border-2 border-orange-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Toto je váš projekt
                  </p>
                  <Button
                    variant="outline"
                    className="w-full mb-2"
                    onClick={handleEditProject}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Upravit projekt
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full mb-2"
                  >
                    Zobrazit nabídky ({project.proposalCount || 0})
                  </Button>
                  
                  <Separator className="my-3" />
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Mazání...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Smazat projekt
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Opravdu chcete smazat tento projekt?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tato akce je nevratná. Projekt bude trvale odstraněn ze systému včetně všech nabídek a zpráv.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Zrušit</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteProject}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Ano, smazat projekt
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            )}

            {!canApply && !isOwnProject && (
              <Card>
                <CardContent className="pt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      Přihlaste se jako talent pro podání nabídky na tento projekt.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => onNavigate('login')}
                  >
                    Přihlásit se
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Project Stats */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Statistiky projektu</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Zhlédnutí</span>
                  <span className="font-semibold">{project.views || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Podané nabídky</span>
                  <span className="font-semibold">{project.proposalCount || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Datum vytvoření</span>
                  <span className="font-semibold text-sm">{formatDate(project.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
