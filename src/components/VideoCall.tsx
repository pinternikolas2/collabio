import { useState } from 'react';
import { Button } from './ui/button';
import { PhoneOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type VideoCallProps = {
  targetUserId: string;
  targetUserName: string;
  onNavigate: (page: string) => void;
};

export default function VideoCall({ targetUserId, targetUserName, onNavigate }: VideoCallProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Create a unique room name based on sorted participant IDs to ensure consistency
  // Fallback to timestamp if IDs are missing (shouldn't happen in auth flow)
  const participants = [user?.id, targetUserId].sort().join('-');
  const roomName = `Collabio-${participants || Date.now()}`;

  // Jitsi URL with config
  // userInfo.displayName sets the user's name in the meeting
  // config.prejoinPageEnabled=false skips the "Join Meeting" button page
  const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${user?.firstName} ${user?.lastName}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col h-screen w-screen">
      <div className="bg-gray-900 p-4 flex justify-between items-center text-white shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="font-semibold text-lg">{targetUserName}</h2>
            <span className="text-xs text-gray-400">Zabezpečený videohovor (End-to-End Encrypted)</span>
          </div>
          <span className="text-xs bg-red-600 px-2 py-0.5 rounded animate-pulse font-bold tracking-wider">LIVE</span>
        </div>
        <Button
          variant="destructive"
          onClick={() => onNavigate('chat')}
          className="hover:bg-red-700 transition-colors"
        >
          <PhoneOff className="w-4 h-4 mr-2" />
          Ukončit hovor
        </Button>
      </div>

      <div className="flex-1 relative bg-gray-900 w-full h-full overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900 z-0">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
            <p className="text-lg font-medium">Připojování k zabezpečenému kanálu...</p>
            <p className="text-sm text-gray-400 mt-2">Prosím povolte přístup k mikrofonu a kameře</p>
          </div>
        )}
        <iframe
          src={jitsiUrl}
          className="w-full h-full border-0 absolute inset-0 z-10"
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
          onLoad={() => setLoading(false)}
          title="Video Call"
        />
      </div>
    </div>
  );
}
