import { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, Users, Settings, Camera, CameraOff } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

type VideoCallProps = {
  targetUserId: string;
  targetUserName: string;
  onNavigate: (page: string) => void;
};

export default function VideoCall({ targetUserId, targetUserName, onNavigate }: VideoCallProps) {
  const [isCalling, setIsCalling] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    // Simulate call connection after 3 seconds
    const connectTimer = setTimeout(() => {
      setIsCalling(false);
      setIsConnected(true);
      toast.success('Videohovor zahájen', {
        description: `Připojeno s ${targetUserName}`,
      });
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, [targetUserName]);

  useEffect(() => {
    if (!isConnected) return;

    // Call duration counter
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    toast.info('Videohovor ukončen', {
      description: `Délka hovoru: ${formatDuration(callDuration)}`,
    });
    onNavigate('chat');
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast.info(isVideoEnabled ? 'Kamera vypnuta' : 'Kamera zapnuta');
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    toast.info(isAudioEnabled ? 'Mikrofon vypnut' : 'Mikrofon zapnut');
  };

  const toggleScreenShare = () => {
    if (!isScreenSharing) {
      // In real app, this would use navigator.mediaDevices.getDisplayMedia()
      setIsScreenSharing(true);
      toast.success('Sdílení obrazovky zahájeno');
    } else {
      setIsScreenSharing(false);
      toast.info('Sdílení obrazovky ukončeno');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      {/* Video Area */}
      <div className="relative h-full w-full">
        {/* Remote Video (main) */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          {isCalling ? (
            <div className="text-center">
              <Avatar className="w-32 h-32 mx-auto mb-6 ring-4 ring-blue-500 ring-offset-4 ring-offset-gray-900">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUserId}`} />
                <AvatarFallback>{targetUserName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-white mb-2">Volání...</h2>
              <p className="text-gray-400">{targetUserName}</p>
              <div className="mt-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-full animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white text-sm">Čekání na připojení</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full bg-gray-800">
              {/* Placeholder for remote video stream */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isScreenSharing ? (
                  <div className="text-center">
                    <Monitor className="w-24 h-24 text-blue-400 mx-auto mb-4" />
                    <p className="text-white text-lg">Sdílení obrazovky aktivní</p>
                    <p className="text-gray-400 text-sm mt-2">V reálné aplikaci by zde bylo zobrazeno sdílení obrazovky</p>
                  </div>
                ) : (
                  <div className="text-center">
                    {!isVideoEnabled ? (
                      <>
                        <Avatar className="w-40 h-40 mx-auto mb-4">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUserId}`} />
                          <AvatarFallback className="text-4xl">{targetUserName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-white text-xl">{targetUserName}</p>
                        <Badge variant="secondary" className="mt-2">Kamera vypnuta</Badge>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                        <div className="text-center">
                          <Video className="w-24 h-24 text-blue-300 mx-auto mb-4" />
                          <p className="text-white text-lg">Video stream {targetUserName}</p>
                          <p className="text-gray-300 text-sm mt-2">V reálné aplikaci by zde byl živý video přenos</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Call info overlay */}
              <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/50 backdrop-blur-sm px-4 py-3 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">{formatDuration(callDuration)}</span>
              </div>

              {/* Participant info */}
              <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2 text-white">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">2 účastníci</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (small preview) */}
        {isConnected && (
          <div className="absolute bottom-24 right-6 w-64 h-48 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700">
            {isVideoEnabled ? (
              <div className="w-full h-full bg-gradient-to-br from-orange-600 to-blue-600 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-white mx-auto mb-2" />
                  <p className="text-white text-sm">Vaše kamera</p>
                  <p className="text-white/70 text-xs mt-1">V reálné aplikaci by zde byl váš video přenos</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <CameraOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Kamera vypnuta</p>
                </div>
              </div>
            )}
            <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
              Vy
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4">
              {/* Audio toggle */}
              <Button
                size="lg"
                variant={isAudioEnabled ? "secondary" : "destructive"}
                className="rounded-full w-14 h-14"
                onClick={toggleAudio}
                disabled={isCalling}
              >
                {isAudioEnabled ? (
                  <Mic className="w-6 h-6" />
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
              </Button>

              {/* Video toggle */}
              <Button
                size="lg"
                variant={isVideoEnabled ? "secondary" : "destructive"}
                className="rounded-full w-14 h-14"
                onClick={toggleVideo}
                disabled={isCalling}
              >
                {isVideoEnabled ? (
                  <Video className="w-6 h-6" />
                ) : (
                  <VideoOff className="w-6 h-6" />
                )}
              </Button>

              {/* End call */}
              <Button
                size="lg"
                variant="destructive"
                className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700"
                onClick={handleEndCall}
              >
                <PhoneOff className="w-7 h-7" />
              </Button>

              {/* Screen share */}
              <Button
                size="lg"
                variant={isScreenSharing ? "default" : "secondary"}
                className="rounded-full w-14 h-14"
                onClick={toggleScreenShare}
                disabled={isCalling}
              >
                <Monitor className="w-6 h-6" />
              </Button>

              {/* Settings */}
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full w-14 h-14"
                disabled={isCalling}
              >
                <Settings className="w-6 h-6" />
              </Button>
            </div>

            {/* Info notice */}
            <div className="mt-6 text-center">
              <p className="text-white/80 text-sm">
                💡 V produkční verzi by videohovory používaly WebRTC technologii (např. Agora, Twilio Video)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo notice banner */}
      <div className="absolute top-0 left-0 right-0 bg-orange-500 text-white py-2 px-4 text-center text-sm">
        <strong>DEMO REŽIM:</strong> Toto je vizualizace videohovoru. V produkční verzi by používal WebRTC pro skutečné video hovory.
      </div>
    </div>
  );
}
