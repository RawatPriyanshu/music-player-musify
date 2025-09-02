import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  ChevronDown, 
  MoreVertical, 
  Shuffle, 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward, 
  Repeat,
  Volume2,
  Heart,
  Share,
  ListPlus
} from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { formatDuration } from '@/utils/fileValidator';
import { cn } from '@/lib/utils';

interface MobilePlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobilePlayer: React.FC<MobilePlayerProps> = ({ isOpen, onClose }) => {
  const { state, actions } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { impact, notification } = useHapticFeedback();
  const [isDragging, setIsDragging] = useState(false);

  const handlePlayPause = () => {
    impact('medium');
    if (state.isPlaying) {
      actions.pauseSong();
    } else {
      actions.resumeSong();
    }
  };

  const handleNext = () => {
    impact('light');
    actions.nextSong();
  };

  const handlePrevious = () => {
    impact('light');
    actions.previousSong();
  };

  const handleShuffle = () => {
    impact('light');
    actions.toggleShuffle();
  };

  const handleRepeat = () => {
    impact('light');
    actions.cycleRepeatMode();
  };

  const handleFavorite = async () => {
    if (!state.currentSong) return;
    
    impact('medium');
    const success = await toggleFavorite(state.currentSong.id);
    if (success) {
      notification('success');
    }
  };

  const handleSeek = (value: number[]) => {
    if (state.duration) {
      const newTime = (value[0] / 100) * state.duration;
      actions.seekTo(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    actions.setVolume(value[0] / 100);
  };

  const progress = state.duration ? (state.currentTime / state.duration) * 100 : 0;

  if (!state.currentSong || !isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background transition-transform duration-300 lg:hidden",
      isOpen ? "translate-y-0" : "translate-y-full"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
        <div className="text-center flex-1">
          <p className="text-sm text-muted-foreground">Playing from</p>
          <p className="text-sm font-medium">Your Library</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Album Art */}
      <div className="flex-1 flex flex-col justify-center px-8 py-8">
        <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-8 mx-auto max-w-sm w-full shadow-xl">
          {state.currentSong.cover_url ? (
            <img
              src={state.currentSong.cover_url}
              alt={state.currentSong.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-6xl font-bold text-primary/60">
                {state.currentSong.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Song Info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 leading-tight">
            {state.currentSong.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {state.currentSong.artist}
          </p>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            className="h-10 w-10"
          >
            <Heart
              className={cn(
                "h-6 w-6",
                state.currentSong && isFavorite(state.currentSong.id) && "fill-red-500 text-red-500"
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
          >
            <Share className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
          >
            <ListPlus className="h-6 w-6" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-8">
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            onValueCommit={() => setIsDragging(false)}
            className="w-full"
            max={100}
            step={0.1}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatDuration(state.currentTime)}</span>
            <span>{formatDuration(state.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShuffle}
            className={cn(
              "h-12 w-12",
              state.isShuffled && "text-primary"
            )}
          >
            <Shuffle className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="h-12 w-12"
          >
            <SkipBack className="h-6 w-6" />
          </Button>
          
          <Button
            onClick={handlePlayPause}
            size="icon"
            className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {state.isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="h-12 w-12"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRepeat}
            className={cn(
              "h-12 w-12",
              state.repeatMode !== 'none' && "text-primary"
            )}
          >
            <Repeat className="h-6 w-6" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <Slider
            value={[state.volume * 100]}
            onValueChange={handleVolumeChange}
            className="flex-1"
            max={100}
            step={1}
          />
        </div>
      </div>
    </div>
  );
};