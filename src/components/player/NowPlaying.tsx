import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export function NowPlaying() {
  const { state } = usePlayer();

  if (!state.currentSong) {
    return null;
  }

  const { currentSong } = state;

  return (
    <div className="flex items-center gap-3 min-w-0">
      {/* Album cover */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-md bg-muted overflow-hidden">
          {currentSong.cover_url ? (
            <img
              src={currentSong.cover_url}
              alt={`${currentSong.title} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {currentSong.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Song info */}
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-sm truncate">
          {currentSong.title}
        </h3>
        <p className="text-xs text-muted-foreground truncate">
          {currentSong.artist}
        </p>
      </div>

      {/* Favorite button - hidden on very small screens */}
      <div className="flex-shrink-0 hidden sm:block">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full hover:bg-accent"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}