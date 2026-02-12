-- Add source_type to captions table to distinguish text vs vision-generated captions
ALTER TABLE captions ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'text';
-- Values: 'text' (default, existing behavior), 'vision' (image-based generation)
