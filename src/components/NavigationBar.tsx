
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Info, Flag, Mail } from "lucide-react";

type NavigationBarProps = {
  variant: "landing" | "dashboard";
};

export const NavigationBar = ({ variant }: NavigationBarProps) => {
  const landingLinks = [
    { label: "About", href: "#about", icon: Info },
    { label: "Our Mission", href: "#mission", icon: Flag },
    { label: "Contact Us", href: "#contact", icon: Mail },
  ];

  if (variant === "landing") {
    return (
      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold text-orange-500">
              Motion Coach
            </Link>
            <div className="hidden md:flex space-x-4">
              {landingLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </a>
                );
              })}
              <Link to="/login">
                <Button variant="default" className="bg-orange-500 hover:bg-orange-600">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-2xl font-bold text-orange-500">
              Motion Coach
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">Settings</Button>
            <Button variant="ghost">Profile</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
