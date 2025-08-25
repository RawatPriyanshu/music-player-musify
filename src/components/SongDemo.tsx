import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePlayer } from '@/contexts/PlayerContext';
import { Play, Pause } from 'lucide-react';
import { Song } from '@/types';

// Demo songs for testing the player
const demoSongs: Song[] = [
  {
    id: '1',
    title: 'Demo Song 1',
    artist: 'Test Artist',
    album: 'Demo Album',
    duration: 180,
    audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Demo Song 2',
    artist: 'Another Artist',
    album: 'Demo Album 2',
    duration: 210,
    audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-06.wav',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Demo Song 3',
    artist: 'Third Artist',
    album: 'Demo Album 3',
    duration: 195,
    audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-07.wav',
    created_at: new Date().toISOString(),
  },
];

export function SongDemo() {
  const { state, actions } = usePlayer();

  const handlePlaySong = (song: Song) => {
    if (state.currentSong?.id === song.id && state.isPlaying) {
      actions.pauseSong();
    } else if (state.currentSong?.id === song.id && !state.isPlaying) {
      actions.resumeSong();
    } else {
      actions.playSong(song, demoSongs);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Demo Songs</h2>
      <p className="text-muted-foreground">
        Click on any song to test the music player functionality. Use keyboard shortcuts:
        <br />
        <strong>Space</strong> - Play/Pause | <strong>Ctrl+→/←</strong> - Next/Previous | <strong>Ctrl+↑/↓</strong> - Volume
      </p>
      
      <div className="grid gap-3">
        {demoSongs.map((song) => {
          const isCurrentSong = state.currentSong?.id === song.id;
          const isPlaying = isCurrentSong && state.isPlaying;
          
          return (
            <Card 
              key={song.id} 
              className={`transition-all hover:shadow-md ${
                isCurrentSong ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant={isCurrentSong ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePlaySong(song)}
                      className="h-10 w-10 rounded-full p-0"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4 ml-0.5" />
                      )}
                    </Button>
                    
                    <div>
                      <h3 className="font-medium">{song.title}</h3>
                      <p className="text-sm text-muted-foreground">{song.artist}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {formatDuration(song.duration)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {state.queue.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Current Queue</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Songs in queue: {state.queue.length}</p>
            <p>Current song: {state.currentIndex + 1} of {state.queue.length}</p>
            <p>Shuffle: {state.isShuffled ? 'On' : 'Off'}</p>
            <p>Repeat: {state.repeatMode}</p>
          </div>
        </div>
      )}
    </div>
  );
}