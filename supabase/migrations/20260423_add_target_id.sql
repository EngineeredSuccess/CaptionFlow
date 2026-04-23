-- Add target_id to social_connections to support Business Pages
ALTER TABLE social_connections ADD COLUMN IF NOT EXISTS target_id TEXT;
COMMENT ON COLUMN social_connections.target_id IS 'Specific target URN (person or organization) for platforms like LinkedIn';
