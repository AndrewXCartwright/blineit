-- Add image_url column to private_businesses
ALTER TABLE public.private_businesses ADD COLUMN IF NOT EXISTS image_url TEXT;