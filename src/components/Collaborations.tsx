import { useState } from 'react';
import { Briefcase, Clock, CheckCircle, XCircle, DollarSign, Calendar, MessageSquare, Star, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { mockCollaborations, mockUsers, mockProjects } from '../data/seedData';
import { CollaborationStatus } from '../types';

type CollaborationsProps = {
  onNavigate: (page: string, data?: any) => void;
  userId: string;
};

export default function Collaborations({ onNavigate, userId }: CollaborationsProps) {
  const [activeTab, setActiveTab] = useState<string>('active');

  const userCollaborations = mockCollaborations.filter(
    (collab) => collab.talentId === userId || collab.companyId === userId
  );

  const getOtherUser = (collab: any) => {
    const otherUserId = collab.talentId === userId ? collab.companyId : collab.talentId;
    return mockUsers.find((u) => u.id === otherUserId);
  };

  const getProject = (collab: any) => {
    return mockProjects.find((p) => p.id === collab.projectId);
  };

  const getStatusColor = (status: CollaborationStatus) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'escrow':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: CollaborationStatus) => {
    switch (status) {
      case 'active':
        return 'Aktivní';
      case 'pending':
        return 'Čeká na schválení';
      case 'completed':
        return 'Dokončeno';
      case 'cancelled':
        return 'Zrušeno';
      case 'escrow':
        return 'V Escrow';
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredCollaborations = userCollaborations.filter((collab) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return collab.status === 'active' || collab.status === 'escrow';
    if (activeTab === 'completed') return collab.status === 'completed';
    if (activeTab === 'pending') return collab.status === 'pending';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
            Moje spolupráce
          </h1>
          <p className="text-gray-600">
            Přehled všech vašich aktuálních a minulých spoluprací
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Celkem</p>
                  <p className="text-2xl font-bold">{userCollaborations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dokončeno</p>
                  <p className="text-2xl font-bold">
                    {userCollaborations.filter((c) => c.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Aktivní</p>
                  <p className="text-2xl font-bold">
                    {userCollaborations.filter((c) => c.status === 'active' || c.status === 'escrow').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">V Escrow</p>
                  <p className="text-2xl font-bold">
                    {formatPrice(
                      userCollaborations
                        .filter((c) => !c.escrowReleased && c.escrowAmount)
                        .reduce((sum, c) => sum + (c.escrowAmount || 0), 0)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">Všechny</TabsTrigger>
            <TabsTrigger value="active">Aktivní</TabsTrigger>
            <TabsTrigger value="pending">Čekající</TabsTrigger>
            <TabsTrigger value="completed">Dokončené</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {filteredCollaborations.map((collab) => {
              const otherUser = getOtherUser(collab);
              const project = getProject(collab);

              if (!otherUser || !project) return null;

              return (
                <Card key={collab.id} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={otherUser.profileImage} alt={otherUser.firstName} />
                          <AvatarFallback>{otherUser.firstName[0]}{otherUser.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          <p className="text-sm text-gray-600">
                            {otherUser.role === 'talent' ? 'Talent' : 'Firma'}: {otherUser.firstName} {otherUser.lastName}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(collab.status)}>
                        {getStatusText(collab.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Project Details */}
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {project.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Datum zahájení</p>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {new Date(collab.createdAt).toLocaleDateString('cs-CZ')}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Poslední aktualizace</p>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {new Date(collab.updatedAt).toLocaleDateString('cs-CZ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress for active collaborations */}
                        {collab.status === 'active' && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Průběh projektu</span>
                              <span className="text-sm font-semibold">65%</span>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                        )}
                      </div>

                      {/* Financial Info */}
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-orange-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Částka</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
                            {formatPrice(collab.price)}
                          </p>
                        </div>

                        {collab.escrowAmount && !collab.escrowReleased && (
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-sm text-purple-800 mb-1">Escrow</p>
                            <p className="text-lg font-semibold text-purple-900">
                              {formatPrice(collab.escrowAmount)}
                            </p>
                            <p className="text-xs text-purple-600 mt-1">
                              Peníze budou uvolněny po dokončení
                            </p>
                          </div>
                        )}

                        {collab.escrowReleased && (
                          <Badge className="bg-green-100 text-green-800 w-full justify-center">
                            ✓ Platba uvolněna
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t bg-gray-50 flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => onNavigate('chat', { userId: otherUser.id })}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Zprávy
                    </Button>
                    {collab.status === 'completed' && (
                      <>
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                          onClick={() => onNavigate('collaboration-report', { reportId: `rep${collab.id}` })}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Report
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500"
                          onClick={() => onNavigate('rate-collaboration', { collaborationId: collab.id })}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Ohodnotit
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('collaboration-detail', { collaborationId: collab.id })}
                    >
                      Detail
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}

            {filteredCollaborations.length === 0 && (
              <Card className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Briefcase className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Žádné spolupráce</h3>
                <p className="text-gray-600 mb-4">
                  V této kategorii nemáte žádné spolupráce
                </p>
                <Button
                  onClick={() => onNavigate('marketplace')}
                  className="bg-gradient-to-r from-blue-600 to-orange-500"
                >
                  Prozkoumat marketplace
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
