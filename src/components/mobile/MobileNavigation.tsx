import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Library, Heart, Upload, User, List, Settings, MoreHorizontal, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export const MobileNavigation: React.FC = () => {
  const { impact } = useHapticFeedback();
  const { user, profile, signOut } = useAuth();
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

  const handleSignOut = async () => {
    impact('medium');
    await signOut();
    setIsMoreOpen(false);
  };

  const getInitials = (username: string | null, email: string) => {
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
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
            className="w-64 mb-2 bg-background border-border z-[100]"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3 py-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || 'User'} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {profile && getInitials(profile.username, profile.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none text-foreground truncate">
                      {profile?.username || 'User'}
                    </p>
                    {profile?.role === 'admin' && (
                      <Badge variant="default" className="text-xs">Admin</Badge>
                    )}
                  </div>
                  <p className="text-xs leading-none text-muted-foreground truncate mt-1">
                    {profile?.email}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
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
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="flex items-center gap-3 py-3 cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </div>
  );
};