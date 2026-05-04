-- ====================================================================
-- CAPTIONFLOW SECURITY CONSOLIDATED MIGRATION
-- Date: 2026-04-27
-- Targets: Waitlist RLS, Admin Access, Performance Indexes
-- ====================================================================

-- 1. [C2] Fix Waitlist RLS (Allow public signups without Service Role)
-- This allows the 'anon' role (public guests) to insert their email into the waitlist.
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_public_waitlist_insert" ON waitlist;
CREATE POLICY "allow_public_waitlist_insert" 
ON waitlist 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- 2. [H3] Add is_admin column to users for secure dashboard access
-- Required for the admin-only checks in /api/beta and other management routes.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 3. [Performance/Security] Database Indexes
-- Optimizes query performance for scheduled posts and user-specific data fetching.

-- Faster lookups for caption history and analytics
CREATE INDEX IF NOT EXISTS idx_captions_user_id ON captions(user_id);

-- Optimized index for the Cron Publishing engine (M7 fix support)
CREATE INDEX IF NOT EXISTS idx_captions_scheduled 
ON captions(scheduled_status, scheduled_at) 
WHERE scheduled_status = 'scheduled';

-- Faster lookups for social account connections
CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON social_connections(user_id);

-- Faster lookups for brand voice profiles
CREATE INDEX IF NOT EXISTS idx_brand_voices_user_id ON brand_voices(user_id);

-- ====================================================================
-- END OF MIGRATION
-- ====================================================================
