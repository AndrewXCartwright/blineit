
-- Drop the foreign key constraint on user_id to allow demo sponsors without real users
ALTER TABLE public.sponsor_profiles DROP CONSTRAINT IF EXISTS sponsor_profiles_user_id_fkey;

-- Make user_id nullable for demo data
ALTER TABLE public.sponsor_profiles ALTER COLUMN user_id DROP NOT NULL;
