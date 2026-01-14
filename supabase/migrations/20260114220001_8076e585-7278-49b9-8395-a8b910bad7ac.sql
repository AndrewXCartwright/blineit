-- Add DigiShares fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS digishares_investor_id TEXT,
ADD COLUMN IF NOT EXISTS digishares_token TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_digishares_investor_id ON public.profiles(digishares_investor_id);