import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Play, MoreHorizontal, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePlayer } from '@/contexts/PlayerContext';
import { Song } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface RecentSong extends Song {
  profiles?: { username: string };
}

export const RecentlyAddedSection = () => {
  const [recentSongs, setRecentSongs] = useState<RecentSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { actions } = usePlayer();

  useEffect(() => {
    fetchRecentSongs();
  }, []);

  const fetchRecentSongs = async () => {
    try {
      const { data: songs } = await supabase
        .from('songs')
        .select('*, profiles(username)')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (songs) {
        setRecentSongs(songs);
      }
    } catch (error) {
      console.error('Error fetching recent songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlaySong = (song: RecentSong) => {
    actions.playSong(song, recentSongs);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recently Added
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recently Added
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentSongs.map((song) => (
            <div
              key={song.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer group transition-colors"
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
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(song.created_at), { addSuffix: true })}
                  </span>
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

        {recentSongs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recent songs available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};