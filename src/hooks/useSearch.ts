import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SearchResult {
  type: 'song' | 'artist' | 'playlist' | 'user';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  data: any;
}

export interface SearchFilters {
  type?: 'song' | 'artist' | 'playlist' | 'user' | 'all';
  genre?: string;
  duration?: { min?: number; max?: number };
  dateRange?: { start?: Date; end?: Date };
  isPublic?: boolean;
}

export const useSearch = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({ type: 'all' });

  // Load search history from localStorage on mount
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`musify_search_history_${user.id}`);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
      const recent = localStorage.getItem(`musify_recent_searches_${user.id}`);
      if (recent) {
        setRecentSearches(JSON.parse(recent));
      }
    }
  }, [user]);

  // Save search to history
  const saveToHistory = useCallback((query: string) => {
    if (!user || !query.trim()) return;

    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 50);
    const newRecent = [query, ...recentSearches.filter(r => r !== query)].slice(0, 10);
    
    setSearchHistory(newHistory);
    setRecentSearches(newRecent);
    
    localStorage.setItem(`musify_search_history_${user.id}`, JSON.stringify(newHistory));
    localStorage.setItem(`musify_recent_searches_${user.id}`, JSON.stringify(newRecent));
  }, [user, searchHistory, recentSearches]);

  // Perform search
  const performSearch = useCallback(async (query: string, searchFilters: SearchFilters = {}) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const results: SearchResult[] = [];
      const searchTerm = `%${query.toLowerCase()}%`;

      // Search songs
      if (searchFilters.type === 'song' || searchFilters.type === 'all') {
        let songQuery = supabase
          .from('songs')
          .select('*, profiles(username)')
          .eq('approved', true)
          .or(`title.ilike.${searchTerm},artist.ilike.${searchTerm}`);

        if (searchFilters.duration) {
          if (searchFilters.duration.min) {
            songQuery = songQuery.gte('duration', searchFilters.duration.min);
          }
          if (searchFilters.duration.max) {
            songQuery = songQuery.lte('duration', searchFilters.duration.max);
          }
        }

        if (searchFilters.dateRange) {
          if (searchFilters.dateRange.start) {
            songQuery = songQuery.gte('created_at', searchFilters.dateRange.start.toISOString());
          }
          if (searchFilters.dateRange.end) {
            songQuery = songQuery.lte('created_at', searchFilters.dateRange.end.toISOString());
          }
        }

        const { data: songs } = await songQuery.limit(20);

        if (songs) {
          results.push(...songs.map(song => ({
            type: 'song' as const,
            id: song.id,
            title: song.title,
            subtitle: song.artist,
            image: song.cover_url,
            data: song
          })));
        }
      }

      // Search playlists
      if (searchFilters.type === 'playlist' || searchFilters.type === 'all') {
        let playlistQuery = supabase
          .from('playlists')
          .select('*, profiles(username)')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);

        if (searchFilters.isPublic !== undefined) {
          playlistQuery = playlistQuery.eq('is_public', searchFilters.isPublic);
        }

        const { data: playlists } = await playlistQuery.limit(10);

        if (playlists) {
          results.push(...playlists.map(playlist => ({
            type: 'playlist' as const,
            id: playlist.id,
            title: playlist.name,
            subtitle: `by ${playlist.profiles?.username || 'Unknown'}`,
            image: playlist.cover_url,
            data: playlist
          })));
        }
      }

      // Search users/profiles
      if (searchFilters.type === 'user' || searchFilters.type === 'all') {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.${searchTerm},email.ilike.${searchTerm}`)
          .eq('banned', false)
          .limit(10);

        if (profiles) {
          results.push(...profiles.map(profile => ({
            type: 'user' as const,
            id: profile.id,
            title: profile.username || 'Anonymous',
            subtitle: profile.email,
            image: profile.avatar_url,
            data: profile
          })));
        }
      }

      // Search artists (distinct from songs)
      if (searchFilters.type === 'artist' || searchFilters.type === 'all') {
        const { data: artists } = await supabase
          .from('songs')
          .select('artist')
          .eq('approved', true)
          .ilike('artist', searchTerm)
          .limit(10);

        if (artists) {
          const uniqueArtists = [...new Set(artists.map(a => a.artist))];
          results.push(...uniqueArtists.map(artist => ({
            type: 'artist' as const,
            id: artist,
            title: artist,
            subtitle: 'Artist',
            data: { artist }
          })));
        }
      }

      setResults(results);
      
      // Save successful search to history
      if (results.length > 0) {
        saveToHistory(query);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [saveToHistory]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery, filters);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, performSearch]);

  // Clear search history
  const clearHistory = useCallback(() => {
    if (!user) return;
    setSearchHistory([]);
    setRecentSearches([]);
    localStorage.removeItem(`musify_search_history_${user.id}`);
    localStorage.removeItem(`musify_recent_searches_${user.id}`);
  }, [user]);

  // Get suggestions based on current query
  const suggestions = useMemo(() => {
    if (!searchQuery) return recentSearches;
    return searchHistory.filter(h => 
      h.toLowerCase().includes(searchQuery.toLowerCase()) && h !== searchQuery
    ).slice(0, 5);
  }, [searchQuery, searchHistory, recentSearches]);

  return {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    suggestions,
    filters,
    setFilters,
    performSearch,
    clearHistory,
    recentSearches,
    searchHistory
  };
};