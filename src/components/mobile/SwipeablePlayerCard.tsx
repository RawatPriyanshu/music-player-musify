import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Heart, MoreVertical } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Song } from '@/types';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/utils/fileValidator';

interface SwipeablePlayerCardProps {
  song: Song;
  onPlay: () => void;
  className?: string;
}

export const SwipeablePlayerCard: React.FC<SwipeablePlayerCardProps> = ({
  song,
  onPlay,
  className
}) => {
  const { state } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { impact } = useHapticFeedback();
  
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isCurrentSong = state.currentSong?.id === song.id;
  const isPlaying = isCurrentSong && state.isPlaying;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
    impact('light');
  }, [impact]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const diff = touch.clientX - startX;
    
    // Only allow left swipe
    if (diff < 0) {
      setCurrentX(Math.max(diff, -80));
    }
  }, [isDragging, startX]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    
    if (currentX <= -40) {
      setCurrentX(-80);
      setIsRevealed(true);
      impact('medium');
    } else {
      setCurrentX(0);
      setIsRevealed(false);
    }
  }, [currentX, impact]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    impact('medium');
    await toggleFavorite(song.id);
  };

  const resetPosition = () => {
    setCurrentX(0);
    setIsRevealed(false);
  };

  const cardStyle = {
    transform: `translateX(${currentX}px)`,
    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
  };

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Hidden Actions */}
      <div className="absolute right-0 top-0 h-full w-20 bg-red-500 flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavorite}
          className="h-12 w-12 text-white hover:bg-white/20"
        >
          <Heart
            className={cn(
              "h-6 w-6",
              isFavorite(song.id) && "fill-current"
            )}
          />
        </Button>
      </div>

      {/* Main Card */}
      <div
        ref={cardRef}
        className="flex items-center space-x-4 p-4 bg-card rounded-lg cursor-pointer touch-manipulation"
        style={cardStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={resetPosition}
      >
        {/* Album Art */}
        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
          {song.cover_url ? (
            <img
              src={song.cover_url}
              alt={`${song.title} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {song.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-medium text-base mb-1 truncate",
            isCurrentSong && "text-primary"
          )}>
            {song.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate mb-1">
            {song.artist}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDuration(song.duration)}
          </p>
        </div>

        {/* Play Button */}
        <Button
          variant={isCurrentSong ? "default" : "ghost"}
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className={cn(
            "h-12 w-12 rounded-full flex-shrink-0",
            isCurrentSong && "bg-primary text-primary-foreground"
          )}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        {/* More Options */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-60 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};