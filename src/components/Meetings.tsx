import { useState } from 'react';
import { Calendar, Clock, Video, MapPin, Users, Plus, CheckCircle, XCircle, AlertCircle, ChevronRight, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type MeetingsProps = {
  onNavigate: (page: string, data?: any) => void;
  userId: string;
};

// Mock data removed. In a real application, data would be fetched from the API.
const mockMeetings: any[] = [];

export default function Meetings({ onNavigate, userId }: MeetingsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredMeetings = mockMeetings.filter((meeting) => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || meeting.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const upcomingMeetings = filteredMeetings.filter((m) => m.status === 'upcoming');
  const pastMeetings = filteredMeetings.filter((m) => m.status === 'completed' || m.status === 'cancelled');

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Clock className="w-4 h-4" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const getMeetingTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Videohovor';
      case 'phone':
        return 'Telefonát';
      default:
        return 'Videohovor';
    }
  };

  const getMeetingStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Nadcházející</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Dokončeno</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Zrušeno</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const MeetingCard = ({ meeting }: { meeting: typeof mockMeetings[0] }) => (
    <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-purple-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getMeetingStatusBadge(meeting.status)}
              <Badge variant="outline" className="flex items-center gap-1">
                {getMeetingTypeIcon(meeting.type)}
                {getMeetingTypeLabel(meeting.type)}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold mb-1">{meeting.title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(meeting.date)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {meeting.time} ({meeting.duration} min)
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Účastníci:</span>
          <div className="flex -space-x-2">
            {meeting.participants.map((participant) => (
              <Avatar key={participant.id} className="w-8 h-8 border-2 border-white">
                <AvatarImage src={participant.image} alt={participant.name} />
                <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm text-gray-600">{meeting.participants[0].name}</span>
        </div>

        {meeting.agenda && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm font-medium text-gray-700 mb-1">Agenda:</p>
            <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-2">{meeting.agenda}</p>
          </div>
        )}

        {meeting.status === 'upcoming' && (
          <div className="mt-4 pt-4 border-t flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('video-call', {
                  targetUserId: meeting.participants[0].id,
                  targetUserName: meeting.participants[0].name,
                });
              }}
            >
              {meeting.type === 'video' ? (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Připojit se
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Zavolat
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                // In real app, this would reschedule
              }}
            >
              Přesunout
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-blue-600 bg-clip-text text-transparent">
              Videohovory
            </h1>
          </div>
          <p className="text-gray-600">
            Správa vašich videohovorů a telefonátů na platformě
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex gap-3">
          <Button
            onClick={() => onNavigate('chat')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Domluvit videohovor
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Hledat schůzky..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny typy</SelectItem>
              <SelectItem value="video">Videohovory</SelectItem>
              <SelectItem value="phone">Telefonáty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingMeetings.length}</p>
                  <p className="text-sm text-gray-600">Nadcházející</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockMeetings.filter((m) => m.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Dokončené</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockMeetings.filter((m) => m.type === 'phone').length}
                  </p>
                  <p className="text-sm text-gray-600">Telefonáty</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meetings Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upcoming">
              Nadcházející ({upcomingMeetings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Minulé ({pastMeetings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Žádné nadcházející hovory</h3>
                  <p className="text-gray-600 mb-4">
                    Domluvte si videohovor s vašimi partnery
                  </p>
                  <Button onClick={() => onNavigate('chat')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Domluvit videohovor
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastMeetings.length > 0 ? (
              pastMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Žádné minulé hovory</h3>
                  <p className="text-gray-600">
                    Historie vašich hovorů se zobrazí zde
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
