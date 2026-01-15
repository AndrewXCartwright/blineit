-- Add new columns to safe_deals for enhanced startup data
ALTER TABLE public.safe_deals ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.safe_deals ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.safe_deals ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE public.safe_deals ADD COLUMN IF NOT EXISTS location_state TEXT;
ALTER TABLE public.safe_deals ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.safe_deals ADD COLUMN IF NOT EXISTS exemption_type TEXT DEFAULT 'reg_cf';

-- Drop the old stage constraint and add a new one with more stages
ALTER TABLE public.safe_deals DROP CONSTRAINT IF EXISTS safe_deals_stage_check;
ALTER TABLE public.safe_deals ADD CONSTRAINT safe_deals_stage_check 
  CHECK (stage IN ('angel', 'pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'growth'));