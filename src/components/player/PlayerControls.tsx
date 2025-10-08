import React from 'react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function PlayerControls() {
  const { state, actions } = usePlayer();

  const handlePlayPause = () => {
    if (state.isLoading) return;
    
    if (state.isPlaying) {
      actions.pauseSong();
    } else {
      actions.resumeSong();
    }
  };

  const getRepeatIcon = () => {
    switch (state.repeatMode) {
      case 'one':
        return Repeat1;
      case 'all':
        return Repeat;
      default:
        return Repeat;
    }
  };

  const RepeatIcon = getRepeatIcon();

  return (
    <div className="flex items-center gap-2 lg:gap-2">
      {/* Shuffle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={actions.toggleShuffle}
        className={cn(
          "h-7 w-7 lg:h-8 lg:w-8 p-0 rounded-full hover:bg-accent",
          state.isShuffled && "text-primary bg-accent"
        )}
      >
        <Shuffle className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
      </Button>

      {/* Previous button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={actions.previousSong}
        disabled={state.queue.length <= 1}
        className="h-7 w-7 lg:h-8 lg:w-8 p-0 rounded-full hover:bg-accent disabled:opacity-50"
      >
        <SkipBack className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
      </Button>

      {/* Play/Pause button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlayPause}
        disabled={state.isLoading}
        className="h-9 w-9 lg:h-10 lg:w-10 p-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {state.isLoading ? (
          <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
        ) : state.isPlaying ? (
          <Pause className="h-4 w-4 lg:h-5 lg:w-5" />
        ) : (
          <Play className="h-4 w-4 lg:h-5 lg:w-5 ml-0.5" />
        )}
      </Button>

      {/* Next button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={actions.nextSong}
        disabled={state.queue.length <= 1}
        className="h-7 w-7 lg:h-8 lg:w-8 p-0 rounded-full hover:bg-accent disabled:opacity-50"
      >
        <SkipForward className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
      </Button>

      {/* Repeat button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={actions.cycleRepeatMode}
        className={cn(
          "h-7 w-7 lg:h-8 lg:w-8 p-0 rounded-full hover:bg-accent",
          state.repeatMode !== 'none' && "text-primary bg-accent"
        )}
      >
        <RepeatIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
      </Button>
    </div>
  );
}