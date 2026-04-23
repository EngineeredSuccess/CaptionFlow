-- Add publish_target_id to captions to support specific Page posting
ALTER TABLE captions ADD COLUMN IF NOT EXISTS publish_target_id TEXT;
COMMENT ON COLUMN captions.publish_target_id IS 'Specific target URN for the post (e.g. LinkedIn organization URN)';
