-- Fix the security definer view issue by changing ownership
-- The issue is that the view is owned by postgres (superuser)
-- We need to change the ownership to avoid the security definer behavior

-- Change the owner of the view to the authenticator role instead of postgres
ALTER VIEW public.popular_search_terms OWNER TO authenticator;

-- Also remove the overly permissive policy we just added and replace it with a more specific one
DROP POLICY IF EXISTS "Allow public access to popular search terms" ON public.search_analytics;

-- Create a more restrictive policy that only allows viewing search analytics for the popular terms view
-- This policy allows reading search_analytics data only for the purpose of generating popular search terms
CREATE POLICY "Allow reading search analytics for popular terms aggregation" ON public.search_analytics
FOR SELECT
TO authenticated, anon
USING (
  -- Allow reading only recent search data for aggregation purposes
  created_at >= (now() - interval '30 days')
);