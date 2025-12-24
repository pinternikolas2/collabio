import { useState, useEffect } from 'react';
import { Bell, Check, X, Filter, Trash2, MessageSquare, Briefcase, DollarSign, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { userApi } from '../utils/api';
import { Notification } from '../types';
import { toast } from 'sonner';

type NotificationsProps = {
  onNavigate: (page: string, data?: any) => void;
  userId: string;
};

export default function Notifications({ onNavigate, userId }: NotificationsProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (userId) {
      const unsubscribe = userApi.subscribeToNotifications(userId, (data) => {
        setNotifications(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [userId]);

  const filteredNotifications = notifications.filter((notif) => {
    const matchesReadFilter = filter === 'all' || (filter === 'unread' && !notif.read);
    const matchesTypeFilter = typeFilter === 'all' || notif.type === typeFilter;
    return matchesReadFilter && matchesTypeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await userApi.markNotificationAsRead(id);
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Nepodařilo se označit jako přečtené');
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info("Mazání notifikací bude implementováno později");
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'collaboration':
        return <Briefcase className="w-5 h-5 text-orange-600" />;
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'rating':
        return <Star className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return 'bg-blue-50 border-blue-200';
      case 'collaboration':
        return 'bg-orange-50 border-orange-200';
      case 'payment':
        return 'bg-green-50 border-green-200';
      case 'rating':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Právě teď';
    if (diffMins < 60) return `Před ${diffMins} min`;
    if (diffHours < 24) return `Před ${diffHours} h`;
    if (diffDays < 7) return `Před ${diffDays} dny`;

    return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
              Notifikace
            </h1>
          </div>
          <p className="text-gray-600">
            Přehled všech vašich upozornění
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Celkem</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nepřečtené</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Přečtené</p>
                  <p className="text-2xl font-bold">{notifications.length - unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread')} className="flex-1">
                <TabsList>
                  <TabsTrigger value="all">Všechny</TabsTrigger>
                  <TabsTrigger value="unread">
                    Nepřečtené
                    {unreadCount > 0 && (
                      <Badge className="ml-2 bg-orange-500 text-white">{unreadCount}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2">
                <Button
                  variant={typeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('all')}
                >
                  Vše
                </Button>
                <Button
                  variant={typeFilter === 'message' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('message')}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Zprávy
                </Button>
                <Button
                  variant={typeFilter === 'collaboration' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('collaboration')}
                >
                  <Briefcase className="w-4 h-4 mr-1" />
                  Spolupráce
                </Button>
                <Button
                  variant={typeFilter === 'payment' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('payment')}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Platby
                </Button>
              </div>

              {unreadCount > 0 && (
                <Button variant="ghost" size="sm">
                  <Check className="w-4 h-4 mr-2" />
                  Označit vše jako přečtené
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`hover:shadow-lg transition-all cursor-pointer border-2 ${!notification.read ? getNotificationColor(notification.type) : 'bg-white border-gray-200'
                } ${!notification.read ? 'border-l-4' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${notification.type === 'message' ? 'bg-blue-100' :
                    notification.type === 'collaboration' ? 'bg-orange-100' :
                      notification.type === 'payment' ? 'bg-green-100' :
                        notification.type === 'rating' ? 'bg-yellow-100' :
                          'bg-gray-100'
                    }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold">{notification.title}</h4>
                      {!notification.read && (
                        <Badge className="bg-orange-500 text-white flex-shrink-0">Nové</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.content}</p>
                    <p className="text-xs text-gray-400">{formatDate(notification.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="ghost" size="icon" title="Označit jako přečtené" onClick={(e) => handleMarkAsRead(notification.id, e)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Smazat">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredNotifications.length === 0 && (
            <Card className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Bell className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Žádné notifikace</h3>
              <p className="text-gray-600 mb-4">
                {filter === 'unread'
                  ? 'Nemáte žádné nepřečtené notifikace'
                  : 'Zatím nemáte žádné notifikace'}
              </p>
              <Button
                onClick={() => onNavigate('marketplace')}
                className="bg-gradient-to-r from-blue-600 to-orange-500"
              >
                Prozkoumat marketplace
              </Button>
            </Card>
          )}
        </div>

        {/* Email notification settings */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-orange-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">📧 E-mailová upozornění</h3>
            <p className="text-sm text-gray-700 mb-4">
              Kromě notifikací v aplikaci dostáváte také e-mailová upozornění pro důležité události
              (nové zprávy, změny ve spolupráci, platby).
            </p>
            <Button variant="outline" size="sm">
              Upravit nastavení
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
