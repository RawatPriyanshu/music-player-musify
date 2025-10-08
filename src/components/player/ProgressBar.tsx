import React, { useState, useCallback } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Slider } from '@/components/ui/slider';

export function ProgressBar() {
  const { state, actions } = usePlayer();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = isSeeking ? seekValue : state.currentTime;
  const progress = state.duration > 0 ? (currentTime / state.duration) * 100 : 0;

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
    setSeekValue(state.currentTime);
  }, [state.currentTime]);

  const handleSeekChange = useCallback((values: number[]) => {
    const newTime = (values[0] / 100) * state.duration;
    setSeekValue(newTime);
  }, [state.duration]);

  const handleSeekEnd = useCallback(() => {
    setIsSeeking(false);
    actions.seekTo(seekValue);
  }, [actions, seekValue]);

  return (
    <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-muted-foreground">
      {/* Current time */}
      <span className="tabular-nums min-w-[32px] lg:min-w-[40px] text-[10px] lg:text-sm">
        {formatTime(currentTime)}
      </span>
      
      {/* Progress slider */}
      <div className="flex-1">
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          className="w-full cursor-pointer"
          onValueChange={handleSeekChange}
          onPointerDown={handleSeekStart}
          onPointerUp={handleSeekEnd}
        />
      </div>
      
      {/* Duration */}
      <span className="tabular-nums min-w-[32px] lg:min-w-[40px] text-[10px] lg:text-sm">
        {formatTime(state.duration)}
      </span>
    </div>
  );
}