export interface Profile {
  id: string;
  email: string;
  username: string | null;
  role: 'user' | 'admin';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  banned?: boolean;
  ban_reason?: string | null;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  cover_url?: string;
  file_url: string;
  audio_url?: string; // For backward compatibility
  approved: boolean;
  uploader_id: string;
  created_at: string;
  play_count: number;
  report_count: number;
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
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}