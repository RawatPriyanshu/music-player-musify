import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';

interface MiniPlayerProps {
  onExpand: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const { state, actions } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { impact } = useHapticFeedback();

  if (!state.currentSong) return null;

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    impact('medium');
    if (state.isPlaying) {
      actions.pauseSong();
    } else {
      actions.resumeSong();
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    impact('light');
    actions.nextSong();
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!state.currentSong) return;
    
    impact('light');
    await toggleFavorite(state.currentSong.id);
  };

  const progress = state.duration ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <div className="lg:hidden">
      {/* Progress Bar */}
      <div className="h-0.5 bg-border">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Mini Player Content */}
      <div 
        className="flex items-center p-3 bg-background/95 backdrop-blur-sm cursor-pointer"
        onClick={onExpand}
      >
        {/* Album Art & Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {state.currentSong.cover_url ? (
              <img
                src={state.currentSong.cover_url}
                alt={state.currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {state.currentSong.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm truncate">
              {state.currentSong.title}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {state.currentSong.artist}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            className="h-8 w-8 opacity-70 hover:opacity-100"
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isFavorite(state.currentSong.id) && "fill-red-500 text-red-500"
              )}
            />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayPause}
            className="h-8 w-8"
          >
            {state.isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="h-8 w-8"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};