-- Add is_platform_admin to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_platform_admin boolean DEFAULT false;

-- Create index for quick platform admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_platform_admin ON public.profiles(is_platform_admin) WHERE is_platform_admin = true;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.is_platform_admin IS 'Indicates if user has platform-level admin access for DigiShares integration';