-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Stripe integration
  stripe_customer_id TEXT,
  
  -- Subscription
  subscription_tier TEXT DEFAULT 'free', -- free, pro, team
  subscription_status TEXT DEFAULT 'active',
  subscription_id TEXT,
  current_period_end TIMESTAMP,
  
  -- Usage tracking
  daily_caption_count INT DEFAULT 0,
  last_reset_date DATE,
  
  -- Metadata
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Brand voices table
CREATE TABLE brand_voices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Training examples
  example_1 TEXT,
  example_2 TEXT,
  example_3 TEXT,
  example_4 TEXT,
  example_5 TEXT,
  
  -- Settings
  selected_tone TEXT DEFAULT 'casual', -- casual, professional, funny, edgy, witty
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Generated captions table
CREATE TABLE captions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  hashtags TEXT[] DEFAULT array[]::TEXT[],
  
  -- Platform & tone
  platform TEXT[] DEFAULT array[]::TEXT[], -- instagram, tiktok, linkedin, twitter
  tone TEXT NOT NULL,
  
  -- Optional brand voice reference
  brand_voice_id UUID REFERENCES brand_voices(id),
  
  -- Scheduling
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE
);

-- Popular hashtags reference (for optimization)
CREATE TABLE popular_hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag TEXT UNIQUE NOT NULL,
  category TEXT,
  popularity_score INT DEFAULT 0,
  monthly_search_volume INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_captions_user_created ON captions(user_id, created_at);
CREATE INDEX idx_captions_scheduled ON captions(scheduled_at);
CREATE INDEX idx_brand_voices_user ON brand_voices(user_id);

-- Row Level Security (RLS) Policies

-- Users: Users can only read/update their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Brand Voices: Users can only access their own brand voices
ALTER TABLE brand_voices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brand voices" ON brand_voices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brand voices" ON brand_voices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand voices" ON brand_voices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand voices" ON brand_voices
  FOR DELETE USING (auth.uid() = user_id);

-- Captions: Users can only access their own captions
ALTER TABLE captions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own captions" ON captions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own captions" ON captions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own captions" ON captions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own captions" ON captions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to reset daily caption count
CREATE OR REPLACE FUNCTION reset_daily_caption_count()
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET daily_caption_count = 0, last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE OR last_reset_date IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to reset daily count on login
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

-- Function to increment caption count
CREATE OR REPLACE FUNCTION increment_caption_count(user_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET daily_caption_count = daily_caption_count + 1
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;
