import { useState } from 'react';
import { Calendar, Clock, Video, MapPin, Users, FileText, X, Plus, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

type ScheduleMeetingProps = {
  targetUserId: string;
  targetUserName: string;
  onNavigate: (page: string) => void;
};

export default function ScheduleMeeting({ targetUserId, targetUserName, onNavigate }: ScheduleMeetingProps) {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingType, setMeetingType] = useState('video');
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');
  const [notes, setNotes] = useState('');
  const [additionalParticipants, setAdditionalParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');

  const handleAddParticipant = () => {
    if (newParticipant.trim() && !additionalParticipants.includes(newParticipant.trim())) {
      setAdditionalParticipants([...additionalParticipants, newParticipant.trim()]);
      setNewParticipant('');
    }
  };

  const handleRemoveParticipant = (participant: string) => {
    setAdditionalParticipants(additionalParticipants.filter((p) => p !== participant));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!meetingTitle || !date || !time) {
      toast.error('Vyplňte všechna povinná pole', {
        description: 'Téma, datum a čas hovoru jsou povinné',
      });
      return;
    }

    // In real app, this would create meeting in database and send calendar invites
    const callType = meetingType === 'video' ? 'videohovor' : 'telefonát';
    toast.success('Hovor naplánován!', {
      description: `${callType.charAt(0).toUpperCase() + callType.slice(1)} s ${targetUserName} byl úspěšně domluven`,
    });

    // Navigate back to chat
    setTimeout(() => {
      onNavigate('chat');
    }, 1500);
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('chat')}
            className="mb-4"
          >
            ← Zpět na chat
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-blue-600 bg-clip-text text-transparent">
              Domluvit videohovor
            </h1>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-300 rounded-lg">
            <Users className="w-5 h-5 text-purple-600" />
            <p className="text-purple-900">
              S: <strong>{targetUserName}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Základní informace</h3>
              <CardDescription>Téma a typ hovoru</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Téma hovoru <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="např. Projednání spolupráce na kampani"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Typ hovoru <span className="text-red-500">*</span>
                </Label>
                <Select value={meetingType} onValueChange={setMeetingType}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        <span>Videohovor na platformě</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Telefonát na platformě</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Datum a čas</h3>
              <CardDescription>Kdy se videohovor uskuteční</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>
                    Datum <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP', { locale: cs }) : 'Vyberte datum'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">
                    Čas <span className="text-red-500">*</span>
                  </Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Vyberte čas" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Délka (minuty)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minut</SelectItem>
                      <SelectItem value="30">30 minut</SelectItem>
                      <SelectItem value="45">45 minut</SelectItem>
                      <SelectItem value="60">1 hodina</SelectItem>
                      <SelectItem value="90">1.5 hodiny</SelectItem>
                      <SelectItem value="120">2 hodiny</SelectItem>
                      <SelectItem value="180">3 hodiny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Participants */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Účastníci</h3>
              <CardDescription>Přidat další účastníky hovoru</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="font-medium">{targetUserName}</span>
                <Badge variant="secondary" className="ml-auto">Hlavní účastník</Badge>
              </div>

              {additionalParticipants.map((participant) => (
                <div key={participant} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span>{participant}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => handleRemoveParticipant(participant)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  placeholder="Email dalšího účastníka"
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddParticipant();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddParticipant}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Agenda & Notes */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Agenda a poznámky</h3>
              <CardDescription>Co chcete probrat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agenda">Témata k probrání</Label>
                <Textarea
                  id="agenda"
                  placeholder="1. Představení projektu&#10;2. Diskuse o podmínkách&#10;3. Timeline&#10;4. Další kroky"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Poznámky</Label>
                <Textarea
                  id="notes"
                  placeholder="Jakékoliv dodatečné informace pro účastníky..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Video className="w-4 h-4 mr-2" />
              Domluvit hovor
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate('chat')}
            >
              Zrušit
            </Button>
          </div>
        </form>

        {/* Info Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-3">
            <Video className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-blue-900 mb-1">Vše probíhá na platformě Collabio:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Videohovory i telefonáty přímo v aplikaci - žádné externí nástroje</li>
                <li>Automatické připomínky 24h a 1h před hovorem (push notifikace + email)</li>
                <li>V čase hovoru kliknete "Připojit se" a hovor se zahájí</li>
                <li>Možnost přesunout nebo zrušit s automatickou notifikací účastníkům</li>
                <li>Export do kalendáře (Google Calendar, Outlook, iCal)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
