import { useState, useEffect, useCallback } from 'react';
import { Song } from '@/types';

interface CachedSong extends Song {
  cachedAt: number;
  localUrl?: string;
}

interface OfflineStorage {
  songs: CachedSong[];
  favorites: string[];
  playlists: any[];
  lastSync: number;
}

const CACHE_KEY = 'musify_offline_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedSongs, setCachedSongs] = useState<CachedSong[]>([]);
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached data on mount
    loadCacheData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCacheData = useCallback(async () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data: OfflineStorage = JSON.parse(cached);
        
        // Remove expired cache
        const now = Date.now();
        const validSongs = data.songs.filter(
          song => now - song.cachedAt < CACHE_EXPIRY
        );
        
        setCachedSongs(validSongs);
        calculateCacheSize(validSongs);
      }
    } catch (error) {
      console.error('Failed to load cache data:', error);
    }
  }, []);

  const calculateCacheSize = (songs: CachedSong[]) => {
    // Estimate cache size (this would be more accurate with actual file sizes)
    const estimatedSize = songs.length * 4; // 4MB average per song
    setCacheSize(estimatedSize);
  };

  const cacheSong = useCallback(async (song: Song): Promise<boolean> => {
    if (!isOnline) return false;

    try {
      // In a real implementation, you would:
      // 1. Download the audio file
      // 2. Store it in IndexedDB or Cache API
      // 3. Create a local URL reference

      const cachedSong: CachedSong = {
        ...song,
        cachedAt: Date.now(),
        localUrl: song.file_url // In real app, this would be the cached URL
      };

      const updatedSongs = [...cachedSongs, cachedSong];
      setCachedSongs(updatedSongs);
      
      // Save to localStorage (in real app, use IndexedDB)
      const cacheData: OfflineStorage = {
        songs: updatedSongs,
        favorites: [], // Would load from actual favorites
        playlists: [], // Would load from actual playlists
        lastSync: Date.now()
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      calculateCacheSize(updatedSongs);
      
      return true;
    } catch (error) {
      console.error('Failed to cache song:', error);
      return false;
    }
  }, [isOnline, cachedSongs]);

  const removeCachedSong = useCallback(async (songId: string): Promise<boolean> => {
    try {
      const updatedSongs = cachedSongs.filter(song => song.id !== songId);
      setCachedSongs(updatedSongs);
      
      const cacheData: OfflineStorage = {
        songs: updatedSongs,
        favorites: [],
        playlists: [],
        lastSync: Date.now()
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      calculateCacheSize(updatedSongs);
      
      return true;
    } catch (error) {
      console.error('Failed to remove cached song:', error);
      return false;
    }
  }, [cachedSongs]);

  const isSongCached = useCallback((songId: string): boolean => {
    return cachedSongs.some(song => song.id === songId);
  }, [cachedSongs]);

  const getCachedSong = useCallback((songId: string): CachedSong | null => {
    return cachedSongs.find(song => song.id === songId) || null;
  }, [cachedSongs]);

  const clearCache = useCallback(async (): Promise<boolean> => {
    try {
      localStorage.removeItem(CACHE_KEY);
      setCachedSongs([]);
      setCacheSize(0);
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }, []);

  const syncWhenOnline = useCallback(async (): Promise<boolean> => {
    if (!isOnline) return false;

    try {
      // In a real implementation:
      // 1. Sync cached changes with server
      // 2. Download new content
      // 3. Update cache with fresh data
      
      console.log('Syncing offline data...');
      return true;
    } catch (error) {
      console.error('Failed to sync:', error);
      return false;
    }
  }, [isOnline]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      syncWhenOnline();
    }
  }, [isOnline, syncWhenOnline]);

  return {
    isOnline,
    cachedSongs,
    cacheSize,
    cacheSong,
    removeCachedSong,
    isSongCached,
    getCachedSong,
    clearCache,
    syncWhenOnline
  };
};