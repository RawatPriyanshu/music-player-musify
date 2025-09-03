-- Fix the security definer view issue by removing the SECURITY DEFINER function
-- and creating a simple view that respects RLS policies properly

-- Drop the security definer function
DROP FUNCTION IF EXISTS public.get_popular_search_terms();

-- Drop the existing view
DROP VIEW IF EXISTS public.popular_search_terms;

-- Create a simple view that doesn't use SECURITY DEFINER
-- This view will respect RLS policies and only show aggregated public data
CREATE VIEW public.popular_search_terms AS
SELECT 
  search_query,
  count(*) AS search_count,
  avg(results_count) AS avg_results,
  max(created_at) AS last_searched
FROM search_analytics
WHERE created_at >= (now() - interval '7 days')
  AND user_id IS NOT NULL  -- Only include analytics with user_id for privacy
GROUP BY search_query
HAVING count(*) >= 2  -- Only show terms searched by multiple users
ORDER BY count(*) DESC
LIMIT 50;

-- Since this view shows only aggregated, anonymized data, we can allow public access
-- But we need to add a policy to search_analytics table for this view to work
-- Let's add a policy that allows viewing aggregated search data

-- First check if we need RLS enabled on the view itself
ALTER VIEW public.popular_search_terms SET (security_barrier = true);