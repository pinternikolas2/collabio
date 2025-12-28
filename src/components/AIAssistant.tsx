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
import { userApi } from '../utils/api';

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
  const [userName, setUserName] = useState<string>('uživateli');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserName = async () => {
      if (userId) {
        try {
          const user = await userApi.getUser(userId);
          if (user) {
            setUserName(user.firstName || user.companyName || 'uživateli');
          }
        } catch (error) {
          console.error('Failed to fetch user name', error);
        }
      }
    };
    fetchUserName();
  }, [userId]);

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
  }, [isOpen, activeMode, userName]); // Added userName dependency

  const getWelcomeMessage = () => {
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
          text: `Vítejte na Collabio! 💬\n\nJsem váš AI asistent připravený odpovědět na otázky o platformě, vysvětlit, jak funguje propojení talentů a firem, nebo poradit s čímkoliv ohledně spolupráce.\n\nJak vám mohu pomoci?`,
          suggestions: [
            'Jak funguje Collabio?',
            'Jak se registrovat?',
            'Co je to escrow platba?',
            'Jaké jsou poplatky?'
          ]
        };
    }
  };

  // Removed getAIResponse mock function


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
      // Import dynamically
      const { aiApi } = await import('../utils/api');

      // Use current user ID or anonymous
      const currentUserId = userId || 'anonymous';

      // 1. Send query to Firestore
      const { id: docId } = await aiApi.sendAIQuery(currentUserId, userMessage.content, messages);

      // 2. Listen for response from Gemini Extension
      // The extension will update the document with a 'response' field
      const { doc, onSnapshot } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');

      const unsubscribe = onSnapshot(doc(db, 'ai_messages', docId), (docSnap) => {
        const data = docSnap.data();

        // Check if response exists (field name depends on extension config, usually 'response')
        if (data && data.response) {
          const aiText = data.response; // Assuming simple text or need parsing

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiText,
            timestamp: new Date(),
            suggestions: []
          };

          setMessages(prev => [...prev, aiMessage]);
          setIsTyping(false);
          unsubscribe(); // Stop listening once we have the answer
        } else if (data && data.status && data.status.state === 'ERRORED') {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Omlouvám se, došlo k chybě při generování odpovědi.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsTyping(false);
          unsubscribe();
        }
      });

      // Safety timeout in case extension doesn't respond
      setTimeout(() => {
        if (isTyping) {
          // check if we still typing (meaning no response yet)
          // But state might be stale in timeout closure, need ref or simpler check
          // purely fallback
        }
      }, 30000);

    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Omlouvám se, nepodařilo se odeslat zprávu. Zkontrolujte připojení.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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
