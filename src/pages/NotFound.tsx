import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Music } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <Music className="w-20 h-20 text-primary mx-auto" />
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground">
            Oops! This track doesn't exist
          </p>
          <p className="text-muted-foreground">
            The page you're looking for seems to have gone offline.
          </p>
        </div>
        
        <Button asChild>
          <a href="/" className="inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
