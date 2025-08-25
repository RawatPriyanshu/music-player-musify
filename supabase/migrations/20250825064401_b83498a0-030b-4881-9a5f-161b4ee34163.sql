-- Create songs table
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  file_url TEXT NOT NULL,
  cover_url TEXT,
  duration INTEGER NOT NULL,
  uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playlist_songs table
CREATE TABLE public.playlist_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- Enable RLS on all tables
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for songs table
CREATE POLICY "Anyone can view approved songs" ON public.songs
  FOR SELECT USING (approved = true);

CREATE POLICY "Users can view their own songs" ON public.songs
  FOR SELECT USING (auth.uid() = uploader_id);

CREATE POLICY "Admins can view all songs" ON public.songs
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can insert songs" ON public.songs
  FOR INSERT WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Admins can update songs" ON public.songs
  FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete songs" ON public.songs
  FOR DELETE USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can delete their own songs" ON public.songs
  FOR DELETE USING (auth.uid() = uploader_id);

-- RLS policies for playlists table
CREATE POLICY "Users can view their own playlists" ON public.playlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playlists" ON public.playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON public.playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON public.playlists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for playlist_songs table
CREATE POLICY "Users can view songs in their playlists" ON public.playlist_songs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add songs to their playlists" ON public.playlist_songs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update songs in their playlists" ON public.playlist_songs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove songs from their playlists" ON public.playlist_songs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

-- RLS policies for favorites table
CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('songs', 'songs', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);

-- Storage policies for songs bucket
CREATE POLICY "Anyone can view songs" ON storage.objects
  FOR SELECT USING (bucket_id = 'songs');

CREATE POLICY "Authenticated users can upload songs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'songs' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own songs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'songs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own songs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'songs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for covers bucket
CREATE POLICY "Anyone can view covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can upload covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'covers' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own covers" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'covers' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own covers" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'covers' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for better performance
CREATE INDEX idx_songs_approved ON public.songs(approved);
CREATE INDEX idx_songs_uploader ON public.songs(uploader_id);
CREATE INDEX idx_playlists_user ON public.playlists(user_id);
CREATE INDEX idx_playlist_songs_playlist ON public.playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_position ON public.playlist_songs(playlist_id, position);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_favorites_song ON public.favorites(song_id);