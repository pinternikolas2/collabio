import { DollarSign, TrendingUp, TrendingDown, Download, CreditCard, FileText, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { mockTransactions, mockUsers } from '../data/seedData';
import { Transaction } from '../types';
import { calculateTotalFees, getFeeBreakdown, FEE_TIERS } from '../utils/fees';

type FinanceProps = {
  onNavigate: (page: string, data?: any) => void;
  userId: string;
  userRole: 'talent' | 'company' | 'admin';
};

export default function Finance({ onNavigate, userId, userRole }: FinanceProps) {
  const userTransactions = mockTransactions.filter((t) => t.userId === userId);

  const totalIncome = userTransactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = userTransactions
    .filter((t) => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const escrowAmount = userTransactions
    .filter((t) => t.type === 'escrow' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  // Progresivní výpočet servisních poplatků podle velikosti transakcí
  const incomeAmounts = userTransactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .map((t) => t.amount);
  const serviceFee = calculateTotalFees(incomeAmounts);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'expense':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'escrow':
        return <Shield className="w-4 h-4 text-purple-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeText = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return 'Příjem';
      case 'expense':
        return 'Výdaj';
      case 'escrow':
        return 'Escrow';
      case 'release':
        return 'Uvolnění';
      default:
        return type;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'Dokončeno';
      case 'pending':
        return 'Čeká';
      case 'failed':
        return 'Selhalo';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
            Finance
          </h1>
          <p className="text-gray-600">
            Přehled vašich příjmů, výdajů a escrow plateb
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-700">Celkové příjmy</p>
                  <p className="text-2xl font-bold text-green-900">{formatPrice(totalIncome)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-red-700">Celkové výdaje</p>
                  <p className="text-2xl font-bold text-red-900">{formatPrice(totalExpense)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-700">V Escrow</p>
                  <p className="text-2xl font-bold text-purple-900">{formatPrice(escrowAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-orange-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-700">Zůstatek</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(totalIncome - totalExpense)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stripe Connection */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-orange-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Stripe Connect</h3>
                  <p className="text-blue-100 text-sm">
                    Bezpečné platby přes Stripe. Escrow systém chrání všechny transakce.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Spravovat účet
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 via-blue-600 to-orange-500 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3>Smlouvy a dokumenty</h3>
                    <p className="text-sm text-gray-600">Stáhněte si všechny své smlouvy jako PDF</p>
                  </div>
                </div>
                <Button
                  onClick={() => onNavigate('contracts')}
                  className="bg-gradient-to-r from-blue-600 to-orange-500 whitespace-nowrap"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Zobrazit smlouvy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions">Transakce</TabsTrigger>
            <TabsTrigger value="invoices">Faktury</TabsTrigger>
            <TabsTrigger value="fees">Poplatky</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Historie transakcí</h3>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Popis</TableHead>
                      <TableHead>Částka</TableHead>
                      <TableHead>Stav</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString('cs-CZ')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(transaction.type)}
                            <span>{getTypeText(transaction.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          ID Spolupráce: {transaction.collaborationId}
                        </TableCell>
                        <TableCell className={transaction.type === 'income' ? 'text-green-600 font-semibold' : transaction.type === 'expense' ? 'text-red-600 font-semibold' : ''}>
                          {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}{formatPrice(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {getStatusText(transaction.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {userTransactions.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Zatím nemáte žádné transakce</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Automatické faktury</h3>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Vytvořit fakturu
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userTransactions.filter((t) => t.status === 'completed').map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Faktura #{transaction.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.createdAt).toLocaleDateString('cs-CZ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{formatPrice(transaction.amount)}</span>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Stáhnout PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {userTransactions.filter((t) => t.status === 'completed').length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Zatím nemáte žádné faktury</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Servisní poplatky Collabio</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Progresivní systém poplatků - čím větší spolupráce, tím nižší procento
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Celkový poplatek */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">Celkový poplatek</h4>
                        <p className="text-sm text-gray-600">
                          Z celkových příjmů {formatPrice(totalIncome)}
                        </p>
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
                        {formatPrice(serviceFee)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Servisní poplatek pokrývá bezpečné platby, escrow systém, automatické faktury a kompletní zákaznickou podporu.
                    </p>
                  </div>

                  {/* Pásma poplatků */}
                  <div>
                    <h4 className="font-semibold mb-4">Pásma poplatků podle velikosti spolupráce:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {FEE_TIERS.map((tier, index) => (
                        <div
                          key={tier.name}
                          className={`p-4 border-2 rounded-lg ${index === 0
                              ? 'border-orange-200 bg-orange-50'
                              : index === 1
                                ? 'border-blue-200 bg-blue-50'
                                : 'border-green-200 bg-green-50'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold">{tier.name}</h5>
                            <Badge
                              variant="secondary"
                              className={
                                index === 0
                                  ? 'bg-orange-200 text-orange-800'
                                  : index === 1
                                    ? 'bg-blue-200 text-blue-800'
                                    : 'bg-green-200 text-green-800'
                              }
                            >
                              {tier.feePercentage}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{tier.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Výhody */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Co zahrnuje servisní poplatek:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <Shield className="w-4 h-4 text-green-600" />
                        Escrow systém pro bezpečné platby
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <FileText className="w-4 h-4 text-green-600" />
                        Automatické generování faktur
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        Stripe Connect integrace
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        24/7 zákaznická podpora
                      </li>
                    </ul>
                  </div>

                  {/* Příklad výpočtu */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold mb-3">💡 Příklad výpočtu:</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Projekt 5 000 Kč (10%):</span>
                        <span className="font-semibold">{formatPrice(5000 * 0.10)} poplatek</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projekt 50 000 Kč (15%):</span>
                        <span className="font-semibold">{formatPrice(50000 * 0.15)} poplatek</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projekt 200 000 Kč (7%):</span>
                        <span className="font-semibold">{formatPrice(200000 * 0.07)} poplatek</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
