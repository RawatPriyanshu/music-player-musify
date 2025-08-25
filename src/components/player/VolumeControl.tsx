import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePlayer } from '@/contexts/PlayerContext';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

export function VolumeControl() {
  const { state, actions } = usePlayer();
  const [previousVolume, setPreviousVolume] = useState(75);

  const getVolumeIcon = () => {
    if (state.volume === 0) return VolumeX;
    if (state.volume < 50) return Volume1;
    return Volume2;
  };

  const toggleMute = () => {
    if (state.volume === 0) {
      actions.setVolume(previousVolume);
    } else {
      setPreviousVolume(state.volume);
      actions.setVolume(0);
    }
  };

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    actions.setVolume(newVolume);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="flex items-center gap-2">
      {/* Desktop volume control */}
      <div className="hidden md:flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="h-8 w-8 p-0 rounded-full hover:bg-accent"
        >
          <VolumeIcon className="h-4 w-4" />
        </Button>
        
        <div className="w-20">
          <Slider
            value={[state.volume]}
            max={100}
            step={1}
            className="cursor-pointer"
            onValueChange={handleVolumeChange}
          />
        </div>
      </div>

      {/* Mobile volume control - popover */}
      <div className="md:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-accent"
            >
              <VolumeIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-3" side="top">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground text-center">
                Volume {state.volume}%
              </div>
              <Slider
                value={[state.volume]}
                max={100}
                step={1}
                orientation="vertical"
                className="h-20 cursor-pointer"
                onValueChange={handleVolumeChange}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="w-full text-xs"
              >
                {state.volume === 0 ? 'Unmute' : 'Mute'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}