
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CoachConversation } from '@/utils/RealtimeAudio';
import { useToast } from '@/components/ui/use-toast';

interface CoachConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CoachConversationDialog: React.FC<CoachConversationDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [conversation, setConversation] = useState<CoachConversation | null>(null);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('');
  const [textMessage, setTextMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (open && !conversation) {
      startConversation();
    }
    
    return () => {
      if (conversation) {
        conversation.stop();
      }
    };
  }, [open]);

  const startConversation = async () => {
    setIsConnecting(true);
    
    try {
      const coach = new CoachConversation(
        (text) => setTranscript(text),
        (status) => setStatus(status)
      );
      
      await coach.start();
      setConversation(coach);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to the coach. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    if (conversation) {
      conversation.stop();
      setConversation(null);
    }
    setTranscript('');
    setTextMessage('');
    onOpenChange(false);
  };

  const sendTextMessage = () => {
    if (conversation && textMessage.trim()) {
      conversation.sendMessage(textMessage.trim());
      setTextMessage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Baseball Pitching Coach</span>
            <div className={`h-2 w-2 rounded-full ${status === 'Connected to coach' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {status}
          </div>
          
          {isConnecting ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              <div className="bg-muted p-4 rounded-md h-[200px] overflow-y-auto">
                <p className="whitespace-pre-wrap">{transcript || "The coach is listening..."}</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Textarea 
                  placeholder="Type your message here..."
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value)}
                  className="resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendTextMessage();
                    }
                  }}
                />
                <Button onClick={sendTextMessage}>Send Message</Button>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
