-- Add missing RPC functions used by the caption generation flow.
-- These are called via supabase.rpc() in /api/generate-caption/route.ts

-- Reset the daily caption count for a user (called when the date has changed)
CREATE OR REPLACE FUNCTION reset_daily_caption_count()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET daily_caption_count = 0,
      last_reset_date = CURRENT_DATE
  WHERE last_reset_date IS NULL OR last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomically increment the daily caption count for a specific user
CREATE OR REPLACE FUNCTION increment_caption_count(user_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET daily_caption_count = daily_caption_count + 1,
      last_reset_date = CURRENT_DATE
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
