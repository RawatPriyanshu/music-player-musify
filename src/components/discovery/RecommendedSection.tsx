import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Play, MoreHorizontal, Clock, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/hooks/useAuth';
import { Song } from '@/types';

interface RecommendedSong extends Song {
  profiles?: { username: string };
  similarity_score?: number;
}

export const RecommendedSection = () => {
  const [recommendedSongs, setRecommendedSongs] = useState<RecommendedSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { actions } = usePlayer();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRecommendedSongs();
    } else {
      fetchPopularSongs();
    }
  }, [user]);

  const fetchRecommendedSongs = async () => {
    try {
      // Get user's favorite artists
      const { data: favorites } = await supabase
        .from('favorites')
        .select('song_id, songs(artist)')
        .eq('user_id', user!.id);

      if (favorites && favorites.length > 0) {
        const favoriteArtists = [...new Set(
          favorites
            .map(f => f.songs?.artist)
            .filter(Boolean)
        )];

        // Get recommendations based on favorite artists
        const { data: songs } = await supabase
          .from('songs')
          .select('*, profiles(username)')
          .eq('approved', true)
          .in('artist', favoriteArtists)
          .not('id', 'in', `(${favorites.map(f => f.song_id).join(',')})`)
          .order('play_count', { ascending: false })
          .limit(8);

        if (songs && songs.length > 0) {
          setRecommendedSongs(songs);
        } else {
          // Fallback to popular songs if no recommendations
          await fetchPopularSongs();
        }
      } else {
        // Fallback to popular songs if no favorites
        await fetchPopularSongs();
      }
    } catch (error) {
      console.error('Error fetching recommended songs:', error);
      await fetchPopularSongs();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPopularSongs = async () => {
    try {
      const { data: songs } = await supabase
        .from('songs')
        .select('*, profiles(username)')
        .eq('approved', true)
        .order('play_count', { ascending: false })
        .limit(8);

      if (songs) {
        setRecommendedSongs(songs);
      }
    } catch (error) {
      console.error('Error fetching popular songs:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlaySong = (song: RecommendedSong, index: number) => {
    actions.playSong(song, recommendedSongs);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {user ? 'Recommended for You' : 'Popular Songs'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
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
          <Sparkles className="w-5 h-5" />
          {user ? 'Recommended for You' : 'Popular Songs'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedSongs.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 cursor-pointer group transition-colors border border-border/50"
              onClick={() => handlePlaySong(song, index)}
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
                  {song.play_count > 100 && (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Heart className="w-3 h-3" />
                      Popular
                    </div>
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

        {recommendedSongs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recommendations available</p>
            <p className="text-xs mt-2">Like some songs to get personalized recommendations!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};