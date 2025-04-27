import { useState } from "react";
import { NavigationBar } from "@/components/NavigationBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, MessageSquare, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VoiceInterface from "@/components/VoiceInterface";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const BaseballTraining = () => {
  const navigate = useNavigate();
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStartTraining = () => {
    navigate('/pitching');
  };

  const handleTalkToCoach = () => {
    setShowVoiceInterface(true);
  };

  const handleClose = () => {
    setShowVoiceInterface(false);
    setIsDialogOpen(false);
    setIsSpeaking(false);
  };

  return (
    <>
      <NavigationBar variant="dashboard" />
      <div className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-3xl font-bold text-center mb-8">Baseball Pitching Training</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow hover:scale-105"
            onClick={handleStartTraining}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <Dumbbell className="w-8 h-8 text-orange-500" />
              <CardTitle>Start Training</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Turn on your camera and get real-time feedback on your pitching mechanics.
                Our AI will analyze your form and provide instant suggestions.
              </p>
              <Button 
                className="mt-4 bg-orange-500 hover:bg-orange-600 transition-colors duration-200"
              >
                Start Now
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow hover:scale-105"
            onClick={() => navigate('/pitching/learn')}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <BookOpen className="w-8 h-8 text-orange-500" />
              <CardTitle>Learn Pitching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Learn the fundamentals of pitching, including proper grip,
                stance, and mechanics for throwing the perfect pitch.
              </p>
              <Button 
                className="mt-4 bg-orange-500 hover:bg-orange-600 transition-colors duration-200"
              >
                Start Learning
              </Button>
            </CardContent>
          </Card>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow hover:scale-105"
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <MessageSquare className={`w-8 h-8 ${isSpeaking ? 'text-primary animate-pulse' : 'text-orange-500'}`} />
                  <CardTitle>Talk to Coach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Have questions about your pitching technique? Want personalized advice?
                    Chat with our AI coach to get customized baseball pitching tips.
                  </p>
                  <Button 
                    className="mt-4 bg-orange-500 hover:bg-orange-600 transition-colors duration-200"
                  >
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Chat with Baseball Coach</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                {showVoiceInterface && (
                  <VoiceInterface 
                    onSpeakingChange={setIsSpeaking} 
                    onClose={handleClose} 
                  />
                )}
                {!showVoiceInterface && (
                  <Button 
                    onClick={handleTalkToCoach}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Start Conversation
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Button 
          onClick={() => navigate('/dashboard')}
          variant="outline" 
          className="mt-8"
        >
          Back to Dashboard
        </Button>
      </div>
    </>
  );
};

export default BaseballTraining;
