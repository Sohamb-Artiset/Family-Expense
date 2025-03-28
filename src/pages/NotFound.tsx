
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative z-10">
      <div className="text-center animate-fade-in-up backdrop-blur-sm bg-background/50 p-8 rounded-xl">
        <h1 className="text-5xl font-bold mb-6">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Oops! We couldn't find the page you're looking for.</p>
        <Button asChild>
          <Link to="/dashboard" className="flex items-center">
            <Home className="mr-2 h-4 w-4" /> Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
