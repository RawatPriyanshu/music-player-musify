import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, Play, MoreHorizontal, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePlayer } from '@/contexts/PlayerContext';
import { Song } from '@/types';

interface TrendingSong extends Song {
  profiles?: { username: string };
}

export const TrendingSection = () => {
  const [trendingSongs, setTrendingSongs] = useState<TrendingSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { actions } = usePlayer();

  useEffect(() => {
    fetchTrendingSongs();
  }, []);

  const fetchTrendingSongs = async () => {
    try {
      const { data: songs } = await supabase
        .from('songs')
        .select('*, profiles(username)')
        .eq('approved', true)
        .order('play_count', { ascending: false })
        .limit(20);

      if (songs) {
        setTrendingSongs(songs);
      }
    } catch (error) {
      console.error('Error fetching trending songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlaySong = (song: TrendingSong) => {
    actions.playSong(song, trendingSongs);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="w-16 h-6 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trending Now
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {trendingSongs.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer group transition-colors"
              onClick={() => handlePlaySong(song)}
            >
              {/* Rank */}
              <div className="w-6 text-center">
                <span className={`text-sm font-bold ${
                  index < 3 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}>
                  #{index + 1}
                </span>
              </div>

              {/* Cover Art */}
              <Avatar className="w-12 h-12 rounded-lg">
                <AvatarImage src={song.cover_url || undefined} alt={song.title} />
                <AvatarFallback className="rounded-lg">
                  <Play className="w-4 h-4" />
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
                  <Badge variant="secondary" className="text-xs">
                    {song.play_count} plays
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDuration(song.duration)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.addToQueue([song]);
                  }}
                >
                  Add to Queue
                </Button>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {trendingSongs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No trending songs available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};