-- Fix the function search path mutable warning
-- Update the function to set search_path for security

CREATE OR REPLACE FUNCTION public.get_popular_search_terms_safe()
RETURNS TABLE (
  search_query text,
  search_count bigint,
  avg_results numeric,
  last_searched timestamp with time zone
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  -- This function will be called by users and will respect RLS
  -- It only returns aggregated, anonymized data
  SELECT 
    sa.search_query,
    count(*) AS search_count,
    avg(sa.results_count) AS avg_results,
    max(sa.created_at) AS last_searched
  FROM search_analytics sa
  WHERE sa.created_at >= (now() - interval '7 days')
  GROUP BY sa.search_query
  HAVING count(*) >= 2  -- Only show terms with multiple searches
  ORDER BY count(*) DESC
  LIMIT 50;
$$;