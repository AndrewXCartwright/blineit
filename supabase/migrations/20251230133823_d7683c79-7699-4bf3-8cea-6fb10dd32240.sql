
-- Add sponsor_id column to loans table
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS sponsor_id uuid REFERENCES public.sponsor_profiles(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_loans_sponsor_id ON public.loans(sponsor_id);
