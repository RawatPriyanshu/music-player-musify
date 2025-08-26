import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  position: number;
  added_at: string;
  song: {
    id: string;
    title: string;
    artist: string;
    duration: number;
    cover_url?: string;
    file_url: string;
  };
}

export const usePlaylistSongs = (playlistId: string | null) => {
  const [songs, setSongs] = useState<PlaylistSong[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaylistSongs = useCallback(async () => {
    if (!playlistId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('playlist_songs')
        .select(`
          *,
          song:songs (
            id,
            title,
            artist,
            duration,
            cover_url,
            file_url
          )
        `)
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      if (error) throw error;
      setSongs(data || []);
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
      toast.error('Failed to load playlist songs');
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  const addSongToPlaylist = useCallback(async (songId: string) => {
    if (!playlistId) return false;

    try {
      // Get the highest position in the playlist
      const { data: maxPosition } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = (maxPosition?.[0]?.position || 0) + 1;

      const { error } = await supabase
        .from('playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_id: songId,
          position: nextPosition
        });

      if (error) throw error;

      toast.success('Song added to playlist');
      fetchPlaylistSongs();
      return true;
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      toast.error('Failed to add song to playlist');
      return false;
    }
  }, [playlistId, fetchPlaylistSongs]);

  const removeSongFromPlaylist = useCallback(async (playlistSongId: string) => {
    try {
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('id', playlistSongId);

      if (error) throw error;

      toast.success('Song removed from playlist');
      fetchPlaylistSongs();
      return true;
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      toast.error('Failed to remove song from playlist');
      return false;
    }
  }, [fetchPlaylistSongs]);

  const reorderSongs = useCallback(async (reorderedSongs: PlaylistSong[]) => {
    try {
      const updates = reorderedSongs.map((song, index) => ({
        id: song.id,
        position: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('playlist_songs')
          .update({ position: update.position })
          .eq('id', update.id);

        if (error) throw error;
      }

      setSongs(reorderedSongs.map((song, index) => ({
        ...song,
        position: index + 1
      })));

      toast.success('Playlist order updated');
      return true;
    } catch (error) {
      console.error('Error reordering songs:', error);
      toast.error('Failed to reorder songs');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchPlaylistSongs();
  }, [fetchPlaylistSongs]);

  return {
    songs,
    loading,
    addSongToPlaylist,
    removeSongFromPlaylist,
    reorderSongs,
    refetch: fetchPlaylistSongs
  };
};