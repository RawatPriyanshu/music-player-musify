import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Library, Heart, Upload, User, List, Settings, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const MobileNavigation: React.FC = () => {
  const { impact } = useHapticFeedback();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleNavClick = () => {
    impact('light');
  };

  const handleMoreItemClick = (path: string) => {
    impact('light');
    navigate(path);
    setIsMoreOpen(false);
  };

  // Main navigation items (always visible)
  const mainNavItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Library, label: 'Library', path: '/library' },
    { icon: List, label: 'Playlists', path: '/playlists' },
    { icon: Search, label: 'Search', path: '/search' }
  ];

  // More menu items - grouped together
  const moreMenuItems = [
    { icon: Heart, label: 'Favorites', path: '/favorites' },
    { icon: Upload, label: 'Upload', path: '/upload' },
    ...(profile?.role === 'admin' ? [{ icon: Settings, label: 'Admin', path: '/admin' }] : [])
  ];

  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border lg:hidden">
      <nav className="flex items-center justify-around h-16 px-1">
        {mainNavItems.map(({ icon: Icon, label, path }) => (
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
                  "text-xs font-medium truncate leading-tight",
                  isActive && "text-primary"
                )}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
        
        {/* More Menu */}
        <DropdownMenu open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <DropdownMenuTrigger asChild>
            <button
              onClick={() => impact('light')}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-colors",
                "text-muted-foreground hover:text-primary focus:outline-none",
                isMoreOpen && "text-primary bg-primary/10"
              )}
            >
              <MoreHorizontal className={cn("h-5 w-5 mb-1", isMoreOpen && "text-primary")} />
              <span className={cn(
                "text-xs font-medium truncate leading-tight",
                isMoreOpen && "text-primary"
              )}>
                More
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            side="top"
            className="w-48 mb-2 bg-background border-border z-[100]"
          >
            {moreMenuItems.map(({ icon: Icon, label, path }) => (
              <DropdownMenuItem
                key={path}
                onClick={() => handleMoreItemClick(path)}
                className="flex items-center gap-3 py-3 cursor-pointer"
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </div>
  );
};