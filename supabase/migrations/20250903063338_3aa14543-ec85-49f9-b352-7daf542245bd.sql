-- Final fix for security definer view issue
-- Remove the problematic view entirely and replace with a safer approach

-- Drop the view entirely since it's causing security issues
DROP VIEW IF EXISTS public.popular_search_terms CASCADE;

-- Remove the policy we created
DROP POLICY IF EXISTS "Allow reading search analytics for popular terms aggregation" ON public.search_analytics;

-- Instead of a view that might bypass RLS, we'll create a simple function 
-- that returns popular search terms in a secure way
CREATE OR REPLACE FUNCTION public.get_popular_search_terms_safe()
RETURNS TABLE (
  search_query text,
  search_count bigint,
  avg_results numeric,
  last_searched timestamp with time zone
)
LANGUAGE sql
STABLE
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

-- Grant execute permissions to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.get_popular_search_terms_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_popular_search_terms_safe() TO anon;