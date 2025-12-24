import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, ExternalLink, FileText, Database, CreditCard, Mail, Smartphone, Cloud, CheckCircle2, List, Book } from 'lucide-react';

interface DocumentationPageProps {
  onNavigate: (page: string) => void;
}

export default function DocumentationPage({ onNavigate }: DocumentationPageProps) {
  const internalDocs = [
    {
      name: 'SUPABASE_SETUP.md',
      path: '/SUPABASE_SETUP.md',
      icon: Database,
      description: 'Kompletní návod na nastavení Supabase databáze',
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'DEPLOYMENT_GUIDE.md',
      path: '/DEPLOYMENT_GUIDE.md',
      icon: Cloud,
      description: 'Průvodce nasazením aplikace',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'KYC_SYSTEM.md',
      path: '/KYC_SYSTEM.md',
      icon: CheckCircle2,
      description: 'Dokumentace KYC ověřovacího systému',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'CHECKLIST_NAPOJENÍ.md',
      path: '/CHECKLIST_NAPOJENÍ.md',
      icon: List,
      description: 'Checklist pro napojení služeb',
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'CO_CHYBÍ_NAPOJIT.md',
      path: '/CO_CHYBÍ_NAPOJIT.md',
      icon: FileText,
      description: 'Seznam toho, co ještě zbývá napojit',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      name: 'NAVIGACE_NAPOJENI.md',
      path: '/NAVIGACE_NAPOJENI.md',
      icon: Book,
      description: 'Hlavní navigační dokument se všemi odkazy',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const externalServices = [
    {
      name: 'Supabase',
      description: 'Databáze a autentizace',
      icon: Database,
      color: 'from-green-500 to-emerald-500',
      links: [
        { label: 'Dashboard', url: 'https://supabase.com/dashboard' },
        { label: 'Dokumentace', url: 'https://supabase.com/docs' },
        { label: 'Auth Guide', url: 'https://supabase.com/docs/guides/auth' },
        { label: 'Database Guide', url: 'https://supabase.com/docs/guides/database' },
      ]
    },
    {
      name: 'Stripe Connect',
      description: 'Platby a escrow',
      icon: CreditCard,
      color: 'from-purple-500 to-pink-500',
      links: [
        { label: 'Dashboard', url: 'https://dashboard.stripe.com/' },
        { label: 'Connect Docs', url: 'https://stripe.com/docs/connect' },
        { label: 'Identity (KYC)', url: 'https://stripe.com/docs/identity' },
        { label: 'Payment Intents', url: 'https://stripe.com/docs/payments/payment-intents' },
      ]
    },
    {
      name: 'Resend',
      description: 'E-mailové notifikace',
      icon: Mail,
      color: 'from-blue-500 to-cyan-500',
      links: [
        { label: 'Dashboard', url: 'https://resend.com/dashboard' },
        { label: 'Dokumentace', url: 'https://resend.com/docs' },
        { label: 'API Reference', url: 'https://resend.com/docs/api-reference/introduction' },
      ]
    },
    {
      name: 'PWA',
      description: 'Progressive Web App',
      icon: Smartphone,
      color: 'from-orange-500 to-red-500',
      links: [
        { label: 'Web.dev PWA', url: 'https://web.dev/progressive-web-apps/' },
        { label: 'PWA Builder', url: 'https://www.pwabuilder.com/' },
        { label: 'Push Notifications', url: 'https://web.dev/push-notifications-overview/' },
      ]
    },
    {
      name: 'Vercel',
      description: 'Deployment & Hosting',
      icon: Cloud,
      color: 'from-gray-700 to-gray-900',
      links: [
        { label: 'Dashboard', url: 'https://vercel.com/dashboard' },
        { label: 'Dokumentace', url: 'https://vercel.com/docs' },
      ]
    }
  ];

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const viewFile = (path: string) => {
    // Pro lokální soubory - otevřeme v novém okně
    window.open(path, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('landing')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět
          </Button>

          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-900 via-blue-600 to-orange-500 flex items-center justify-center shadow-2xl mx-auto mb-4">
              <Book className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 via-blue-600 to-orange-500 bg-clip-text text-transparent mb-2">
              Dokumentace a návody
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Všechny návody, dokumentace a odkazy pro napojení Collabio na produkční služby
            </p>
          </div>
        </div>

        {/* Internal Documentation */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            Interní dokumentace
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {internalDocs.map((doc) => {
              const Icon = doc.icon;
              return (
                <Card key={doc.path} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${doc.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-base">{doc.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {doc.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => viewFile(doc.path)}
                      className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                      size="sm"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Zobrazit návod
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* External Services */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <ExternalLink className="w-6 h-6 text-orange-600" />
            Externí služby
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {externalServices.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <CardTitle>{service.name}</CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {service.links.map((link) => (
                        <Button
                          key={link.url}
                          onClick={() => openInNewTab(link.url)}
                          variant="outline"
                          className="w-full justify-between hover:bg-blue-50 hover:border-blue-300"
                          size="sm"
                        >
                          <span>{link.label}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">🚀 Rychlý start</h3>
          <div className="space-y-3 text-white/90">
            <p className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">1</span>
              <span>Začněte s <strong>SUPABASE_SETUP.md</strong> - vytvořte databázi</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">2</span>
              <span>Zaregistrujte se na <strong>Stripe</strong> a <strong>Resend</strong></span>
            </p>
            <p className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">3</span>
              <span>Zkontrolujte <strong>CHECKLIST_NAPOJENÍ.md</strong> pro kompletní seznam</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">4</span>
              <span>Nasaďte pomocí <strong>DEPLOYMENT_GUIDE.md</strong></span>
            </p>
          </div>
        </div>

        {/* Environment Variables Helper */}
        <Card className="mt-8 border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Environment Variables
            </CardTitle>
            <CardDescription>
              Nezapomeňte vytvořit soubor <code className="bg-white px-2 py-1 rounded">.env.local</code> s těmito proměnnými
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <pre>{`# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Resend
RESEND_API_KEY=re_...

# App
VITE_APP_URL=https://collabio.cz`}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
