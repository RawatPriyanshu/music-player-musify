-- Create tables for production monitoring and security

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  reset_time BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Security logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type TEXT NOT NULL,
  issues_found INTEGER NOT NULL DEFAULT 0,
  severity_breakdown JSONB,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance metrics table (optional - can also use external service)
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  url TEXT,
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_time ON rate_limits(reset_time);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin access
CREATE POLICY "Rate limits admin access" ON rate_limits
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Security logs admin access" ON security_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Performance metrics admin access" ON performance_metrics
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);