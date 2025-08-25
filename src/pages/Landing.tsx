import { Play, Music, Headphones, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthForm from '@/components/AuthForm';
import Navbar from '@/components/Navbar';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-5rem)]">
            
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                  Music for
                  <span className="text-primary block">Everyone</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
                  Discover, stream, and share millions of songs from your favorite artists. 
                  Experience music like never before with Musify.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Play className="w-5 h-5 mr-2" />
                  Start Listening
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Learn More
                </Button>
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Music className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">50M+ Songs</h3>
                    <p className="text-sm text-muted-foreground">Vast music library</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">HD Quality</h3>
                    <p className="text-sm text-muted-foreground">Crystal clear audio</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">100M+ Users</h3>
                    <p className="text-sm text-muted-foreground">Join the community</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Auth Form */}
            <div className="flex justify-center lg:justify-end">
              <AuthForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;