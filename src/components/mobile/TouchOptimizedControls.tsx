import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Heart } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';

interface TouchOptimizedControlsProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TouchOptimizedControls: React.FC<TouchOptimizedControlsProps> = ({ 
  className, 
  size = 'md' 
}) => {
  const { state, actions } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { impact, notification } = useHapticFeedback();
  
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout>();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const handleTouchStart = useCallback((buttonId: string, callback: () => void) => {
    return () => {
      setPressedButton(buttonId);
      impact('light');
      
      // Long press handling
      longPressTimer.current = setTimeout(() => {
        impact('medium');
        callback();
      }, 500);
    };
  }, [impact]);

  const handleTouchEnd = useCallback((buttonId: string, callback?: () => void) => {
    return () => {
      setPressedButton(null);
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        // If released before long press, execute normal action
        if (callback) {
          callback();
        }
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (state.isPlaying) {
      actions.pauseSong();
    } else {
      actions.resumeSong();
    }
  };

  const handlePrevious = () => {
    actions.previousSong();
  };

  const handleNext = () => {
    actions.nextSong();
  };

  const handleFavorite = async () => {
    if (!state.currentSong) return;
    
    const success = await toggleFavorite(state.currentSong.id);
    if (success) {
      notification('success');
    }
  };

  const handleSeek = (direction: 'forward' | 'backward') => {
    const seekTime = direction === 'forward' ? 15 : -15;
    actions.seekTo(Math.max(0, state.currentTime + seekTime));
  };

  if (!state.currentSong) return null;

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {/* Previous */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          sizeClasses[size],
          "touch-manipulation select-none transition-transform active:scale-95",
          pressedButton === 'previous' && "scale-95"
        )}
        onTouchStart={handleTouchStart('previous', () => handleSeek('backward'))}
        onTouchEnd={handleTouchEnd('previous', handlePrevious)}
        onMouseDown={handleTouchStart('previous', () => handleSeek('backward'))}
        onMouseUp={handleTouchEnd('previous', handlePrevious)}
        onMouseLeave={() => {
          setPressedButton(null);
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
          }
        }}
      >
        <SkipBack className={iconSizes[size]} />
      </Button>

      {/* Play/Pause */}
      <Button
        size="icon"
        className={cn(
          sizeClasses[size],
          "touch-manipulation select-none bg-primary hover:bg-primary/90 text-primary-foreground transition-transform active:scale-95",
          pressedButton === 'play' && "scale-95"
        )}
        onTouchStart={handleTouchStart('play', handlePlayPause)}
        onTouchEnd={handleTouchEnd('play')}
        onMouseDown={handleTouchStart('play', handlePlayPause)}
        onMouseUp={handleTouchEnd('play')}
        onMouseLeave={() => {
          setPressedButton(null);
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
          }
        }}
      >
        {state.isPlaying ? (
          <Pause className={cn(iconSizes[size])} />
        ) : (
          <Play className={cn(iconSizes[size], "ml-0.5")} />
        )}
      </Button>

      {/* Next */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          sizeClasses[size],
          "touch-manipulation select-none transition-transform active:scale-95",
          pressedButton === 'next' && "scale-95"
        )}
        onTouchStart={handleTouchStart('next', () => handleSeek('forward'))}
        onTouchEnd={handleTouchEnd('next', handleNext)}
        onMouseDown={handleTouchStart('next', () => handleSeek('forward'))}
        onMouseUp={handleTouchEnd('next', handleNext)}
        onMouseLeave={() => {
          setPressedButton(null);
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
          }
        }}
      >
        <SkipForward className={iconSizes[size]} />
      </Button>

      {/* Favorite */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          sizeClasses[size],
          "touch-manipulation select-none transition-transform active:scale-95",
          pressedButton === 'favorite' && "scale-95"
        )}
        onTouchStart={handleTouchStart('favorite', handleFavorite)}
        onTouchEnd={handleTouchEnd('favorite')}
        onMouseDown={handleTouchStart('favorite', handleFavorite)}
        onMouseUp={handleTouchEnd('favorite')}
        onMouseLeave={() => {
          setPressedButton(null);
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
          }
        }}
      >
        <Heart
          className={cn(
            iconSizes[size],
            state.currentSong && isFavorite(state.currentSong.id) && "fill-red-500 text-red-500"
          )}
        />
      </Button>
    </div>
  );
};