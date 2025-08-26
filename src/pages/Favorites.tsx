import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Search, Shuffle, Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { usePlayer } from '@/contexts/PlayerContext';
import { SongListItem } from '@/components/library/SongListItem';

const Favorites: React.FC = () => {
  const { favorites, loading } = useFavorites();
  const { actions } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFavorites = favorites.filter(favorite =>
    favorite.song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    favorite.song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayAll = () => {
    if (favorites.length === 0) return;
    
    const songList = favorites.map(fav => ({
      id: fav.song.id,
      title: fav.song.title,
      artist: fav.song.artist,
      duration: fav.song.duration,
      artwork_url: fav.song.cover_url,
      audio_url: fav.song.file_url,
      approved: true,
      uploader_id: '',
      created_at: ''
    }));

      actions.playSong(songList[0]);
      if (songList.length > 1) {
        actions.addToQueue(songList.slice(1));
      }
  };

  const handleShufflePlay = () => {
    if (favorites.length === 0) return;
    
    const shuffledFavorites = [...favorites].sort(() => Math.random() - 0.5);
    const songList = shuffledFavorites.map(fav => ({
      id: fav.song.id,
      title: fav.song.title,
      artist: fav.song.artist,
      duration: fav.song.duration,
      artwork_url: fav.song.cover_url,
      audio_url: fav.song.file_url,
      approved: true,
      uploader_id: '',
      created_at: ''
    }));

      actions.playSong(songList[0]);
      if (songList.length > 1) {
        actions.addToQueue(songList.slice(1));
      }
  };

  const totalDuration = favorites.reduce((acc, fav) => acc + fav.song.duration, 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading favorites...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-6">
        <div className="w-48 h-48 bg-gradient-to-br from-red-500/20 to-pink-500/40 rounded-lg flex items-center justify-center shrink-0">
          <Heart className="h-24 w-24 text-red-500 fill-current" />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Playlist</p>
            <h1 className="text-4xl font-bold text-foreground">Liked Songs</h1>
            <p className="text-muted-foreground mt-2">Your favorite tracks all in one place</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{favorites.length} songs</span>
            {favorites.length > 0 && (
              <>
                <span>•</span>
                <span>{Math.floor(totalDuration / 60)} min</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={handlePlayAll}
              disabled={favorites.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              <Play className="mr-2 h-4 w-4" />
              Play
            </Button>
            <Button 
              variant="outline" 
              onClick={handleShufflePlay}
              disabled={favorites.length === 0}
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Shuffle
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      {favorites.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
      )}

      {/* Songs List */}
      {filteredFavorites.length === 0 ? (
        <div className="text-center py-16">
          {searchQuery ? (
            <div>
              <p className="text-muted-foreground mb-4">No favorites found matching "{searchQuery}"</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          ) : (
            <div>
              <Heart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">You haven't liked any songs yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Start building your collection by clicking the heart icon on any song
              </p>
              <Button onClick={() => window.location.href = '/library'}>
                Browse Music Library
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredFavorites.map((favorite, index) => (
              <SongListItem
                key={favorite.id}
                song={{
                  id: favorite.song.id,
                  title: favorite.song.title,
                  artist: favorite.song.artist,
                  duration: favorite.song.duration,
                  artwork_url: favorite.song.cover_url,
                  audio_url: favorite.song.file_url,
                  approved: true,
                  uploader_id: '',
                  created_at: favorite.created_at
                }}
                onPlay={() => {
                  const songData = {
                    id: favorite.song.id,
                    title: favorite.song.title,
                    artist: favorite.song.artist,
                    duration: favorite.song.duration,
                    artwork_url: favorite.song.cover_url,
                    audio_url: favorite.song.file_url,
                    approved: true,
                    uploader_id: '',
                    created_at: ''
                  };
                  actions.playSong(songData);
                }}
              />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;