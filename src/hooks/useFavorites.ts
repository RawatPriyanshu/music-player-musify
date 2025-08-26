import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface FavoriteSong {
  id: string;
  song_id: string;
  user_id: string;
  created_at: string;
  song: {
    id: string;
    title: string;
    artist: string;
    duration: number;
    cover_url?: string;
    file_url: string;
  };
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteSong[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFavorites = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFavorites(data || []);
      setFavoriteIds(new Set(data?.map(fav => fav.song_id) || []));
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const isFavorite = useCallback((songId: string) => {
    return favoriteIds.has(songId);
  }, [favoriteIds]);

  const addToFavorites = useCallback(async (songId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          song_id: songId,
          user_id: user.id
        });

      if (error) throw error;

      setFavoriteIds(prev => new Set([...prev, songId]));
      toast.success('Added to favorites');
      fetchFavorites(); // Refresh full list
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error('Failed to add to favorites');
      return false;
    }
  }, [user, fetchFavorites]);

  const removeFromFavorites = useCallback(async (songId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('song_id', songId)
        .eq('user_id', user.id);

      if (error) throw error;

      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
      toast.success('Removed from favorites');
      fetchFavorites(); // Refresh full list
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error('Failed to remove from favorites');
      return false;
    }
  }, [user, fetchFavorites]);

  const toggleFavorite = useCallback(async (songId: string) => {
    if (isFavorite(songId)) {
      return await removeFromFavorites(songId);
    } else {
      return await addToFavorites(songId);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    favoriteIds,
    loading,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    refetch: fetchFavorites
  };
};