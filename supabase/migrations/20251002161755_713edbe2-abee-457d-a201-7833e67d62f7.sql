-- Add is_anonymous column to stories table
ALTER TABLE public.stories 
ADD COLUMN is_anonymous boolean NOT NULL DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN public.stories.is_anonymous IS 'When true, the story is hidden from the author''s public profile but still visible on the main website';
