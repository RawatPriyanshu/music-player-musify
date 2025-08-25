import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { NowPlaying } from './NowPlaying';

export function PlayerBar() {
  const { state } = usePlayer();

  if (!state.currentSong) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
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
  );
}