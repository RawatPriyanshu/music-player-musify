import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { NowPlaying } from './NowPlaying';
import { useFavorites } from '@/hooks/useFavorites';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PlayerBar() {
  const { state } = usePlayer();

  if (!state.currentSong) {
    return null;
  }

  return (
    <>
      {/* Desktop Player Bar */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="px-4 py-3">
          {/* Progress bar - full width on top */}
          <div className="mb-3">
            <ProgressBar />
          </div>
          
          {/* Main player controls */}
          <div className="flex items-center justify-between gap-4">
            {/* Now playing info - left side */}
            <div className="flex-shrink-0 min-w-0 w-1/4">
              <NowPlaying />
            </div>
            
            {/* Player controls - center */}
            <div className="flex-shrink-0">
              <PlayerControls />
            </div>
            
            {/* Volume control - right side */}
            <div className="flex-shrink-0 w-1/4 flex justify-end">
              <VolumeControl />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Player Bar - Spotify Style */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="px-3 py-2">
          {/* Progress bar with time stamps */}
          <div className="mb-2">
            <ProgressBar />
          </div>
          
          {/* Main player row */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Album art + Song info + Heart */}
            <div className="flex items-center gap-2 min-w-0 flex-shrink">
              {/* Album cover */}
              <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                {state.currentSong.cover_url ? (
                  <img
                    src={state.currentSong.cover_url}
                    alt={state.currentSong.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {state.currentSong.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Song info - Hidden on very small screens */}
              <div className="hidden xs:block min-w-0 max-w-[100px]">
                <h4 className="font-medium text-xs truncate">
                  {state.currentSong.title}
                </h4>
                <p className="text-[10px] text-muted-foreground truncate">
                  {state.currentSong.artist}
                </p>
              </div>
              
              {/* Heart button */}
              <MobileFavoriteButton songId={state.currentSong.id} />
            </div>
            
            {/* Center: Player controls */}
            <div className="flex-shrink-0">
              <PlayerControls />
            </div>
            
            {/* Right: Volume */}
            <div className="flex-shrink-0">
              <VolumeControl />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Mobile Favorite Button Component
const MobileFavoriteButton: React.FC<{ songId: string }> = ({ songId }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { impact } = useHapticFeedback();

  const handleFavorite = async () => {
    impact('light');
    await toggleFavorite(songId);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleFavorite}
      className="h-8 w-8 flex-shrink-0"
    >
      <Heart
        className={cn(
          "h-4 w-4",
          isFavorite(songId) && "fill-red-500 text-red-500"
        )}
      />
    </Button>
  );
};