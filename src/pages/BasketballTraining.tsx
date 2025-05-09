import { useState } from "react";
import { NavigationBar } from "@/components/NavigationBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BasketballTraining = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleStartTraining = () => {
    navigate('/training-prep');
  };

  const handleTalkToCoach = () => {
    setShowSuccess(true);
    // In a real app, this would open a chat with an AI coach
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <>
      <NavigationBar variant="dashboard" />
      <div className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-3xl font-bold text-center mb-8">Basketball Shooting Training</h1>
        
        {showSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 animate-fade-in">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Feature would be implemented in a real app.</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
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
                Turn on your camera and get real-time feedback on your shooting form.
                Our AI will analyze your technique and provide instant corrections.
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
            onClick={handleTalkToCoach}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <MessageSquare className="w-8 h-8 text-orange-500" />
              <CardTitle>Talk to Coach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Have questions about your technique? Want personalized advice?
                Chat with our AI coach to get customized basketball shooting tips.
              </p>
              <Button 
                className="mt-4 bg-orange-500 hover:bg-orange-600 transition-colors duration-200"
              >
                Start Chat
              </Button>
            </CardContent>
          </Card>
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

export default BasketballTraining;
