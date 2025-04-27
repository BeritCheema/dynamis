
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationBar } from "@/components/NavigationBar";
import VoiceInterface from "@/components/VoiceInterface";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BaseballCoach = () => {
  const navigate = useNavigate();
  const [isSpeaking, setIsSpeaking] = useState(false);

  return (
    <>
      <NavigationBar variant="dashboard" />
      <div className="container mx-auto px-4 py-8 pt-20">
        <Button 
          variant="outline" 
          onClick={() => navigate('/baseball')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Training
        </Button>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold mb-6">Baseball Pitching Coach</h1>
            <p className={`text-gray-600 mb-8 ${isSpeaking ? 'text-primary animate-pulse' : ''}`}>
              {isSpeaking ? 'Coach is speaking...' : 'Start a conversation with your virtual pitching coach'}
            </p>
            
            <VoiceInterface onSpeakingChange={setIsSpeaking} />
          </div>
        </div>
      </div>
    </>
  );
};

export default BaseballCoach;
