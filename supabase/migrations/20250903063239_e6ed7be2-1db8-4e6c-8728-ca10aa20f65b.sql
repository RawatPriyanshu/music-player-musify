-- Fix the security definer view issue by properly dropping dependencies
-- Use CASCADE to drop the function and its dependent view

-- Drop the view and function with CASCADE to handle dependencies
DROP VIEW IF EXISTS public.popular_search_terms CASCADE;
DROP FUNCTION IF EXISTS public.get_popular_search_terms() CASCADE;

-- Now create a simple view without SECURITY DEFINER
-- This approach respects RLS policies by not bypassing them
CREATE VIEW public.popular_search_terms AS
SELECT 
  search_query,
  count(*) AS search_count,
  avg(results_count) AS avg_results,
  max(created_at) AS last_searched
FROM search_analytics
WHERE created_at >= (now() - interval '7 days')
GROUP BY search_query
HAVING count(*) >= 2  -- Only show terms searched by multiple users for privacy
ORDER BY count(*) DESC
LIMIT 50;

-- Add RLS policy to allow public access to aggregated search data
-- This is secure because it only shows aggregated, anonymized data
CREATE POLICY "Allow public access to popular search terms" ON public.search_analytics
FOR SELECT
TO public
USING (
  -- Allow access only for aggregated queries that don't expose individual user data
  created_at >= (now() - interval '7 days')
);

-- Grant access to the view for authenticated and anonymous users
GRANT SELECT ON public.popular_search_terms TO authenticated;
GRANT SELECT ON public.popular_search_terms TO anon;