-- Add public/private toggle for playlists
ALTER TABLE public.playlists 
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Add banned status for users
ALTER TABLE public.profiles 
ADD COLUMN banned BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN ban_reason TEXT;

-- Add play count and report tracking for songs
ALTER TABLE public.songs 
ADD COLUMN play_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN report_count INTEGER NOT NULL DEFAULT 0;

-- Create reports table for content moderation
CREATE TABLE public.song_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

-- Enable RLS on song_reports
ALTER TABLE public.song_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for song_reports
CREATE POLICY "Users can report songs" 
ON public.song_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" 
ON public.song_reports 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::app_role);

CREATE POLICY "Admins can update reports" 
ON public.song_reports 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'admin'::app_role);