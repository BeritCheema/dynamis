
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Basketball, Baseball } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Basketball Shooting",
      description: "Learn proper shooting form with live feedback.",
      iconComponent: Basketball,
      path: "/basketball",
    },
    {
      title: "Throwing",
      description: "Master throwing mechanics across sports.",
      iconComponent: Baseball,
      path: "/throwing",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Learn Movement Skills</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {modules.map((module) => {
          const IconComponent = module.iconComponent;
          return (
            <Card
              key={module.title}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(module.path)}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <IconComponent className="w-8 h-8 text-orange-500" />
                <CardTitle>{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{module.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
