
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationBar } from "@/components/NavigationBar";
import { ContactForm } from "@/components/ContactForm";
import { Camera, Target, Info, Activity } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <>
      <NavigationBar variant="landing" />
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white pt-16 relative overflow-hidden">
          {/* Abstract background shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -left-48 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
            <div className="absolute top-1/3 -right-48 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          </div>

          <h1 className="text-5xl font-bold mb-4 text-gray-900 animate-fade-in relative z-10">
            Motion Coach
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl text-center px-4 animate-fade-in animation-delay-200">
            Train smarter. Move better. Get real-time feedback on your form.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="bg-orange-500 hover:bg-orange-600 transform hover:scale-105 transition-all duration-200 text-white font-semibold py-6 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl"
          >
            Get Started
          </Button>
        </div>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Turn on your camera", icon: Camera },
                { title: "Select a skill", icon: Target },
                { title: "Follow feedback in real-time", icon: Activity },
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <step.icon className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Step {index + 1}</h3>
                  <p className="text-gray-600">{step.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Info className="w-8 h-8 text-orange-500" />
                  <h2 className="text-3xl font-bold">About Us</h2>
                </div>
                <p className="text-lg text-gray-600">
                  We are dedicated to helping athletes and sports enthusiasts perfect their form and technique through advanced motion analysis and real-time feedback.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="w-64 h-64 bg-orange-100 rounded-full flex items-center justify-center">
                  <Activity className="w-32 h-32 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section id="mission" className="py-20 bg-orange-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center md:order-2">
                <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center">
                  <Target className="w-32 h-32 text-orange-500" />
                </div>
              </div>
              <div className="md:order-1">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-8 h-8 text-orange-500" />
                  <h2 className="text-3xl font-bold">Our Mission</h2>
                </div>
                <p className="text-lg text-gray-600">
                  To democratize access to high-quality sports training through innovative technology, making professional-level coaching available to everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Have questions? We're here to help! Reach out to our team for support and guidance.
            </p>
            <ContactForm />
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
