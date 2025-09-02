import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ArrowLeft, Play, MoreVertical, Search, Shuffle, ListPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePlaylists, type Playlist } from '@/hooks/usePlaylists';
import { usePlaylistSongs, type PlaylistSong } from '@/hooks/usePlaylistSongs';
import { usePlayer } from '@/contexts/PlayerContext';
import { SortablePlaylistItem } from '@/components/playlist/SortablePlaylistItem';
import { toast } from 'sonner';

const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { actions } = usePlayer();
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { songs, loading: songsLoading, reorderSongs, removeSongFromPlaylist } = usePlaylistSongs(id || null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch playlist details
  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('playlists')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setPlaylist(data);
      } catch (error) {
        console.error('Error fetching playlist:', error);
        toast.error('Failed to load playlist');
        navigate('/playlists');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id, navigate]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = songs.findIndex(song => song.id === active.id);
      const newIndex = songs.findIndex(song => song.id === over.id);

      const newOrder = arrayMove(songs, oldIndex, newIndex);
      reorderSongs(newOrder);
    }
  };

  const handlePlayPlaylist = () => {
    if (songs.length === 0) return;
    
    const songList = songs.map(ps => ({
      id: ps.song.id,
      title: ps.song.title,
      artist: ps.song.artist,
      duration: ps.song.duration,
      cover_url: ps.song.cover_url,
      file_url: ps.song.file_url,
      approved: true,
      uploader_id: '',
      created_at: '',
      play_count: 0,
      report_count: 0
    }));

    actions.playSong(songList[0]);
    if (songList.length > 1) {
      actions.addToQueue(songList.slice(1));
    }
  };

  const handleShufflePlay = () => {
    if (songs.length === 0) return;
    
    const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
    const songList = shuffledSongs.map(ps => ({
      id: ps.song.id,
      title: ps.song.title,
      artist: ps.song.artist,
      duration: ps.song.duration,
      cover_url: ps.song.cover_url,
      file_url: ps.song.file_url,
      approved: true,
      uploader_id: '',
      created_at: '',
      play_count: 0,
      report_count: 0
    }));

    actions.playSong(songList[0]);
    if (songList.length > 1) {
      actions.addToQueue(songList.slice(1));
    }
  };

  const filteredSongs = songs.filter(playlistSong =>
    playlistSong.song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlistSong.song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalDuration = songs.reduce((acc, ps) => acc + ps.song.duration, 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading playlist...</div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Playlist not found</p>
          <Button onClick={() => navigate('/playlists')}>
            Back to Playlists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/playlists')}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center shrink-0">
          {playlist.cover_url ? (
            <img 
              src={playlist.cover_url} 
              alt={playlist.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-6xl font-bold text-primary/60">
              {playlist.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Playlist</p>
            <h1 className="text-4xl font-bold text-foreground">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-muted-foreground mt-2">{playlist.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{songs.length} songs</span>
            <span>•</span>
            <span>{Math.floor(totalDuration / 60)} min</span>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={handlePlayPlaylist}
              disabled={songs.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              <Play className="mr-2 h-4 w-4" />
              Play
            </Button>
            <Button 
              variant="outline" 
              onClick={handleShufflePlay}
              disabled={songs.length === 0}
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Shuffle
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border-border">
                <DropdownMenuItem>
                  <ListPlus className="mr-2 h-4 w-4" />
                  Add to Queue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Search */}
      {songs.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search in playlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
      )}

      {/* Songs List */}
      {songsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading songs...</div>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center py-16">
          {searchQuery ? (
            <div>
              <p className="text-muted-foreground mb-4">No songs found matching "{searchQuery}"</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-4">This playlist is empty</p>
              <Button onClick={() => navigate('/library')}>
                Browse Music Library
              </Button>
            </div>
          )}
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={filteredSongs.map(song => song.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {filteredSongs.map((playlistSong, index) => (
                <SortablePlaylistItem
                  key={playlistSong.id}
                  playlistSong={playlistSong}
                  index={index}
                  onPlay={() => {
                    const songData = {
                      id: playlistSong.song.id,
                      title: playlistSong.song.title,
                      artist: playlistSong.song.artist,
                      duration: playlistSong.song.duration,
                      cover_url: playlistSong.song.cover_url,
                      file_url: playlistSong.song.file_url,
                      approved: true,
                      uploader_id: '',
                      created_at: '',
                      play_count: 0,
                      report_count: 0
                    };
                    actions.playSong(songData);
                  }}
                  onRemove={() => removeSongFromPlaylist(playlistSong.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default PlaylistDetail;