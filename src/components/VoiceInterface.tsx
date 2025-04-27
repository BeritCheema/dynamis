
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';

interface VoiceInterfaceProps {
  onSpeakingChange: (speaking: boolean) => void;
  onClose?: () => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onSpeakingChange, onClose }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received message:', event);
    
    if (event.type === 'response.audio.delta') {
      onSpeakingChange(true);
    } else if (event.type === 'response.audio.done') {
      onSpeakingChange(false);
    }
  };

  const startConversation = async () => {
    try {
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "Connected",
        description: "Voice interface is ready",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    onSpeakingChange(false);
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {!isConnected ? (
        <Button 
          onClick={startConversation}
          className="bg-primary hover:bg-primary/90 text-white w-full"
        >
          Start Conversation
        </Button>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <p className="text-center text-sm text-muted-foreground">
            Conversation active. Speak to interact with the coach.
          </p>
          <Button 
            onClick={endConversation}
            variant="destructive"
            className="w-full"
          >
            End Conversation
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;
