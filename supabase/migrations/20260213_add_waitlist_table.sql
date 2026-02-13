-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  handle TEXT,
  platform TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (though API will use service role to bypass for guests)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow service role to perform all actions
CREATE POLICY "Service role can do everything on waitlist" ON waitlist
  FOR ALL USING (true) WITH CHECK (true);

-- Allow admins to view waitlist (if we define an admin role later)
-- For now, it's primarily for server-side ingestion.
