-- Analytics events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_analytics_user ON analytics_events(user_id, created_at);
CREATE INDEX idx_analytics_event ON analytics_events(event_name, created_at);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);

-- Beta signups table
CREATE TABLE beta_signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, invited, converted
  invited_at TIMESTAMP,
  converted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for invite code lookups
CREATE INDEX idx_beta_invite_code ON beta_signups(invite_code);
CREATE INDEX idx_beta_status ON beta_signups(status);

-- Enable RLS on new tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_signups ENABLE ROW LEVEL SECURITY;

-- Policies for analytics_events
CREATE POLICY "Users can view own analytics" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for beta_signups (admin only for now)
CREATE POLICY "Anyone can insert beta signup" ON beta_signups
  FOR INSERT WITH CHECK (true);

-- Function to get analytics summary
CREATE OR REPLACE FUNCTION get_analytics_summary(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  event_name TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ae.event_name,
    COUNT(*) as count
  FROM analytics_events ae
  WHERE ae.created_at::DATE BETWEEN start_date AND end_date
  GROUP BY ae.event_name
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily active users
CREATE OR REPLACE FUNCTION get_daily_active_users(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  active_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ae.created_at::DATE as date,
    COUNT(DISTINCT ae.user_id) as active_users
  FROM analytics_events ae
  WHERE ae.created_at >= NOW() - INTERVAL '1 day' * days_back
    AND ae.user_id IS NOT NULL
  GROUP BY ae.created_at::DATE
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;
