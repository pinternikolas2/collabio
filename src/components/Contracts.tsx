import { useState } from 'react';
import { FileText, Download, Eye, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Separator } from './ui/separator';
import { mockContracts, mockUsers, mockProjects } from '../data/seedData';
import { Contract } from '../types';
import { toast } from 'sonner';

type ContractsProps = {
  userId: string;
  onNavigate?: (page: string, data?: any) => void;
};

export default function Contracts({ userId, onNavigate }: ContractsProps) {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Filter contracts for current user
  const userContracts = mockContracts.filter(
    contract => contract.talentId === userId || contract.companyId === userId
  );

  const getOtherParty = (contract: Contract) => {
    const otherPartyId = contract.talentId === userId ? contract.companyId : contract.talentId;
    return mockUsers.find(user => user.id === otherPartyId);
  };

  const getProject = (contract: Contract) => {
    return mockProjects.find(project => project.id === contract.projectId);
  };

  const getStatusBadge = (status: Contract['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200"><Clock className="w-3 h-3 mr-1" />Aktivní</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1" />Dokončeno</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200"><XCircle className="w-3 h-3 mr-1" />Zrušeno</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadPDF = (contract: Contract) => {
    // In production, this would generate actual PDF using jspdf or similar
    // For now, we'll create a simple text version
    const otherParty = getOtherParty(contract);
    const project = getProject(contract);

    const content = `
SMLOUVA O SPOLUPRÁCI
Číslo smlouvy: ${contract.contractNumber}

════════════════════════════════════════════════════════════════

SMLUVNÍ STRANY:

Talent:
${mockUsers.find(u => u.id === contract.talentId)?.firstName} ${mockUsers.find(u => u.id === contract.talentId)?.lastName}
${mockUsers.find(u => u.id === contract.talentId)?.email}

Firma:
${mockUsers.find(u => u.id === contract.companyId)?.firstName} ${mockUsers.find(u => u.id === contract.companyId)?.lastName}
${mockUsers.find(u => u.id === contract.companyId)?.email}

════════════════════════════════════════════════════════════════

PŘEDMĚT SMLOUVY:
${contract.projectDescription}

Název projektu: ${project?.title}

════════════════════════════════════════════════════════════════

DODÁVKY (DELIVERABLES):
${contract.deliverables.map((item, index) => `${index + 1}. ${item}`).join('\n')}

════════════════════════════════════════════════════════════════

FINANČNÍ PODMÍNKY:
Cena: ${formatCurrency(contract.price, contract.currency)} (bez DPH)
DPH (${contract.vat}%): ${formatCurrency(contract.price * contract.vat / 100, contract.currency)}
Celková cena včetně DPH: ${formatCurrency(contract.price * (1 + contract.vat / 100), contract.currency)}

Platební podmínky:
${contract.paymentTerms}

════════════════════════════════════════════════════════════════

TERMÍN PLNĚNÍ:
Deadline: ${formatDate(contract.deadline)}

════════════════════════════════════════════════════════════════

DIGITÁLNÍ PODPISY:

Talent:
${contract.talentSignature}

Firma:
${contract.companySignature}

════════════════════════════════════════════════════════════════

Smlouva uzavřena dne: ${formatDate(contract.signedAt)}
Vygenerováno z platformy Collabio: ${new Date().toLocaleString('cs-CZ')}

Tato smlouva je právně závazným dokumentem podle českého práva.
    `;

    // Create a blob and download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Smlouva_${contract.contractNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Smlouva stažena', {
      description: `Smlouva ${contract.contractNumber} byla úspěšně stažena.`
    });
  };

  const handlePreview = (contract: Contract) => {
    setSelectedContract(contract);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 via-blue-600 to-orange-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1>Smlouvy</h1>
              <p className="text-gray-600">Přehled všech vašich smluv a dohod</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Celkem smluv</p>
                  <p className="text-2xl font-semibold">{userContracts.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Aktivní</p>
                  <p className="text-2xl font-semibold">
                    {userContracts.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Dokončeno</p>
                  <p className="text-2xl font-semibold">
                    {userContracts.filter(c => c.status === 'completed').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contracts List */}
        <Card>
          <CardHeader>
            <h2>Vaše smlouvy</h2>
            <p className="text-gray-600">Seznam všech podepsaných smluv a dohod</p>
          </CardHeader>
          <CardContent>
            {userContracts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">Zatím nemáte žádné smlouvy</p>
                <p className="text-sm text-gray-500 mb-4">
                  Smlouvy se automaticky vytvoří po uzavření spolupráce
                </p>
                {onNavigate && (
                  <Button
                    onClick={() => onNavigate('marketplace')}
                    className="bg-gradient-to-r from-blue-600 to-orange-500"
                  >
                    Prozkoumat marketplace
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {userContracts.map((contract) => {
                  const otherParty = getOtherParty(contract);
                  const project = getProject(contract);

                  return (
                    <Card key={contract.id} className="border-2 hover:border-blue-300 transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg">{contract.contractNumber}</h3>
                                  {getStatusBadge(contract.status)}
                                </div>
                                <p className="text-gray-600 mb-2">{project?.title}</p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Podepsáno: {formatDate(contract.signedAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Deadline: {formatDate(contract.deadline)}</span>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <span className="text-sm text-gray-600">Partner: </span>
                                  <span className="text-sm font-medium">
                                    {otherParty?.firstName} {otherParty?.lastName}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-semibold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
                                  {formatCurrency(contract.price * (1 + contract.vat / 100), contract.currency)}
                                </span>
                                <span className="text-sm text-gray-600">
                                  (včetně {contract.vat}% DPH)
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 lg:w-48">
                            <Button
                              variant="outline"
                              onClick={() => handlePreview(contract)}
                              className="w-full"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Náhled
                            </Button>
                            <Button
                              onClick={() => handleDownloadPDF(contract)}
                              className="bg-gradient-to-r from-blue-600 to-orange-500 w-full"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Stáhnout PDF
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contract Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Náhled smlouvy</DialogTitle>
            <DialogDescription>
              Detailní náhled smlouvy o spolupráci s možností stažení v PDF formátu
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <ScrollArea className="h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center pb-6 border-b">
                  <h2 className="text-2xl mb-2">SMLOUVA O SPOLUPRÁCI</h2>
                  <p className="text-gray-600">Číslo smlouvy: {selectedContract.contractNumber}</p>
                  {getStatusBadge(selectedContract.status)}
                </div>

                {/* Parties */}
                <div>
                  <h3 className="mb-3">Smluvní strany</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-2">Talent</p>
                        <p className="font-medium">
                          {mockUsers.find(u => u.id === selectedContract.talentId)?.firstName}{' '}
                          {mockUsers.find(u => u.id === selectedContract.talentId)?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {mockUsers.find(u => u.id === selectedContract.talentId)?.email}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-2">Firma</p>
                        <p className="font-medium">
                          {mockUsers.find(u => u.id === selectedContract.companyId)?.firstName}{' '}
                          {mockUsers.find(u => u.id === selectedContract.companyId)?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {mockUsers.find(u => u.id === selectedContract.companyId)?.email}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                {/* Project Description */}
                <div>
                  <h3 className="mb-3">Předmět smlouvy</h3>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-gray-700">{selectedContract.projectDescription}</p>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Deliverables */}
                <div>
                  <h3 className="mb-3">Dodávky (Deliverables)</h3>
                  <Card>
                    <CardContent className="p-4">
                      <ul className="space-y-2">
                        {selectedContract.deliverables.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Financial Terms */}
                <div>
                  <h3 className="mb-3">Finanční podmínky</h3>
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cena bez DPH:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedContract.price, selectedContract.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">DPH ({selectedContract.vat}%):</span>
                        <span className="font-medium">
                          {formatCurrency(selectedContract.price * selectedContract.vat / 100, selectedContract.currency)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-medium">Celková cena:</span>
                        <span className="text-xl font-semibold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
                          {formatCurrency(selectedContract.price * (1 + selectedContract.vat / 100), selectedContract.currency)}
                        </span>
                      </div>
                      <Separator />
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">{selectedContract.paymentTerms}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Deadline */}
                <div>
                  <h3 className="mb-3">Termín plnění</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span>Deadline: <strong>{formatDate(selectedContract.deadline)}</strong></span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Signatures */}
                <div>
                  <h3 className="mb-3">Digitální podpisy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-2">Talent</p>
                        <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                          {selectedContract.talentSignature}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-2">Firma</p>
                        <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                          {selectedContract.companySignature}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                {/* Footer */}
                <div className="text-center text-sm text-gray-600 pt-4">
                  <p>Smlouva uzavřena dne: {formatDate(selectedContract.signedAt)}</p>
                  <p>Tato smlouva je právně závazným dokumentem podle českého práva.</p>
                  <p className="mt-2">Vygenerováno z platformy Collabio</p>
                </div>
              </div>
            </ScrollArea>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Zavřít
            </Button>
            {selectedContract && (
              <Button
                onClick={() => handleDownloadPDF(selectedContract)}
                className="bg-gradient-to-r from-blue-600 to-orange-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Stáhnout PDF
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
