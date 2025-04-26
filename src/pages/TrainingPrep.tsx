
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationBar } from "@/components/NavigationBar";

const TrainingPrep = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number>(5);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (started && countdown === 0) {
      // Start camera session
      // This will be implemented in the next step
      setStarted(false);
      setCountdown(5);
    }
  }, [countdown, started]);

  return (
    <>
      <NavigationBar variant="dashboard" />
      <div className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-3xl font-bold text-center mb-8">Prepare for Training</h1>
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
          {!started ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Before We Begin</h2>
                <ul className="text-left space-y-3 mb-6">
                  <li>✓ Find a well-lit area</li>
                  <li>✓ Ensure your whole body is visible</li>
                  <li>✓ Clear the space around you</li>
                  <li>✓ Have your basketball ready</li>
                </ul>
              </div>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => setStarted(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Start Countdown
                </Button>
                <Button 
                  onClick={() => navigate('/basketball')}
                  variant="outline"
                >
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="text-6xl font-bold text-orange-500">{countdown}</div>
              <p className="text-lg">Starting camera session...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrainingPrep;
