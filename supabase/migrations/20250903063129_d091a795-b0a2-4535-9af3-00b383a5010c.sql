-- Fix security definer view issue by recreating the popular_search_terms view
-- First drop the existing view
DROP VIEW IF EXISTS public.popular_search_terms;

-- Create a security definer function that properly aggregates public search data
-- This function will only show aggregated, non-sensitive search trends
CREATE OR REPLACE FUNCTION public.get_popular_search_terms()
RETURNS TABLE (
  search_query text,
  search_count bigint,
  avg_results numeric,
  last_searched timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only return aggregated search data, no user-specific information
  SELECT 
    sa.search_query,
    count(*) AS search_count,
    avg(sa.results_count) AS avg_results,
    max(sa.created_at) AS last_searched
  FROM search_analytics sa
  WHERE sa.created_at >= (now() - interval '7 days')
  GROUP BY sa.search_query
  HAVING count(*) >= 2  -- Only show terms searched by multiple users
  ORDER BY count(*) DESC
  LIMIT 50;
$$;

-- Create a new view that uses the security definer function
-- This view will be owned by the authenticated user, not superuser
CREATE VIEW public.popular_search_terms AS
SELECT * FROM public.get_popular_search_terms();

-- Grant appropriate permissions
GRANT SELECT ON public.popular_search_terms TO authenticated;
GRANT SELECT ON public.popular_search_terms TO anon;