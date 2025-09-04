import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Rate limiting configuration
const RATE_LIMITS = {
  upload: { requests: 10, window: 900000 }, // 10 uploads per 15 minutes
  search: { requests: 100, window: 60000 }, // 100 searches per minute
  auth: { requests: 5, window: 300000 }, // 5 auth attempts per 5 minutes
  default: { requests: 60, window: 60000 }, // 60 requests per minute
} as const;

interface RateLimitEntry {
  count: number;
  reset_time: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, identifier } = await req.json();
    
    if (!action || !identifier) {
      return new Response(
        JSON.stringify({ error: 'Missing action or identifier' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const limit = RATE_LIMITS[action as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;
    const now = Date.now();
    const key = `rate_limit:${action}:${identifier}`;

    // Get current rate limit data
    const { data: existing } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('key', key)
      .single();

    let entry: RateLimitEntry;

    if (!existing || now > existing.reset_time) {
      // Create new rate limit entry
      entry = {
        count: 1,
        reset_time: now + limit.window,
      };

      await supabase
        .from('rate_limits')
        .upsert({
          key,
          count: entry.count,
          reset_time: entry.reset_time,
        });
    } else {
      // Update existing entry
      entry = {
        count: existing.count + 1,
        reset_time: existing.reset_time,
      };

      await supabase
        .from('rate_limits')
        .update({ count: entry.count })
        .eq('key', key);
    }

    const isAllowed = entry.count <= limit.requests;
    const resetIn = Math.max(0, entry.reset_time - now);

    return new Response(
      JSON.stringify({
        allowed: isAllowed,
        limit: limit.requests,
        remaining: Math.max(0, limit.requests - entry.count),
        resetTime: entry.reset_time,
        resetIn: resetIn,
      }),
      {
        status: isAllowed ? 200 : 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-RateLimit-Limit': limit.requests.toString(),
          'X-RateLimit-Remaining': Math.max(0, limit.requests - entry.count).toString(),
          'X-RateLimit-Reset': entry.reset_time.toString(),
        },
      }
    );

  } catch (error) {
    console.error('Rate limit error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});