
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationBar } from "@/components/NavigationBar";

const Index = () => {
  const navigate = useNavigate();

  return (
    <>
      <NavigationBar variant="landing" />
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white pt-16">
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

        {/* About Section */}
        <section id="about" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">About Us</h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
              We are dedicated to helping athletes and sports enthusiasts perfect their form and technique through advanced motion analysis and real-time feedback.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section id="mission" className="py-20 bg-orange-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Our Mission</h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
              To democratize access to high-quality sports training through innovative technology, making professional-level coaching available to everyone.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
              Have questions? We're here to help! Reach out to our team for support and guidance.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
