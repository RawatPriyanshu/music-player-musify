-- Add full-text search capabilities to songs table
ALTER TABLE public.songs ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(artist, '')), 'B')
) STORED;

-- Create index for full-text search
CREATE INDEX idx_songs_search_vector ON public.songs USING gin(search_vector);

-- Create search analytics table
CREATE TABLE public.search_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  search_query text NOT NULL,
  results_count integer NOT NULL DEFAULT 0,
  clicked_result_id uuid,
  clicked_result_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for search analytics
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for search analytics
CREATE POLICY "Users can insert their own search analytics" 
ON public.search_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all search analytics" 
ON public.search_analytics 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::app_role);

-- Create popular search terms view
CREATE OR REPLACE VIEW public.popular_search_terms AS
SELECT 
  search_query,
  COUNT(*) as search_count,
  AVG(results_count) as avg_results,
  MAX(created_at) as last_searched
FROM public.search_analytics 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY search_query
ORDER BY search_count DESC
LIMIT 50;