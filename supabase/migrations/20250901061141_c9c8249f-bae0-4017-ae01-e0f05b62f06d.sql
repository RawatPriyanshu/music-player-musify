-- Fix security issue by dropping and recreating view without SECURITY DEFINER
DROP VIEW IF EXISTS public.popular_search_terms;

-- Create regular view (not SECURITY DEFINER)
CREATE VIEW public.popular_search_terms AS
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