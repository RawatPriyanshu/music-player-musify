import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Shuffle, Play, RefreshCw, Clock, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePlayer } from '@/contexts/PlayerContext';
import { Song } from '@/types';

interface RandomSong extends Song {
  profiles?: { username: string };
}

export const RandomDiscoverySection = () => {
  const [randomSongs, setRandomSongs] = useState<RandomSong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { actions } = usePlayer();

  const fetchRandomSongs = async () => {
    setIsLoading(true);
    try {
      // Get random songs using PostgreSQL's RANDOM() function
      const { data: songs } = await supabase
        .from('songs')
        .select('*, profiles(username)')
        .eq('approved', true)
        .order('created_at', { ascending: false }) // Order by something first
        .limit(50); // Get more songs to randomize client-side

      if (songs && songs.length > 0) {
        // Shuffle array client-side and take first 6
        const shuffled = [...songs].sort(() => Math.random() - 0.5).slice(0, 6);
        setRandomSongs(shuffled);
      }
    } catch (error) {
      console.error('Error fetching random songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlaySong = (song: RandomSong) => {
    actions.playSong(song, randomSongs);
  };

  const handleDiscoverNew = () => {
    fetchRandomSongs();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shuffle className="w-5 h-5" />
          Random Discovery
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDiscoverNew}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {randomSongs.length > 0 ? 'Discover More' : 'Discover'}
        </Button>
      </CardHeader>
      <CardContent>
        {randomSongs.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Shuffle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Ready to Discover?</h3>
            <p className="text-muted-foreground mb-4">
              Find amazing songs you might have missed
            </p>
            <Button onClick={handleDiscoverNew} className="flex items-center gap-2">
              <Shuffle className="w-4 h-4" />
              Start Discovering
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-16 h-16 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {randomSongs.length > 0 && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {randomSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer group transition-colors border border-border/30"
                onClick={() => handlePlaySong(song)}
              >
                {/* Cover Art */}
                <Avatar className="w-16 h-16 rounded-lg">
                  <AvatarImage src={song.cover_url || undefined} alt={song.title} />
                  <AvatarFallback className="rounded-lg">
                    <Play className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">
                    {song.title}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {song.artist}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDuration(song.duration)}
                    </div>
                    {song.play_count > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {song.play_count} plays
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.addToQueue([song]);
                    }}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};