import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover_url?: string;
  user_id: string;
  created_at: string;
  song_count?: number;
  total_duration?: number;
}


export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPlaylists = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_songs (
            id,
            song:songs (
              duration
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const playlistsWithStats = data.map(playlist => ({
        ...playlist,
        song_count: playlist.playlist_songs?.length || 0,
        total_duration: playlist.playlist_songs?.reduce((acc, ps) => 
          acc + (ps.song?.duration || 0), 0
        ) || 0
      }));

      setPlaylists(playlistsWithStats);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createPlaylist = useCallback(async (name: string, description?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          name,
          description,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Playlist created successfully');
      fetchPlaylists();
      return data;
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Failed to create playlist');
      return null;
    }
  }, [user, fetchPlaylists]);

  const updatePlaylist = useCallback(async (
    playlistId: string, 
    updates: { name?: string; description?: string; cover_url?: string }
  ) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .update(updates)
        .eq('id', playlistId);

      if (error) throw error;

      toast.success('Playlist updated successfully');
      fetchPlaylists();
      return true;
    } catch (error) {
      console.error('Error updating playlist:', error);
      toast.error('Failed to update playlist');
      return false;
    }
  }, [fetchPlaylists]);

  const deletePlaylist = useCallback(async (playlistId: string) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;

      toast.success('Playlist deleted successfully');
      fetchPlaylists();
      return true;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error('Failed to delete playlist');
      return false;
    }
  }, [fetchPlaylists]);

  const duplicatePlaylist = useCallback(async (playlistId: string) => {
    if (!user) return null;

    try {
      // Get original playlist with songs
      const { data: original, error: fetchError } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_songs (
            song_id,
            position
          )
        `)
        .eq('id', playlistId)
        .single();

      if (fetchError) throw fetchError;

      // Create new playlist
      const { data: newPlaylist, error: createError } = await supabase
        .from('playlists')
        .insert({
          name: `${original.name} (Copy)`,
          description: original.description,
          user_id: user.id
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add songs to new playlist
      if (original.playlist_songs && original.playlist_songs.length > 0) {
        const songInserts = original.playlist_songs.map(ps => ({
          playlist_id: newPlaylist.id,
          song_id: ps.song_id,
          position: ps.position
        }));

        const { error: songsError } = await supabase
          .from('playlist_songs')
          .insert(songInserts);

        if (songsError) throw songsError;
      }

      toast.success('Playlist duplicated successfully');
      fetchPlaylists();
      return newPlaylist;
    } catch (error) {
      console.error('Error duplicating playlist:', error);
      toast.error('Failed to duplicate playlist');
      return null;
    }
  }, [user, fetchPlaylists]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  return {
    playlists,
    loading,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    duplicatePlaylist,
    refetch: fetchPlaylists
  };
};