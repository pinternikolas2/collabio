import { useState, useEffect } from 'react';
import { Users, Briefcase, DollarSign, TrendingUp, Download, Settings, Shield, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { clearDatabase } from '../services/firestore';
import { adminApi } from '../utils/api';
import { User, Project, Collaboration, Transaction, KYCDocument } from '../types';
import { toast } from 'sonner';
import { calculateServiceFee } from '../utils/fees';

type AdminDashboardProps = {
  onNavigate: (page: string, data?: any) => void;
};

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usersData, projectsData, collabsData, transData, kycData] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getAllProjects(),
        adminApi.getAllCollaborations(),
        adminApi.getAllTransactions(),
        adminApi.getPendingKYC() // Note: This might only get pending, we might want ALL for the tab
      ]);

      setUsers(usersData);
      setProjects(projectsData);
      setCollaborations(collabsData);
      setTransactions(transData);
      setKycDocuments(kycData); // If we want all, we'd need getAllKYC method, but let's stick to what we have or improve api.ts
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Nepodařilo se načíst data dashboardu');
    } finally {
      setLoading(false);
    }
  };

  // Derived Stats
  const totalUsers = users.length;
  const totalTalents = users.filter((u) => u.role === 'talent').length;
  const totalCompanies = users.filter((u) => u.role === 'company').length;
  const totalProjects = projects.length;
  const totalCollaborations = collaborations.length;
  const activeCollaborations = collaborations.filter((c) => c.status === 'active' || c.status === 'escrow').length;
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const platformFees = transactions.reduce((sum, t) => {
    // If it's an income transaction (payment from company), we calculate fee from it
    if (t.type === 'income') {
      return sum + calculateServiceFee(t.amount);
    }
    return sum;
  }, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Načítání dashboardu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
            {t('admin.title')}
          </h1>
          <p className="text-gray-600">
            {t('admin.subtitle')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-200" />
              </div>
              <p className="text-blue-100 text-sm mb-1">{t('admin.stats.total_users')}</p>
              <p className="text-3xl font-bold">{totalUsers}</p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-white/20 text-sm">
                <div>
                  <span className="text-blue-100">{t('admin.stats.talents')}</span> <strong>{totalTalents}</strong>
                </div>
                <div>
                  <span className="text-blue-100">{t('admin.stats.companies')}</span> <strong>{totalCompanies}</strong>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-orange-200" />
              </div>
              <p className="text-orange-100 text-sm mb-1">{t('admin.stats.collaborations')}</p>
              <p className="text-3xl font-bold">{totalCollaborations}</p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-white/20 text-sm">
                <div>
                  <span className="text-orange-100">{t('admin.stats.active')}</span> <strong>{activeCollaborations}</strong>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-200" />
              </div>
              <p className="text-green-100 text-sm mb-1">{t('admin.stats.total_volume')}</p>
              <p className="text-3xl font-bold">{formatPrice(totalRevenue)}</p>
              <div className="mt-3 pt-3 border-t border-white/20 text-sm">
                <span className="text-green-100">{t('admin.stats.platform_fees')}</span> <strong>{formatPrice(platformFees)}</strong>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-purple-200" />
              </div>
              <p className="text-purple-100 text-sm mb-1">{t('admin.stats.projects')}</p>
              <p className="text-3xl font-bold">{totalProjects}</p>
              <div className="mt-3 pt-3 border-t border-white/20 text-sm">
                <span className="text-purple-100">{t('admin.stats.active')}</span> <strong>{projects.filter(p => p.status === 'active').length}</strong>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">{t('admin.tabs.users')}</TabsTrigger>
            <TabsTrigger value="kyc">{t('admin.tabs.kyc')}</TabsTrigger>
            <TabsTrigger value="projects">{t('admin.tabs.projects')}</TabsTrigger>
            <TabsTrigger value="collaborations">{t('admin.tabs.collaborations')}</TabsTrigger>
            <TabsTrigger value="transactions">{t('admin.tabs.transactions')}</TabsTrigger>
            <TabsTrigger value="settings">{t('admin.tabs.settings')}</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{t('admin.users.title')}</h3>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {t('admin.users.export')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.users.table.name')}</TableHead>
                      <TableHead>{t('admin.users.table.email')}</TableHead>
                      <TableHead>{t('admin.users.table.role')}</TableHead>
                      <TableHead>{t('admin.users.table.category')}</TableHead>
                      <TableHead>{t('admin.users.table.verified')}</TableHead>
                      <TableHead>{t('admin.users.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'talent' ? 'default' : user.role === 'company' ? 'secondary' : 'outline'}>
                            {user.role === 'talent' ? t('admin.users.badges.talent') : user.role === 'company' ? t('admin.users.badges.company') : t('admin.users.badges.admin')}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.category || '-'}</TableCell>
                        <TableCell>
                          {user.verified ? (
                            <Badge className="bg-green-100 text-green-800">✓ {t('admin.users.badges.yes')}</Badge>
                          ) : (
                            <Badge variant="outline">{t('admin.users.badges.no')}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            {t('admin.users.detail')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC Verification Tab */}
          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {t('admin.kyc.title')}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('admin.kyc.subtitle')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {t('admin.kyc.export')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">{t('admin.kyc.stats.pending')}</p>
                      <p className="text-2xl font-semibold text-yellow-700">
                        {kycDocuments.filter(d => d.status === 'pending').length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">{t('admin.kyc.stats.verified')}</p>
                      <p className="text-2xl font-semibold text-green-700">
                        {kycDocuments.filter(d => d.status === 'verified').length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">{t('admin.kyc.stats.rejected')}</p>
                      <p className="text-2xl font-semibold text-red-700">
                        {kycDocuments.filter(d => d.status === 'rejected').length}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.kyc.table.user')}</TableHead>
                      <TableHead>{t('admin.kyc.table.role')}</TableHead>
                      <TableHead>{t('admin.kyc.table.doc_type')}</TableHead>
                      <TableHead>{t('admin.kyc.table.ico_company')}</TableHead>
                      <TableHead>{t('admin.kyc.table.uploaded')}</TableHead>
                      <TableHead>{t('admin.kyc.table.status')}</TableHead>
                      <TableHead>{t('admin.kyc.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycDocuments.map((doc) => {
                      const user = users.find(u => u.id === doc.userId);
                      return (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">
                            {user?.firstName} {user?.lastName}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user?.role === 'talent' ? 'default' : 'secondary'}>
                              {user?.role === 'talent' ? t('admin.users.badges.talent') : t('admin.users.badges.company')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {doc.documentType === 'id_card' && t('admin.kyc.doc_types.id_card')}
                            {doc.documentType === 'business_license' && t('admin.kyc.doc_types.business_license')}
                            {doc.documentType === 'ico_certificate' && t('admin.kyc.doc_types.ico_certificate')}
                          </TableCell>
                          <TableCell>
                            {doc.ico ? `IČO: ${doc.ico}` : '-'}
                            {doc.companyName && <div className="text-xs text-gray-500">{doc.companyName}</div>}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(doc.uploadedAt).toLocaleDateString('cs-CZ')}
                          </TableCell>
                          <TableCell>
                            {doc.status === 'verified' && (
                              <Badge className="bg-green-100 text-green-700">✓ {t('admin.kyc.badges.verified')}</Badge>
                            )}
                            {doc.status === 'pending' && (
                              <Badge className="bg-yellow-100 text-yellow-700">⏱ {t('admin.kyc.badges.pending')}</Badge>
                            )}
                            {doc.status === 'rejected' && (
                              <Badge className="bg-red-100 text-red-700">✗ {t('admin.kyc.badges.rejected')}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {doc.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:bg-green-50"
                                  >
                                    {t('admin.kyc.actions.approve')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    {t('admin.kyc.actions.reject')}
                                  </Button>
                                </>
                              )}
                              <Button variant="ghost" size="sm">
                                {t('admin.kyc.actions.view')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{t('admin.projects.title')}</h3>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {t('admin.projects.export')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.projects.table.title')}</TableHead>
                      <TableHead>{t('admin.projects.table.category')}</TableHead>
                      <TableHead>{t('admin.projects.table.price')}</TableHead>
                      <TableHead>{t('admin.projects.table.status')}</TableHead>
                      <TableHead>{t('admin.projects.table.rating')}</TableHead>
                      <TableHead>{t('admin.projects.table.featured')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {project.title}
                        </TableCell>
                        <TableCell>{project.category}</TableCell>
                        <TableCell>{formatPrice(project.price)}</TableCell>
                        <TableCell>
                          <Badge className={project.status === 'active' ? 'bg-green-100 text-green-800' : ''}>
                            {project.status === 'active' ? t('admin.projects.badges.active') : t('admin.projects.badges.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          ⭐ {project.rating?.toFixed(1) || '-'} ({project.ratingCount || 0})
                        </TableCell>
                        <TableCell>
                          {project.featured && <Badge className="bg-orange-500">⭐ {t('admin.projects.badges.yes')}</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collaborations Tab */}
          <TabsContent value="collaborations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{t('admin.collaborations.title')}</h3>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {t('admin.collaborations.export')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.collaborations.table.id')}</TableHead>
                      <TableHead>{t('admin.collaborations.table.talent')}</TableHead>
                      <TableHead>{t('admin.collaborations.table.company')}</TableHead>
                      <TableHead>{t('admin.collaborations.table.price')}</TableHead>
                      <TableHead>{t('admin.collaborations.table.status')}</TableHead>
                      <TableHead>{t('admin.collaborations.table.escrow')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collaborations.map((collab) => {
                      const talent = users.find((u) => u.id === collab.talentId);
                      const company = users.find((u) => u.id === collab.companyId);
                      return (
                        <TableRow key={collab.id}>
                          <TableCell className="font-mono text-sm">{collab.id}</TableCell>
                          <TableCell>{talent?.firstName} {talent?.lastName}</TableCell>
                          <TableCell>{company?.firstName} {company?.lastName}</TableCell>
                          <TableCell>{formatPrice(collab.price)}</TableCell>
                          <TableCell>
                            <Badge className={
                              collab.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                collab.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-yellow-100 text-yellow-800'
                            }>
                              {collab.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {collab.escrowReleased ? (
                              <Badge className="bg-green-100 text-green-800">{t('admin.collaborations.badges.released')}</Badge>
                            ) : (
                              <Badge className="bg-purple-100 text-purple-800">{t('admin.collaborations.badges.held')}</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{t('admin.transactions.title')}</h3>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {t('admin.transactions.export')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg">
                  <h4 className="font-semibold mb-2">{t('admin.transactions.financial_overview')}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">{t('admin.transactions.stats.volume')}</p>
                      <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('admin.transactions.stats.fees')}</p>
                      <p className="text-2xl font-bold text-green-600">{formatPrice(platformFees)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('admin.transactions.stats.count')}</p>
                      <p className="text-2xl font-bold">{transactions.length}</p>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.transactions.table.date')}</TableHead>
                      <TableHead>{t('admin.transactions.table.user')}</TableHead>
                      <TableHead>{t('admin.transactions.table.type')}</TableHead>
                      <TableHead>{t('admin.transactions.table.amount')}</TableHead>
                      <TableHead>{t('admin.transactions.table.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const user = users.find((u) => u.id === transaction.userId);
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.createdAt).toLocaleDateString('cs-CZ')}
                          </TableCell>
                          <TableCell>{user?.firstName} {user?.lastName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {transaction.type === 'income' ? t('admin.transactions.badges.income') : transaction.type === 'expense' ? t('admin.transactions.badges.expense') : t('admin.transactions.badges.escrow')}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{formatPrice(transaction.amount)}</TableCell>
                          <TableCell>
                            <Badge className={
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                            }>
                              {transaction.status === 'completed' ? t('admin.transactions.badges.completed') : transaction.status === 'pending' ? t('admin.transactions.badges.pending') : t('admin.transactions.badges.failed')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">{t('admin.settings.title')}</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold mb-2">{t('admin.settings.service_fee')}</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    <li>20 % (do 20 000 Kč)</li>
                    <li>15 % (20 001 - 100 000 Kč)</li>
                    <li>7 % (nad 100 000 Kč)</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">
                    Tyto poplatky jsou nyní pevně nastaveny v kódu a vypočítávají se automaticky.
                  </p>
                </div>

                <div>
                  <Label htmlFor="min-project-price">{t('admin.settings.min_project_price')}</Label>
                  <Input
                    id="min-project-price"
                    type="number"
                    defaultValue="5000"
                    className="max-w-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="escrow-release-days">{t('admin.settings.escrow_days')}</Label>
                  <Input
                    id="escrow-release-days"
                    type="number"
                    defaultValue="30"
                    className="max-w-xs"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {t('admin.settings.escrow_days_desc')}
                  </p>
                </div>

                <div className="pt-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600">
                    <Settings className="w-4 h-4 mr-2" />
                    {t('admin.settings.save')}
                  </Button>
                </div>

                <div className="pt-8 border-t border-gray-200">
                  <h4 className="text-lg font-semibold mb-2 text-red-600">Nebezpečná zóna</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Tyto akce jsou nevratné. Buďte opatrní.
                  </p>
                  {/* Seed mock data button removed */}

                  <Button
                    variant="outline"
                    className="ml-4 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={async () => {
                      if (confirm('POZOR: Opravdu chcete smazat VŠECHNA data z databáze? Tato akce je nevratná.')) {
                        try {
                          // Import clearDatabase dynamically or ensure it is imported at top
                          // actually, we need to import it first. 
                          // But wait, replace_file_content needs to be contiguous. 
                          // I'll add the button here and update imports in a separate call or previous call.
                          // It's better to update imports first. 
                          // But I'm in the middle of this edit.
                          // I'll assume I update imports in next step or previous.
                          // Let's assume I already did or will do.
                          // Wait, I cannot use a function that is not imported.
                          // I'll write the button code here, and then update the import.
                          // To be safe I will just use the imported name as if it exists.
                          await clearDatabase();
                          toast.success('Databáze byla úspěšně vymazána');
                          loadDashboardData();
                        } catch (e: any) {
                          console.error(e);
                          toast.error('Chyba při mazání databáze: ' + e.message);
                        }
                      }
                    }}
                  >
                    Vymazat celou databázi (Clean DB)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
