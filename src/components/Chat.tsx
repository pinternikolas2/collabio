import { useState, useEffect, useRef } from 'react';
import { Send, Search, Paperclip, MoreVertical, Briefcase, Video, Calendar, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { chatApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

type ChatProps = {
  userId: string;
  userRole?: string;
  targetUserId?: string;
  targetUserName?: string;
  onNavigate?: (page: string, data?: any) => void;
};

export default function Chat({ userId, userRole, targetUserId, targetUserName, onNavigate }: ChatProps) {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to conversations list
  useEffect(() => {
    const unsubscribe = chatApi.subscribeToChats(userId, (chats) => {
      setConversations(chats);
      setLoading(false);

      // If targetUserId is provided (navigated from profile), find or create chat
      if (targetUserId && !selectedChatId) {
        const existingChat = chats.find(c => c.userId === targetUserId);
        if (existingChat) {
          setSelectedChatId(existingChat.id);
        } else {
          // Initialize new chat for UI purposes (will be created in backend on first message)
          // For now, simpler to just start empty or create it immediately via API
          handleCreateChatIfNeeded(targetUserId);
        }
      }
    });

    return () => unsubscribe();
  }, [userId, targetUserId]);

  // Subscribe to messages when a chat is selected
  useEffect(() => {
    if (!selectedChatId) return;

    const unsubscribe = chatApi.subscribeToMessages(selectedChatId, (msgs) => {
      setMessages(msgs);
      // Mark as read
      chatApi.markAsRead(selectedChatId, userId);
      // Scroll to bottom
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [selectedChatId, userId]);

  const handleCreateChatIfNeeded = async (otherId: string) => {
    try {
      // Check if we already have it in state (though useEffect handles updates)
      const existing = conversations.find(c => c.userId === otherId);
      if (existing) {
        setSelectedChatId(existing.id);
        return;
      }

      // Create new chat
      const { chatId } = await chatApi.createChat(otherId);
      setSelectedChatId(chatId);
    } catch (err) {
      console.error("Error creating chat:", err);
      toast.error("Nepodařilo se zahájit konverzaci");
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChatId) return;

    try {
      const selectedConv = conversations.find(c => c.id === selectedChatId);
      const toUserId = selectedConv?.userId || targetUserId; // Fallback if brand new

      if (!toUserId) {
        console.error("Target user ID missing");
        return;
      }

      await chatApi.sendMessage(toUserId, messageText, selectedChatId);
      setMessageText('');
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Chyba při odesílání zprávy");
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.user?.firstName + ' ' + conv.user?.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = conversations.find((c) => c.id === selectedChatId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
            Zprávy
          </h1>
          <p className="text-gray-600">
            Komunikujte s partnery v reálném čase
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="overflow-hidden shadow-xl">
          <div className="grid grid-cols-12 h-[600px]">
            {/* Conversations List */}
            <div className={`col-span-12 md:col-span-4 border-r bg-gray-50 ${selectedChatId ? 'hidden md:block' : 'block'}`}>
              <CardHeader className="border-b bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Hledat konverzace..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <ScrollArea className="h-[calc(600px-80px)]">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <>
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedChatId(conv.id)}
                        className={`p-4 border-b cursor-pointer transition-colors ${selectedChatId === conv.id
                          ? 'bg-blue-50 border-l-4 border-l-blue-600'
                          : 'hover:bg-gray-100'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conv.user?.profileImage} alt={conv.user?.firstName} />
                            <AvatarFallback>{conv.user?.firstName?.[0]}{conv.user?.lastName?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold truncate">
                                {conv.user?.firstName} {conv.user?.lastName}
                              </p>
                              {conv.unreadCount > 0 && (
                                <Badge className="bg-orange-500 text-white ml-2">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {conv.lastMessage?.content || 'Zatím žádné zprávy'}
                            </p>
                            {conv.updatedAt && (
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(conv.updatedAt).toLocaleString('cs-CZ', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredConversations.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        {searchTerm ? 'Žádné konverzace nenalezeny' : 'Zatím nemáte žádné zprávy'}
                      </div>
                    )}
                  </>
                )}
              </ScrollArea>
            </div>

            {/* Messages Area */}
            <div className={`col-span-12 md:col-span-8 flex flex-col ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Back button for mobile */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedChatId(null)}
                          className="md:hidden flex-shrink-0"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedConversation.user?.profileImage} alt={selectedConversation.user?.firstName} />
                          <AvatarFallback>{selectedConversation.user?.firstName?.[0]}{selectedConversation.user?.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {selectedConversation.user?.firstName} {selectedConversation.user?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedConversation.user?.role === 'talent' ? 'Talent' : 'Firma'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {onNavigate && (
                          <>
                            {/* Video call button - always visible */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onNavigate('video-call', {
                                targetUserId: selectedConversation.userId,
                                targetUserName: `${selectedConversation.user?.firstName} ${selectedConversation.user?.lastName}`
                              })}
                              className="hover:bg-green-50 hover:text-green-600 hover:border-green-400 flex-shrink-0"
                              title="Zahájit videohovor"
                            >
                              <Video className="w-4 h-4" />
                            </Button>

                            {/* Collaborate button - visible on mobile as primary action */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onNavigate('create-project', {
                                targetUserId: selectedConversation.userId,
                                targetUserName: `${selectedConversation.user?.firstName} ${selectedConversation.user?.lastName}`
                              })}
                              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 lg:hidden flex-shrink-0"
                              title="Nabídnout spolupráci"
                            >
                              <Briefcase className="w-4 h-4" />
                            </Button>

                            {/* Desktop version with text */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onNavigate('create-project', {
                                targetUserId: selectedConversation.userId,
                                targetUserName: `${selectedConversation.user?.firstName} ${selectedConversation.user?.lastName}`
                              })}
                              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 hidden lg:flex"
                            >
                              <Briefcase className="w-4 h-4 mr-2" />
                              Nabídnout spolupráci
                            </Button>
                          </>
                        )}

                        {/* Dropdown menu for additional actions */}
                        {onNavigate && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="flex-shrink-0">
                                <MoreVertical className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem
                                onClick={() => onNavigate('schedule-meeting', {
                                  targetUserId: selectedConversation.userId,
                                  targetUserName: `${selectedConversation.user?.firstName} ${selectedConversation.user?.lastName}`
                                })}
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                Domluvit videohovor
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  const profilePage = selectedConversation.user?.role === 'talent' ? 'talent-profile' : 'company-profile';
                                  onNavigate(profilePage, { userId: selectedConversation.userId });
                                }}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Zobrazit profil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwnMessage = message.fromUserId === userId; // Use passed userId or from context
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-3 ${isOwnMessage
                                ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                                }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                  }`}
                              >
                                {message.createdAt ? new Date(message.createdAt).toLocaleTimeString('cs-CZ', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }) : '...'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4 bg-white">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Připojit soubor"
                        onClick={() => {
                          toast.info("Nahrávání souborů do chatu bude funkční po implementaci Storage");
                        }}
                      >
                        <Paperclip className="w-5 h-5" />
                      </Button>
                      <Input
                        placeholder="Napište zprávu..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center">
                      <Send className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold mb-2">Vyberte konverzaci</p>
                    <p className="text-sm">Začněte chatovat s vašimi partnery</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Info */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-orange-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">💬 Real-time komunikace</h3>
            <p className="text-sm text-gray-700">
              Všechny zprávy jsou zasílány v reálném čase. Dostanete e-mailové upozornění při nové zprávě. Konverzace jsou šifrované a bezpečné.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
