import { useState, useEffect } from 'react';
import { Cookie, X, Settings as SettingsIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

type CookieConsentProps = {
  onNavigate: (page: string) => void;
};

export default function CookieConsent({ onNavigate }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Cookie preferences
  const [necessary, setNecessary] = useState(true); // Always true
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [preferences, setPreferences] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    setShowBanner(false);
    
    // In production, initialize tracking here
    console.log('[Cookies] Accepted all cookies');
  };

  const handleRejectAll = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    setShowBanner(false);
    
    console.log('[Cookies] Rejected optional cookies');
  };

  const handleSavePreferences = () => {
    const consent = {
      necessary,
      analytics,
      marketing,
      preferences,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    setShowSettings(false);
    setShowBanner(false);
    
    console.log('[Cookies] Saved preferences:', consent);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
        <Card className="container mx-auto max-w-4xl shadow-2xl border-2 border-blue-200">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold mb-2">
                  Používáme cookies 🍪
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Používáme cookies pro zajištění základní funkčnosti webu, analýzu návštěvnosti 
                  a personalizaci obsahu. Pokračováním souhlasíte s našimi{' '}
                  <button
                    onClick={() => onNavigate('cookies')}
                    className="text-blue-600 hover:underline"
                  >
                    zásadami používání cookies
                  </button>
                  {' '}a{' '}
                  <button
                    onClick={() => onNavigate('gdpr')}
                    className="text-blue-600 hover:underline"
                  >
                    zpracováním osobních údajů
                  </button>
                  .
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleAcceptAll}
                    className="bg-gradient-to-r from-blue-600 to-orange-500"
                  >
                    Přijmout vše
                  </Button>
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                  >
                    Pouze nezbytné
                  </Button>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="ghost"
                  >
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Nastavení
                  </Button>
                </div>
              </div>

              <button
                onClick={handleRejectAll}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5" />
              Nastavení cookies
            </DialogTitle>
            <DialogDescription>
              Vyberte, jaké cookies chcete povolit. Některé cookies jsou nezbytné 
              pro základní fungování webu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-base font-semibold">Nezbytné cookies</Label>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                    Povinné
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Tyto cookies jsou nezbytné pro základní fungování webu, jako je přihlášení, 
                  bezpečnost a ukládání vašich preferencí.
                </p>
              </div>
              <Switch checked={necessary} disabled />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex-1">
                <Label htmlFor="analytics" className="text-base font-semibold mb-2 block">
                  Analytické cookies
                </Label>
                <p className="text-sm text-gray-600">
                  Pomáhají nám pochopit, jak návštěvníci používají náš web. Sbíráme anonymní 
                  data o návštěvnosti, nejoblíbenějších stránkách a chybách.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Používáme: Google Analytics, Hotjar
                </p>
              </div>
              <Switch
                id="analytics"
                checked={analytics}
                onCheckedChange={setAnalytics}
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex-1">
                <Label htmlFor="marketing" className="text-base font-semibold mb-2 block">
                  Marketingové cookies
                </Label>
                <p className="text-sm text-gray-600">
                  Používají se k zobrazování relevantních reklam a měření jejich účinnosti. 
                  Mohou být nastaveny našimi reklamními partnery.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Používáme: Meta Pixel, Google Ads
                </p>
              </div>
              <Switch
                id="marketing"
                checked={marketing}
                onCheckedChange={setMarketing}
              />
            </div>

            {/* Preference Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex-1">
                <Label htmlFor="preferences" className="text-base font-semibold mb-2 block">
                  Preferenční cookies
                </Label>
                <p className="text-sm text-gray-600">
                  Ukládají vaše předvolby jako jazyk, region, nebo zobrazení. 
                  Umožňují personalizovat váš zážitek na našem webu.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Používáme: Vlastní systém preferencí
                </p>
              </div>
              <Switch
                id="preferences"
                checked={preferences}
                onCheckedChange={setPreferences}
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Informace:</strong> Změnu nastavení cookies můžete kdykoli 
              provést v nastavení prohlížeče nebo v patičce našeho webu.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="flex-1"
            >
              Zrušit
            </Button>
            <Button
              onClick={handleSavePreferences}
              className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500"
            >
              Uložit nastavení
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
