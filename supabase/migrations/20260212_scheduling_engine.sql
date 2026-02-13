-- Add scheduling fields to captions table
ALTER TABLE captions ADD COLUMN IF NOT EXISTS scheduled_status TEXT DEFAULT 'draft';
-- Values: 'draft', 'scheduled', 'published', 'failed'

ALTER TABLE captions ADD COLUMN IF NOT EXISTS external_post_id TEXT;
-- Stores the ID from the scheduling provider (Ayrshare, Buffer, etc.)

ALTER TABLE captions ADD COLUMN IF NOT EXISTS publish_platforms TEXT[] DEFAULT array[]::TEXT[];
-- Which platforms to publish to (may differ from generation platforms)

-- Index for efficient scheduled post queries
CREATE INDEX IF NOT EXISTS idx_captions_scheduled_status ON captions(user_id, scheduled_status);
CREATE INDEX IF NOT EXISTS idx_captions_scheduled_at_status ON captions(scheduled_at, scheduled_status);
