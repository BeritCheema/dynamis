import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationBar } from "@/components/NavigationBar";
import VoiceInterface from "@/components/VoiceInterface";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react"; // Avatar icon

const BaseballCoach = () => {
  const navigate = useNavigate();
  const [isSpeaking, setIsSpeaking] = useState(false);

  return (
    <>
      <NavigationBar variant="dashboard" />
      <div className="relative container mx-auto px-4 py-8 pt-20">
        {/* Background */}
        <div className="absolute inset-0 opacity-10 bg-[url('/baseball-bg.svg')] bg-cover bg-center z-0"></div>

        <Button
          variant="outline"
          onClick={() => navigate('/baseball')}
          className="mb-8 relative z-10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Training
        </Button>

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="bg-white rounded-lg shadow-2xl p-8 text-center animate-fadeIn">
            {/* Bouncing Coach Avatar */}
            <div className="flex justify-center mb-6">
              <div className={`p-4 bg-blue-100 rounded-full ${isSpeaking ? "animate-bounce" : ""}`}>
                <UserRound className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <h1 className="text-3xl font-extrabold mb-6 tracking-tight text-gray-800">
              Baseball Pitching Coach
            </h1>

            <p className={`text-gray-600 mb-6 transition-all duration-300 ${isSpeaking ? 'text-blue-600 animate-pulse' : ''}`}>
              {isSpeaking ? '⚡ Coach is giving feedback...' : '🎤 Talk to your virtual pitching coach'}
            </p>

            <div className="flex justify-center mb-6">
              <VoiceInterface onSpeakingChange={setIsSpeaking} />
            </div>

            {/* Tips */}
            <div className="mt-6 space-y-3 text-sm text-gray-500">
              <p>💬 Try saying: "How can I improve my fastball?"</p>
              <p>🏆 Ask: "What's my biggest mistake in my throw?"</p>
              <p>🎯 Ask for drills: "Give me a quick shoulder warmup."</p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default BaseballCoach;
