import { Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import UserProfile from './UserProfile';
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, profile } = useAuth();
  const location = useLocation();

  return (
    <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
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
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/dashboard' || location.pathname === '/' 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/library" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/library' 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  Library
                </Link>
                <Link 
                  to="/playlists" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/playlists' 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  Playlists
                </Link>
                <Link 
                  to="/favorites" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/favorites' 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  Favorites
                </Link>
                <Link 
                  to="/upload" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/upload' 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  Upload
                </Link>
                {profile?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/admin') 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Search - Show if authenticated */}
          {user && (
            <GlobalSearchBar />
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