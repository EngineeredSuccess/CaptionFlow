-- Initial Schema for CaptionFlow
-- Generated from docs/database-schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  subscription_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  daily_caption_count INT DEFAULT 0,
  last_reset_date DATE,
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Brand voices table
CREATE TABLE IF NOT EXISTS brand_voices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  example_1 TEXT,
  example_2 TEXT,
  example_3 TEXT,
  example_4 TEXT,
  example_5 TEXT,
  selected_tone TEXT DEFAULT 'casual',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Captions table
CREATE TABLE IF NOT EXISTS captions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  hashtags TEXT[] DEFAULT array[]::TEXT[],
  platform TEXT[] DEFAULT array[]::TEXT[],
  tone TEXT NOT NULL,
  brand_voice_id UUID REFERENCES brand_voices(id),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_captions_user_created ON captions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_captions_scheduled ON captions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_brand_voices_user ON brand_voices(user_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE captions ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own brand voices" ON brand_voices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brand voices" ON brand_voices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand voices" ON brand_voices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand voices" ON brand_voices FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own captions" ON captions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own captions" ON captions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own captions" ON captions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own captions" ON captions FOR DELETE USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION check_and_reset_daily_count()
RETURNS trigger AS $$
BEGIN
  IF NEW.last_reset_date IS NULL OR NEW.last_reset_date < CURRENT_DATE THEN
    NEW.daily_caption_count := 0;
    NEW.last_reset_date := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reset_daily_count_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_and_reset_daily_count();
