-- Social Connections table for OAuth-linked platform accounts
CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'twitter', 'tiktok')),
  platform_handle TEXT,
  platform_user_id TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  profile_dna JSONB DEFAULT '{}',
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

-- Users can only see their own connections
CREATE POLICY "Users can view own connections"
  ON social_connections FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own connections
CREATE POLICY "Users can insert own connections"
  ON social_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own connections
CREATE POLICY "Users can update own connections"
  ON social_connections FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete own connections"
  ON social_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Add publish_connection_id to captions table to link scheduled posts to a connection
ALTER TABLE captions ADD COLUMN IF NOT EXISTS publish_connection_id UUID REFERENCES social_connections(id);
