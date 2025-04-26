
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white">
      <h1 className="text-5xl font-bold mb-8 text-gray-900 animate-fade-in">
        Motion Coach
      </h1>
      <Button
        onClick={() => navigate("/login")}
        className="bg-orange-500 hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 text-white font-semibold py-6 px-8 rounded-lg text-lg shadow-lg"
      >
        Get Started
      </Button>
    </div>
  );
};

export default Index;
