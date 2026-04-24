-- Add media_url to captions table to support TikTok/Instagram publishing via URL
ALTER TABLE captions ADD COLUMN IF NOT EXISTS media_url TEXT;
