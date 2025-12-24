import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  History,
  HelpCircle,
  Mic,
  MicOff,
  Lightbulb,
  TrendingUp,
  Shield,
  DollarSign,
  Users,
  FileText,
  ChevronDown,
  Star,
  Zap,
  Target,
  Award,
  RefreshCw
} from 'lucide-react';
import { UserRole } from '../types';
import { mockUsers, mockProjects } from '../data/seedData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAssistantProps {
  userId: string | null;
  userRole: UserRole | null;
  onNavigate: (page: string, data?: any) => void;
}

export default function AIAssistant({ userId, userRole, onNavigate }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeMode, setActiveMode] = useState<'talent' | 'company' | 'general'>('general');
  const [showHistory, setShowHistory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl + /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Set initial mode based on user role
  useEffect(() => {
    if (userRole === 'talent') setActiveMode('talent');
    else if (userRole === 'company') setActiveMode('company');
    else setActiveMode('general');
  }, [userRole]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = getWelcomeMessage();
      setMessages([{
        id: '1',
        role: 'assistant',
        content: welcomeMessage.text,
        timestamp: new Date(),
        suggestions: welcomeMessage.suggestions
      }]);
    }
  }, [isOpen, activeMode]);

  const getWelcomeMessage = () => {
    const currentUser = userId ? mockUsers.find(u => u.id === userId) : null;
    const userName = currentUser?.name || 'uživateli';

    switch (activeMode) {
      case 'talent':
        return {
          text: `Dobrý den, ${userName}! 🌟\n\nJsem váš osobní AI poradce pro talenty. Pomohu vám optimalizovat profil, najít zajímavé spolupráce a maximalizovat vaše příležitosti na platformě Collabio.\n\nJak vám mohu dnes pomoci?`,
          suggestions: [
            'Jak optimalizovat můj profil?',
            'Najdi mi vhodné projekty',
            'Jak zvýšit šanci na spolupráci?',
            'Co je KYC a proč je důležité?'
          ]
        };

      case 'company':
        return {
          text: `Dobrý den, ${userName}! 🏢\n\nJsem váš osobní AI poradce pro firmy. Pomohu vám najít ideální talenty, vytvořit efektivní kampaně a zajistit bezpečné platby přes naši escrow službu.\n\nJak vám mohu dnes pomoci?`,
          suggestions: [
            'Najdi mi vhodné talenty',
            'Jak funguje escrow systém?',
            'Jak vytvořit efektivní projekt?',
            'Spočítej ROI kampaně'
          ]
        };

      default:
        return {
          text: `Vítejte na Collabiu! 💬\n\nJsem váš AI asistent připravený odpovědět na otázky o platformě, vysvětlit, jak funguje propojení talentů a firem, nebo poradit s čímkoliv ohledně spolupráce.\n\nJak vám mohu pomoci?`,
          suggestions: [
            'Jak funguje Collabio?',
            'Jak se registrovat?',
            'Co je to escrow platba?',
            'Jaké jsou poplatky?'
          ]
        };
    }
  };

  const getAIResponse = async (userMessage: string): Promise<{ text: string; suggestions?: string[] }> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    const lowerMessage = userMessage.toLowerCase();
    const currentUser = userId ? mockUsers.find(u => u.id === userId) : null;

    // Talent-specific responses
    if (activeMode === 'talent') {
      if (lowerMessage.includes('profil') || lowerMessage.includes('optimalizovat')) {
        return {
          text: `Skvělá otázka! 📸\n\nZde jsou tipy pro optimalizaci vašeho profilu:\n\n✅ **Profesionální fotografie** - Kvalitní profilová fotka zvyšuje šanci na spolupráci o 60%\n\n✅ **Kompletní bio** - Popište svou specializaci, úspěchy a hodnoty\n\n✅ **Portfolio** - Nahrajte 5-10 nejlepších ukázek vaší práce\n\n✅ **Sociální sítě** - Propojte Instagram, TikTok, YouTube\n\n✅ **Ceník** - Nastavte jasné ceny za různé typy spolupráce\n\n✅ **KYC ověření** - ${currentUser?.verificationStatus === 'verified' ? '✓ Váš účet je ověřený!' : 'Dokončete ověření totožnosti'}\n\nChcete, abych vás provedl nastavením některé z těchto částí?`,
          suggestions: [
            'Jak nastavit ceník?',
            'Jaké fotky nahrát?',
            'Pomoc s popisem bio',
            'Co je KYC ověření?'
          ]
        };
      }

      if (lowerMessage.includes('projekt') || lowerMessage.includes('najdi') || lowerMessage.includes('spolupráce')) {
        const relevantProjects = mockProjects.filter(p => p.status === 'active').slice(0, 3);
        return {
          text: `Našel jsem pro vás ${relevantProjects.length} zajímavé projekty! 🎯\n\n${relevantProjects.map((p, i) =>
            `${i + 1}. **${p.title}**\n   Rozpočet: ${p.budget?.toLocaleString('cs-CZ')} Kč\n   Kategorie: ${p.category}\n   ${p.targetRole === 'talent' ? '✓ Hledá talent jako vy!' : ''}`
          ).join('\n\n')}\n\nChcete zobrazit detail některého projektu?`,
          suggestions: relevantProjects.map(p => `Detail: ${p.title}`)
        };
      }

      if (lowerMessage.includes('kyc') || lowerMessage.includes('ověření')) {
        return {
          text: `KYC (Know Your Customer) je proces ověření totožnosti 🛡️\n\n**Proč je důležité:**\n• Ochrana před podvody\n• Buduje důvěru u firem\n• Umožňuje přijímat platby\n• Zvyšuje šanci na spolupráci o 80%\n\n**Co potřebujete:**\n${currentUser?.role === 'talent' ? '• Občanský průkaz nebo pas\n• Čitelný sken/foto (PDF, JPG)\n• Schválení trvá 1-2 dny' : ''}\n\n${currentUser?.verificationStatus === 'verified' ? '✅ **Váš účet je již ověřený!**' : '⚠️ **Váš účet není ověřený** - Doporučuji dokončit nyní'}`,
          suggestions: currentUser?.verificationStatus !== 'verified' ?
            ['Přejít na ověření', 'Co se stane, když neověřím?'] :
            ['Jak zvýšit důvěryhodnost?', 'Tipy na získání spolupráce']
        };
      }

      if (lowerMessage.includes('odpověď') || lowerMessage.includes('nabídka')) {
        return {
          text: `Rád vám pomohu s profesionální odpovědí! ✍️\n\n**Struktura dobré odpovědi:**\n\n1. **Pozdrav a představení**\n   "Dobrý den, děkuji za nabídku..."\n\n2. **Zájem a reference**\n   "Mám zkušenosti s podobnými projekty..."\n\n3. **Konkrétní návrh**\n   "Navrhuji následující řešení..."\n\n4. **Termíny a cena**\n   "Realizace do X dnů za Y Kč"\n\n5. **Výzva k jednání**\n   "Rád si s vámi domluvu detaily..."\n\n**Příklad:**\n"Dobrý den,\nděkuji za nabídku spolupráce! Vaš projekt mě zaujal, protože... [důvod]. Mám zkušenosti s [reference]. Navrhuji [řešení] s realizací do [termín] za [cena] Kč. Rád si domluvíme detaily.\n\nS pozdravem,\n[Vaše jméno]"\n\nChcete, abych vám pomohl napsat konkrétní odpověď?`,
          suggestions: [
            'Generuj odpověď na nabídku',
            'Jak vyjednávat cenu?',
            'Co napsat po první zprávě?'
          ]
        };
      }

      if (lowerMessage.includes('výplata') || lowerMessage.includes('platba') || lowerMessage.includes('stripe')) {
        return {
          text: `Výplaty fungují bezpečně přes Stripe Connect 💰\n\n**Jak to funguje:**\n\n1️⃣ Firma zaplatí do **escrow** (úschova)\n2️⃣ Vy dokončíte projekt\n3️⃣ Firma schválí dokončení\n4️⃣ Peníze se automaticky převedou na váš účet\n\n**Ochrana:**\n• Peníze jsou drženy bezpečně\n• Vypláceno až po schválení\n• Collabio strhne poplatek ${getCurrentFeePercentage()}%\n• V případě sporu řeší admin\n\n**Výplata trvá:** 2-5 pracovních dnů\n\n**Potřebujete:**\n• Ověřený účet (KYC)\n• Bankovní účet v ČR\n• Stripe Connect napojení`,
          suggestions: [
            'Jak nastavit Stripe?',
            'Kolik si Collabio účtuje?',
            'Co když firma neschválí?'
          ]
        };
      }
    }

    // Company-specific responses
    if (activeMode === 'company') {
      if (lowerMessage.includes('talent') || lowerMessage.includes('najdi') || lowerMessage.includes('doporuč')) {
        const talents = mockUsers.filter(u => u.role === 'talent' && u.verificationStatus === 'verified').slice(0, 3);
        return {
          text: `Našel jsem ${talents.length} ověřené talenty pro vás! 🌟\n\n${talents.map((t, i) =>
            `${i + 1}. **${t.name}**\n   Kategorie: ${t.category || 'Diverse'}\n   Rating: ${'⭐'.repeat(Math.floor(t.rating || 5))}\n   ${t.stats?.completedProjects || 0} dokončených projektů`
          ).join('\n\n')}\n\nVšichni jsou KYC ověření a připraveni ke spolupráci. Chcete zobrazit detail některého talentu?`,
          suggestions: talents.map(t => `Zobraz profil: ${t.name}`)
        };
      }

      if (lowerMessage.includes('escrow') || lowerMessage.includes('platba') || lowerMessage.includes('bezpečnost')) {
        return {
          text: `Escrow systém chrání obě strany 🛡️\n\n**Jak funguje pro firmy:**\n\n1️⃣ **Vytvoříte projekt** s rozpočtem\n2️⃣ **Domluvíte spolupráci** s talentem\n3️⃣ **Zaplatíte do escrow** - peníze jsou drženy bezpečně\n4️⃣ **Talent plní projekt**\n5️⃣ **Vy schválíte dokončení** nebo požádáte o revizi\n6️⃣ **Po schválení** se peníze převedou talentovi\n\n**Vaše výhody:**\n✅ Platíte až po dokončení\n✅ Možnost revizí\n✅ Ochrana před podvody\n✅ V případě sporu řeší admin\n✅ Platba přes bezpečný Stripe\n\n**Poplatky:**\n• Marketplace projekty: ${getCurrentFeePercentage()}%\n• Přímé nabídky: nižší poplatek\n• Žádné skryté poplatky`,
          suggestions: [
            'Co když jsem nespokojen?',
            'Jak požádat o revizi?',
            'Spočítej poplatek pro projekt'
          ]
        };
      }

      if (lowerMessage.includes('projekt') || lowerMessage.includes('vytvořit') || lowerMessage.includes('kampaň')) {
        return {
          text: `Pomohu vám vytvořit úspěšný projekt! 📋\n\n**Struktura efektivního projektu:**\n\n1. **Název** - Jasný a atraktivní\n   ❌ "Hledám influencera"\n   ✅ "Instagram kampaň pro fitness značku"\n\n2. **Popis** - Detailní brief\n   • Co potřebujete\n   • Jaký je cíl\n   • Co očekáváte\n\n3. **Rozpočet** - Realistický\n   • Instagram post: 5-15k Kč\n   • Video kampaň: 20-50k Kč\n   • Long-term: 50-200k Kč/měs\n\n4. **Požadavky**\n   • Minimální follower count\n   • Kategorie (sport, beauty, tech...)\n   • Lokace\n\n5. **Termíny** - Jasné deadline\n\nChcete, abych vám pomohl vytvořit projekt krok za krokem?`,
          suggestions: [
            'Vytvoř projekt se mnou',
            'Jaký rozpočet nastavit?',
            'Jak vybrat správného talentu?',
            'Ukázka projektu'
          ]
        };
      }

      if (lowerMessage.includes('roi') || lowerMessage.includes('výsledek') || lowerMessage.includes('spočít')) {
        return {
          text: `Spočítám vám ROI kampaně! 📊\n\n**Kalkulačka ROI:**\n\nVstupní data (příklad):\n• Investice: 50,000 Kč\n• Dosah: 100,000 zobrazení\n• Engagement: 5% (5,000 interakcí)\n• Konverze: 2% (100 zákazníků)\n• Průměrný nákup: 1,000 Kč\n\n**Výpočet:**\n• Tržby: 100 × 1,000 = 100,000 Kč\n• Zisk: 100,000 - 50,000 = 50,000 Kč\n• ROI: (50,000 / 50,000) × 100 = **100%**\n\n**Doporučení:**\n✅ ROI > 100% = Excelentní\n✅ ROI > 50% = Velmi dobrý\n⚠️ ROI < 20% = Optimalizujte\n\nChcete spočítat ROI pro váš konkrétní projekt?`,
          suggestions: [
            'Zadej vlastní čísla',
            'Jaký je průměrný ROI?',
            'Jak zvýšit ROI?'
          ]
        };
      }
    }

    // General responses
    if (lowerMessage.includes('funguje') || lowerMessage.includes('jak') && lowerMessage.includes('collabio')) {
      return {
        text: `Collabio je platforma pro propojení talentů a firem! 🤝\n\n**Pro Talenty:**\n🌟 Vytvořte profil a portfolio\n🌟 Nabídněte své služby\n🌟 Aplikujte na projekty\n🌟 Komunikujte s firmami\n🌟 Přijímejte platby bezpečně\n\n**Pro Firmy:**\n🏢 Hledejte talenty podle kritérií\n🏢 Vytvářejte projekty\n🏢 Platba do escrow (ochrana)\n🏢 Sledujte výsledky\n🏢 Hodnoťte spolupráce\n\n**Bezpečnost:**\n🛡️ KYC ověření totožnosti\n🛡️ Escrow platby přes Stripe\n🛡️ Šifrovaná komunikace\n🛡️ GDPR compliant\n\nChcete vědět víc o něčem konkrétním?`,
        suggestions: [
          'Jak se registrovat?',
          'Kolik to stojí?',
          'Je to bezpečné?',
          'Jaké jsou poplatky?'
        ]
      };
    }

    if (lowerMessage.includes('poplatek') || lowerMessage.includes('cena') || lowerMessage.includes('kolik')) {
      return {
        text: `Transparentní poplatky Collabio 💰\n\n**Progresivní sazba (marketplace projekty):**\n\n| Hodnota projektu | Poplatek |\n|------------------|----------|\n| 0 - 50,000 Kč    | 20%      |\n| 50 - 200,000 Kč  | 15%      |\n| 200 - 500,000 Kč | 10%      |\n| 500,000+ Kč      | 5%       |\n\n**Přímé nabídky:**\n• Nižší poplatky (7-15%)\n• Rychlejší vyřízení\n\n**Bez skrytých poplatků:**\n✅ Registrace ZDARMA\n✅ Procházení marketplace ZDARMA\n✅ Komunikace ZDARMA\n✅ Poplatek jen při úspěšné spolupráci\n\n**Příklad:**\nProjekt za 100,000 Kč:\n• Poplatek: 15% = 15,000 Kč\n• Talent obdrží: 85,000 Kč\n• Firma zaplatí: 100,000 Kč`,
        suggestions: [
          'Spočítej poplatek pro projekt',
          'Proč progresivní sazba?',
          'Jak ušetřit na poplatcích?'
        ]
      };
    }

    if (lowerMessage.includes('registrace') || lowerMessage.includes('registrovat') || lowerMessage.includes('účet')) {
      return {
        text: `Registrace je jednoduchá! 📝\n\n**Krok za krokem:**\n\n1️⃣ **Základní registrace**\n   • Email a heslo\n   • Výběr role (Talent / Firma)\n   • Potvrzení emailu\n\n2️⃣ **Vytvoření profilu**\n   • Základní informace\n   • Profilová fotka\n   • Bio a popis\n\n3️⃣ **KYC Ověření** ⚠️ DŮLEŽITÉ\n   • Talent: Občanský průkaz\n   • Firma: IČO + Výpis z OR\n   • Schválení: 1-2 dny\n\n4️⃣ **Dokončení**\n   • Portfolio (pro talenty)\n   • Propojení plateb (Stripe)\n   • Nastavení preferencí\n\n✅ **Po ověření můžete:**\n• Aplikovat na projekty\n• Vytvářet projekty\n• Komunikovat s ostatními\n• Přijímat/posílat platby\n\nChcete začít registraci?`,
        suggestions: [
          'Přejít na registraci',
          'Co je to KYC?',
          'Jak dlouho trvá schválení?'
        ]
      };
    }

    if (lowerMessage.includes('bezpečn') || lowerMessage.includes('důvěr') || lowerMessage.includes('podvod')) {
      return {
        text: `Bezpečnost je naše priorita! 🔒\n\n**Ochranná opatření:**\n\n🛡️ **KYC Ověření**\n• Všichni uživatelé ověřeni\n• Kontrola dokladů adminy\n• Ochrana před falešnými profily\n\n💰 **Escrow Platby**\n• Peníze drženy bezpečně\n• Vyplaceno až po dokončení\n• Ochrana pro obě strany\n\n🔐 **Technická bezpečnost**\n• SSL šifrování\n• GDPR compliant\n• Pravidelné audity\n• 2FA autentizace\n\n⚖️ **Řešení sporů**\n• Admin mediace\n• Důkazní materiály\n• Spravedlivé rozhodování\n\n📧 **Komunikace**\n• Pouze přes platformu\n• Žádné osobní kontakty viditelné\n• Chat + video hovory\n\n**Statistiky:**\n✅ 99.8% spokojených uživatelů\n✅ 0.2% sporů\n✅ 100% vyřešených případů`,
        suggestions: [
          'Co dělat při podezření?',
          'Jak nahlásit problém?',
          'Pravidla platformy'
        ]
      };
    }

    // Default response with suggestions
    return {
      text: `Omlouvám se, nerozumím přesně vaší otázce. 🤔\n\nMohu vám pomoci s:\n\n${activeMode === 'talent' ?
        '• Optimalizací profilu\n• Hledáním projektů\n• Profesionální komunikací\n• KYC ověřením\n• Výplatami' :
        activeMode === 'company' ?
          '• Hledáním talentů\n• Vytvořením projektu\n• Escrow platbami\n• Výpočtem ROI\n• Marketingovými strategiemi' :
          '• Vysvětlením jak Collabio funguje\n• Informacemi o poplatcích\n• Registrací\n• Bezpečností\n• Obecnými dotazy'
        }\n\nZkuste přeformulovat otázku nebo vyberte z nabídky:`,
      suggestions: getWelcomeMessage().suggestions
    };
  };

  const getCurrentFeePercentage = () => {
    // Simplified fee calculation
    return '15'; // Default marketplace fee
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await getAIResponse(inputValue);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Omlouvám se, došlo k chybě. Zkuste to prosím znovu.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage();
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Hlasové zadávání není podporováno ve vašem prohlížeči.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'cs-CZ';
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert('Chyba při rozpoznávání řeči. Zkuste to znovu.');
    };

    recognition.start();
  };

  const clearHistory = () => {
    setMessages([]);
    const welcomeMessage = getWelcomeMessage();
    setMessages([{
      id: '1',
      role: 'assistant',
      content: welcomeMessage.text,
      timestamp: new Date(),
      suggestions: welcomeMessage.suggestions
    }]);
    setShowHistory(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[60]">
        <div className="relative flex flex-col items-center gap-2">
          {/* Label - shows when not pulsing */}
          {!isOpen && !isPulsing && (
            <div className="absolute -top-12 right-0 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium whitespace-nowrap animate-fade-in border border-white/20">
              AI Poradce
              <div className="absolute -bottom-1 right-6 w-2 h-2 bg-purple-600 rotate-45"></div>
            </div>
          )}

          {/* Animated glow rings */}
          <div className="absolute inset-0 animate-ai-glow">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 opacity-30 blur-xl"></div>
          </div>
          <div className="absolute inset-0 animate-ai-glow-delayed">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 opacity-20 blur-2xl"></div>
          </div>

          {/* Pulsing ring indicator */}
          {isPulsing && (
            <>
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 opacity-40 animate-ping-slow" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 opacity-30 animate-ping-slower" />
            </>
          )}

          <Button
            onClick={() => {
              setIsOpen(true);
              setIsPulsing(false);
            }}
            className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 text-white shadow-2xl hover:shadow-ai-xl hover:scale-110 transition-all duration-300 border-2 border-white/20 backdrop-blur-sm group overflow-hidden"
            title="AI Poradce (Ctrl + /)"
          >
            {/* Animated background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            {/* AI Icon with gradient */}
            <div className="relative z-10">
              <Sparkles className="w-6 h-6 md:w-7 md:h-7 drop-shadow-glow" />
            </div>

            {/* Notification badge */}
            {isPulsing && (
              <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold shadow-lg animate-bounce border-2 border-white">
                AI
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Sidebar Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-[60] flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white p-4 flex items-center justify-between overflow-hidden">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-orange-500/20 animate-ai-header-shine"></div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center shadow-lg animate-ai-icon-float">
                <Sparkles className="w-7 h-7 drop-shadow-lg" />
              </div>
              <div>
                <h2 className="font-semibold flex items-center gap-2">
                  AI Poradce
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 border border-white/30 backdrop-blur">BETA</span>
                </h2>
                <p className="text-xs text-white/90 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Inteligentní asistent Collabio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHistory(!showHistory)}
                className="text-white hover:bg-white/20 relative"
                title="Historie konverzace"
              >
                <History className="w-5 h-5" />
                {messages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-[9px] font-bold border border-white">
                    {messages.length > 9 ? '9+' : messages.length}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHelp(!showHelp)}
                className="text-white hover:bg-white/20"
                title="Nápověda"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="border-b bg-gray-50 p-3">
            <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as any)}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="talent" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Talent
                </TabsTrigger>
                <TabsTrigger value="company" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Firma
                </TabsTrigger>
                <TabsTrigger value="general" className="text-xs">
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Obecné
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Help Panel */}
          {showHelp && (
            <div className="bg-blue-50 border-b p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Rychlá nápověda
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelp(false)}
                  className="h-6 px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="text-xs space-y-1 text-gray-700">
                <p>⌨️ <kbd className="px-1 py-0.5 bg-white rounded text-[10px]">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-white rounded text-[10px]">/</kbd> - Otevřít/zavřít</p>
                <p>🎤 Klikněte na mikrofon pro hlasové zadání</p>
                <p>💡 Klikněte na návrhy pro rychlé odpovědi</p>
                <p>🔄 Přepínejte režimy dle vaší role</p>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden relative">
            <ScrollArea className="h-full absolute inset-0 p-4">
              <div className="space-y-4">
                {/* Welcome message when empty */}
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 flex items-center justify-center shadow-2xl animate-ai-icon-float">
                        <Sparkles className="w-10 h-10 text-white drop-shadow-lg" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center shadow-lg animate-bounce">
                        <span className="text-sm">✨</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-2">
                      Vítejte v AI Poradci Collabio
                    </h3>

                    <p className="text-sm text-gray-600 mb-6 max-w-md">
                      Jsem váš inteligentní asistent, který vám pomůže s navigací, nalezením partnerů,
                      správou projektů a zodpoví všechny vaše otázky o platformě.
                    </p>

                    <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-semibold text-blue-900">Rychlé odpovědi</p>
                            <p className="text-[11px] text-blue-700">Okamžitá pomoc 24/7</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl p-3 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                            <Target className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-semibold text-purple-900">Kontextové rady</p>
                            <p className="text-[11px] text-purple-700">Přizpůsobené vaší roli</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl p-3 border border-orange-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-semibold text-orange-900">Expert na Collabio</p>
                            <p className="text-[11px] text-orange-700">Zná každou funkci platformy</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-xs text-gray-500">
                      💡 Začněte psaním otázky nebo vyberte režim výše
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                        }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-purple-200">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-xs font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">AI Poradce</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">AI</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs opacity-70">Navrhované otázky:</p>
                          {message.suggestions.map((suggestion, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full justify-start text-left text-xs h-auto py-2 bg-white hover:bg-gray-50"
                            >
                              <Zap className="w-3 h-3 mr-2 flex-shrink-0" />
                              <span className="line-clamp-2">{suggestion}</span>
                            </Button>
                          ))}
                        </div>
                      )}

                      <p className="text-[10px] mt-2 opacity-60">
                        {message.timestamp.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-orange-50 border border-purple-200 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center animate-ai-icon-float">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-xs text-gray-600 ml-1">AI přemýšlí...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invisible div for auto-scroll */}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="border-t bg-gray-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Historie ({messages.length} zpráv)
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="h-7 px-2 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Vymazat
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                Konverzace z {new Date().toLocaleDateString('cs-CZ')}
              </p>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t bg-gradient-to-r from-blue-50 via-purple-50 to-orange-50 p-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="💬 Zeptejte se AI Poradce..."
                  className="w-full pr-10 bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  disabled={isTyping}
                />
                <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleVoiceInput}
                disabled={isListening || isTyping}
                className={`${isListening ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white border-red-400 animate-pulse' : 'bg-white border-purple-200 hover:border-purple-400'}`}
                title="Hlasové zadání"
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 hover:shadow-ai-xl transition-all duration-300"
                size="icon"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <p className="text-[10px] text-gray-600">
                  Powered by AI • Ověřte si důležité informace
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
