import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart, Upload, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Library, label: 'Library', path: '/library' },
  { icon: Heart, label: 'Favorites', path: '/favorites' },
  { icon: Upload, label: 'Upload', path: '/upload' }
];

export const MobileNavigation: React.FC = () => {
  const { impact } = useHapticFeedback();

  const handleNavClick = () => {
    impact('light');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border lg:hidden">
      <nav className="flex items-center justify-around h-16 px-2">
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
                <Icon className={cn("h-5 w-5 mb-1", isActive && "text-primary")} />
                <span className={cn(
                  "text-xs font-medium truncate",
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