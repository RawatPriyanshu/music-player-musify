import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { MobileNavigation } from './MobileNavigation';
import { MiniPlayer } from './MiniPlayer';
import { MobilePlayer } from './MobilePlayer';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { usePlayer } from '@/contexts/PlayerContext';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children?: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const { state } = usePlayer();
  const { impact } = useHapticFeedback();
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll to show/hide navigation
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 0);
      lastScrollY = scrollY;
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    const handleScroll = () => requestTick();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleExpandPlayer = () => {
    impact('medium');
    setIsPlayerOpen(true);
  };

  const handleClosePlayer = () => {
    impact('light');
    setIsPlayerOpen(false);
  };

  return (
    <div className="min-h-screen bg-background lg:hidden">
      {/* Main Content */}
      <main className={cn(
        "pb-20", // Space for bottom navigation
        state.currentSong && "pb-32" // Extra space for mini player
      )}>
        {children || <Outlet />}
      </main>

      {/* Mini Player */}
      {state.currentSong && !isPlayerOpen && (
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border">
          <MiniPlayer onExpand={handleExpandPlayer} />
        </div>
      )}

      {/* Bottom Navigation */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-200",
        isScrolled && !isPlayerOpen && "translate-y-full",
        "lg:hidden"
      )}>
        <MobileNavigation />
      </div>

      {/* Full Screen Mobile Player */}
      <MobilePlayer 
        isOpen={isPlayerOpen} 
        onClose={handleClosePlayer} 
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};