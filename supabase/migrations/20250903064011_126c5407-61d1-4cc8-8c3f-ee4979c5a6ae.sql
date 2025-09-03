-- Fix storage policies for better image upload functionality
-- The current policies use auth.role() which might not work consistently
-- Let's update them to use auth.uid() for authentication checks

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload songs" ON storage.objects;

-- Create updated policies for covers bucket
CREATE POLICY "Authenticated users can upload covers" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'covers' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Create updated policies for songs bucket  
CREATE POLICY "Authenticated users can upload songs" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'songs' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Ensure the buckets are properly configured
UPDATE storage.buckets 
SET public = true, file_size_limit = 52428800 -- 50MB limit
WHERE id = 'songs';

UPDATE storage.buckets 
SET public = true, file_size_limit = 5242880 -- 5MB limit  
WHERE id = 'covers';