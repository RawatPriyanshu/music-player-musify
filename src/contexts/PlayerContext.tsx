import React, { createContext, useContext, useReducer, useRef, useEffect, ReactNode } from 'react';
import { Song } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export type RepeatMode = 'none' | 'one' | 'all';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  queue: Song[];
  currentIndex: number;
  isLoading: boolean;
}

export interface PlayerActions {
  playSong: (song: Song, queue?: Song[]) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (level: number) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  addToQueue: (songs: Song[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

type PlayerAction =
  | { type: 'SET_CURRENT_SONG'; payload: Song | null }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_SHUFFLED'; payload: boolean }
  | { type: 'SET_REPEAT_MODE'; payload: RepeatMode }
  | { type: 'SET_QUEUE'; payload: Song[] }
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_TO_QUEUE'; payload: Song[] }
  | { type: 'REMOVE_FROM_QUEUE'; payload: number };

const initialState: PlayerState = {
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 75,
  isShuffled: false,
  repeatMode: 'none',
  queue: [],
  currentIndex: -1,
  isLoading: false,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_CURRENT_SONG':
      return { ...state, currentSong: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_SHUFFLED':
      return { ...state, isShuffled: action.payload };
    case 'SET_REPEAT_MODE':
      return { ...state, repeatMode: action.payload };
    case 'SET_QUEUE':
      return { ...state, queue: action.payload };
    case 'SET_CURRENT_INDEX':
      return { ...state, currentIndex: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'ADD_TO_QUEUE':
      return { ...state, queue: [...state.queue, ...action.payload] };
    case 'REMOVE_FROM_QUEUE':
      const newQueue = state.queue.filter((_, index) => index !== action.payload);
      const newIndex = action.payload < state.currentIndex ? state.currentIndex - 1 : state.currentIndex;
      return { ...state, queue: newQueue, currentIndex: newIndex };
    default:
      return state;
  }
}

const PlayerContext = createContext<{
  state: PlayerState;
  actions: PlayerActions;
} | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shuffledIndicesRef = useRef<number[]>([]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = state.volume / 100;
    
    const audio = audioRef.current;

    const handleLoadStart = () => dispatch({ type: 'SET_LOADING', payload: true });
    const handleCanPlay = () => dispatch({ type: 'SET_LOADING', payload: false });
    const handleLoadedMetadata = () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration || 0 });
    };
    
    const handleTimeUpdate = () => {
      dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
    };
    
    const handleEnded = () => {
      dispatch({ type: 'SET_PLAYING', payload: false });
      handleNextSong();
    };

    const handleError = () => {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_PLAYING', payload: false });
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Update audio volume when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume / 100;
    }
  }, [state.volume]);

  // Clear player when user logs out
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Clear player state and stop playback when user logs out
        dispatch({ type: 'SET_QUEUE', payload: [] });
        dispatch({ type: 'SET_CURRENT_INDEX', payload: -1 });
        dispatch({ type: 'SET_CURRENT_SONG', payload: null });
        dispatch({ type: 'SET_PLAYING', payload: false });
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Generate shuffled indices when shuffle is enabled
  useEffect(() => {
    if (state.isShuffled && state.queue.length > 0) {
      const indices = Array.from({ length: state.queue.length }, (_, i) => i);
      shuffledIndicesRef.current = indices.sort(() => Math.random() - 0.5);
    }
  }, [state.isShuffled, state.queue.length]);

  const getNextIndex = () => {
    if (state.queue.length === 0) return -1;
    
    if (state.repeatMode === 'one') {
      return state.currentIndex;
    }
    
    if (state.isShuffled) {
      const shuffledIndex = shuffledIndicesRef.current.indexOf(state.currentIndex);
      const nextShuffledIndex = (shuffledIndex + 1) % shuffledIndicesRef.current.length;
      return shuffledIndicesRef.current[nextShuffledIndex];
    }
    
    const nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.queue.length) {
      return state.repeatMode === 'all' ? 0 : -1;
    }
    return nextIndex;
  };

  const getPreviousIndex = () => {
    if (state.queue.length === 0) return -1;
    
    if (state.repeatMode === 'one') {
      return state.currentIndex;
    }
    
    if (state.isShuffled) {
      const shuffledIndex = shuffledIndicesRef.current.indexOf(state.currentIndex);
      const prevShuffledIndex = shuffledIndex === 0 
        ? shuffledIndicesRef.current.length - 1 
        : shuffledIndex - 1;
      return shuffledIndicesRef.current[prevShuffledIndex];
    }
    
    const prevIndex = state.currentIndex - 1;
    if (prevIndex < 0) {
      return state.repeatMode === 'all' ? state.queue.length - 1 : -1;
    }
    return prevIndex;
  };

  const handleNextSong = () => {
    const nextIndex = getNextIndex();
    if (nextIndex !== -1 && state.queue[nextIndex]) {
      dispatch({ type: 'SET_CURRENT_INDEX', payload: nextIndex });
      dispatch({ type: 'SET_CURRENT_SONG', payload: state.queue[nextIndex] });
      
        if (audioRef.current) {
          audioRef.current.src = state.queue[nextIndex].audio_url || state.queue[nextIndex].file_url;
          if (state.isPlaying) {
            audioRef.current.play();
          }
        }
    }
  };

  const actions: PlayerActions = {
    playSong: (song: Song, queue?: Song[]) => {
      // Map file_url to audio_url for backward compatibility
      const songWithAudioUrl = {
        ...song,
        audio_url: song.audio_url || song.file_url
      };
      
      if (queue) {
        const queueWithAudioUrl = queue.map(s => ({
          ...s,
          audio_url: s.audio_url || s.file_url
        }));
        dispatch({ type: 'SET_QUEUE', payload: queueWithAudioUrl });
        const index = queueWithAudioUrl.findIndex(s => s.id === song.id);
        dispatch({ type: 'SET_CURRENT_INDEX', payload: index });
      } else if (state.queue.length === 0) {
        dispatch({ type: 'SET_QUEUE', payload: [songWithAudioUrl] });
        dispatch({ type: 'SET_CURRENT_INDEX', payload: 0 });
      }
      
      dispatch({ type: 'SET_CURRENT_SONG', payload: songWithAudioUrl });
      dispatch({ type: 'SET_PLAYING', payload: true });
      
      if (audioRef.current) {
        audioRef.current.src = songWithAudioUrl.audio_url;
        audioRef.current.play();
      }
    },

    pauseSong: () => {
      dispatch({ type: 'SET_PLAYING', payload: false });
      audioRef.current?.pause();
    },

    resumeSong: () => {
      dispatch({ type: 'SET_PLAYING', payload: true });
      audioRef.current?.play();
    },

    nextSong: handleNextSong,

    previousSong: () => {
      const prevIndex = getPreviousIndex();
      if (prevIndex !== -1 && state.queue[prevIndex]) {
        dispatch({ type: 'SET_CURRENT_INDEX', payload: prevIndex });
        dispatch({ type: 'SET_CURRENT_SONG', payload: state.queue[prevIndex] });
        
        if (audioRef.current) {
          audioRef.current.src = state.queue[prevIndex].audio_url || state.queue[prevIndex].file_url;
          if (state.isPlaying) {
            audioRef.current.play();
          }
        }
      }
    },

    seekTo: (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        dispatch({ type: 'SET_CURRENT_TIME', payload: time });
      }
    },

    setVolume: (level: number) => {
      const clampedLevel = Math.max(0, Math.min(100, level));
      dispatch({ type: 'SET_VOLUME', payload: clampedLevel });
    },

    toggleShuffle: () => {
      dispatch({ type: 'SET_SHUFFLED', payload: !state.isShuffled });
    },

    cycleRepeatMode: () => {
      const modes: RepeatMode[] = ['none', 'one', 'all'];
      const currentIndex = modes.indexOf(state.repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      dispatch({ type: 'SET_REPEAT_MODE', payload: nextMode });
    },

    addToQueue: (songs: Song[]) => {
      dispatch({ type: 'ADD_TO_QUEUE', payload: songs });
    },

    removeFromQueue: (index: number) => {
      dispatch({ type: 'REMOVE_FROM_QUEUE', payload: index });
    },

    clearQueue: () => {
      dispatch({ type: 'SET_QUEUE', payload: [] });
      dispatch({ type: 'SET_CURRENT_INDEX', payload: -1 });
      dispatch({ type: 'SET_CURRENT_SONG', payload: null });
      dispatch({ type: 'SET_PLAYING', payload: false });
      audioRef.current?.pause();
    },
  };

  return (
    <PlayerContext.Provider value={{ state, actions }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}