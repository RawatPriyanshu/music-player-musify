import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart, Upload, User, List, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useAuth } from '@/hooks/useAuth';

export const MobileNavigation: React.FC = () => {
  const { impact } = useHapticFeedback();
  const { user, profile } = useAuth();

  const handleNavClick = () => {
    impact('light');
  };

  // Base navigation items for all users (removed Search as it's in header)
  const baseNavItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Library, label: 'Library', path: '/library' },
    { icon: List, label: 'Playlists', path: '/playlists' },
    { icon: Heart, label: 'Favorites', path: '/favorites' }
  ];

  // Admin gets upload and admin access
  const adminNavItems = [
    ...baseNavItems,
    { icon: Upload, label: 'Upload', path: '/upload' },
    { icon: Settings, label: 'Admin', path: '/admin' }
  ];

  // Regular users get upload
  const userNavItems = [
    ...baseNavItems,
    { icon: Upload, label: 'Upload', path: '/upload' }
  ];

  const navItems = profile?.role === 'admin' ? adminNavItems : userNavItems;

  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border lg:hidden">
      <nav className="flex items-center justify-around h-16 px-1">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-colors",
                "text-muted-foreground hover:text-primary",
                isActive && "text-primary bg-primary/10"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("h-4 w-4 mb-1", isActive && "text-primary")} />
                <span className={cn(
                  "text-xs font-medium truncate leading-tight",
                  isActive && "text-primary"
                )}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};