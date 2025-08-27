import { Music, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import UserProfile from './UserProfile';

const Navbar = () => {
  const { user, profile } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Music className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Musify</span>
            </div>
          </div>

          {/* Navigation Links - Show if authenticated */}
          {user && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/dashboard" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </a>
                <a href="/library" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Library
                </a>
                <a href="/upload" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Upload
                </a>
                {profile?.role === 'admin' && (
                  <a href="/admin" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Admin
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Search - Show if authenticated */}
          {user && (
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search for songs, artists, or albums..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Right side - Auth dependent */}
          <div className="flex items-center space-x-4">
            {user ? (
              <UserProfile />
            ) : (
              <>
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
                <Button size="sm">
                  Try Free
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;