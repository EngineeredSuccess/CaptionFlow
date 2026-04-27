-- Performance indexes for common query patterns
-- Run in Supabase Dashboard → SQL Editor

CREATE INDEX IF NOT EXISTS idx_captions_user_id
    ON captions(user_id);

CREATE INDEX IF NOT EXISTS idx_captions_scheduled
    ON captions(scheduled_status, scheduled_at)
    WHERE scheduled_status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_social_connections_user_id
    ON social_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_brand_voices_user_id
    ON brand_voices(user_id);
