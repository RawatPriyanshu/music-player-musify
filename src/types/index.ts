export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  artwork_url?: string;
  audio_url: string;
  created_at: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  songs: Song[];
  artwork_url?: string;
  is_public: boolean;
  created_at: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artwork_url?: string;
  release_date: string;
  songs: Song[];
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}