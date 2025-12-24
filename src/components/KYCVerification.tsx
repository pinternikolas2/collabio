import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertTriangle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { mockKYCDocuments, mockUsers } from '../data/seedData';
import { VerificationStatus } from '../types';
import { toast } from 'sonner';

type KYCVerificationProps = {
  userId: string;
  userRole: 'talent' | 'company';
  onNavigate?: (page: string) => void;
};

export default function KYCVerification({ userId, userRole, onNavigate }: KYCVerificationProps) {
  const user = mockUsers.find(u => u.id === userId);
  const userDocuments = mockKYCDocuments.filter(doc => doc.userId === userId);

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ico, setIco] = useState(user?.ico || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ověřeno
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Čeká na schválení
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Zamítnuto
          </Badge>
        );
      case 'not_submitted':
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Neodesláno
          </Badge>
        );
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Soubor je příliš velký', {
          description: 'Maximální velikost souboru je 10MB'
        });
        return;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Nepodporovaný formát', {
          description: 'Povolené formáty: PDF, JPG, PNG'
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Vyberte soubor k nahrání');
      return;
    }

    if (userRole === 'company' && (!ico || !companyName)) {
      toast.error('Vyplňte všechny údaje', {
        description: 'Pro firmy je povinné IČO a název společnosti'
      });
      return;
    }

    setUploading(true);

    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      toast.success('Dokument nahrán', {
        description: 'Váš dokument byl úspěšně nahrán a čeká na schválení administrátorem.'
      });
      setSelectedFile(null);

      // Navigate back to profile after successful upload
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('my-profile');
        }
      }, 1500);

      // In production, this would upload to backend
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isFullyVerified = user?.verificationStatus === 'verified';
  const hasPendingDocuments = userDocuments.some(doc => doc.status === 'pending');
  const hasRejectedDocuments = userDocuments.some(doc => doc.status === 'rejected');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          {onNavigate && (
            <Button
              variant="ghost"
              onClick={() => onNavigate('my-profile')}
              className="mb-4"
            >
              ← Zpět na profil
            </Button>
          )}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 via-blue-600 to-orange-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1>Ověření totožnosti (KYC)</h1>
              <p className="text-gray-600">
                Ověřte svou identitu pro plný přístup k platformě
              </p>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {isFullyVerified && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>Účet je plně ověřen!</strong> Můžete využívat všechny funkce platformy včetně escrow plateb a uzavírání smluv.
            </AlertDescription>
          </Alert>
        )}

        {hasPendingDocuments && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              <strong>Dokumenty čekají na schválení.</strong> Obvykle trvá ověření 1-2 pracovní dny. Budeme vás informovat e-mailem.
            </AlertDescription>
          </Alert>
        )}

        {hasRejectedDocuments && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Některé dokumenty byly zamítnuty.</strong> Nahrajte prosím nové dokumenty s lepší kvalitou a čitelností.
            </AlertDescription>
          </Alert>
        )}

        {!isFullyVerified && !hasPendingDocuments && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Účet není ověřen.</strong> Pro využívání všech funkcí platformy je nutné nahrát a ověřit identifikační dokumenty.
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <h2>Nahrát dokumenty</h2>
            <p className="text-gray-600">
              {userRole === 'talent'
                ? 'Talent musí nahrát platný občanský průkaz nebo pas'
                : 'Firma musí nahrát výpis z obchodního rejstříku nebo živnostenský list'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Company specific fields */}
              {userRole === 'company' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ico">IČO *</Label>
                    <Input
                      id="ico"
                      type="text"
                      placeholder="12345678"
                      value={ico}
                      onChange={(e) => setIco(e.target.value)}
                      maxLength={8}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">8 číslic bez mezer</p>
                  </div>
                  <div>
                    <Label htmlFor="companyName">Název společnosti *</Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Název s.r.o."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div>
                <Label htmlFor="document">
                  {userRole === 'talent' ? 'Občanský průkaz / Pas' : 'Výpis z OR / Živnostenský list'}
                </Label>
                <div className="mt-2">
                  <label
                    htmlFor="document"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      {selectedFile ? (
                        <>
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>{selectedFile.name}</strong>
                          </p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Klikněte pro výběr</span> nebo přetáhněte soubor
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, JPG, PNG (max. 10MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      id="document"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600" />
                  Požadavky na dokumenty:
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-6">
                  <li className="list-disc">Dokument musí být platný a čitelný</li>
                  <li className="list-disc">Všechny údaje musí být jasně viditelné</li>
                  <li className="list-disc">Bez ořezu nebo zakrytí jakýchkoliv částí</li>
                  {userRole === 'company' && (
                    <li className="list-disc">IČO v dokumentu se musí shodovat s vyplněným IČO</li>
                  )}
                  <li className="list-disc">Formát: PDF, JPG nebo PNG</li>
                  <li className="list-disc">Maximální velikost: 10 MB</li>
                </ul>
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
              >
                {uploading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Nahrávám...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Nahrát dokument
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Documents */}
        {userDocuments.length > 0 && (
          <Card>
            <CardHeader>
              <h2>Nahrané dokumenty</h2>
              <p className="text-gray-600">Seznam všech vašich nahraných dokumentů</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userDocuments.map((doc) => (
                  <Card key={doc.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm">{doc.fileName}</h3>
                              {getStatusBadge(doc.status)}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              Nahráno: {formatDate(doc.uploadedAt)}
                            </p>
                            {doc.status === 'verified' && doc.reviewedAt && (
                              <p className="text-xs text-green-600">
                                ✓ Ověřeno: {formatDate(doc.reviewedAt)}
                              </p>
                            )}
                            {doc.status === 'rejected' && doc.rejectionReason && (
                              <p className="text-xs text-red-600">
                                ✗ Důvod zamítnutí: {doc.rejectionReason}
                              </p>
                            )}
                            {userRole === 'company' && doc.ico && (
                              <p className="text-xs text-gray-600 mt-1">
                                IČO: {doc.ico} | {doc.companyName}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Box */}
        <Card className="mt-6 border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="mb-2">Ochrana vašich dat</h3>
                <p className="text-sm text-gray-700">
                  Všechny nahrané dokumenty jsou šifrovány a bezpečně uloženy. Přístup k nim mají pouze autorizovaní administrátoři
                  za účelem ověření totožnosti. Dokumenty nejsou sdíleny s třetími stranami a jsou v souladu s GDPR.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        {onNavigate && isFullyVerified && (
          <div className="mt-6 text-center">
            <Button
              onClick={() => onNavigate('my-profile')}
              className="bg-gradient-to-r from-blue-600 to-orange-500"
            >
              Pokračovat na můj profil
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
