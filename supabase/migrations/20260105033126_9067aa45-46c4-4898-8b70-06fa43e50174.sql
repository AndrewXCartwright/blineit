-- Add username and phone_number columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS phone_number text;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Create a function to check username availability
CREATE OR REPLACE FUNCTION public.check_username_available(check_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate username format: 3-20 characters, letters, numbers, underscores only
  IF check_username IS NULL OR 
     LENGTH(check_username) < 3 OR 
     LENGTH(check_username) > 20 OR 
     check_username !~ '^[a-zA-Z0-9_]+$' THEN
    RETURN false;
  END IF;
  
  -- Check if username is already taken
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(check_username)
  );
END;
$$;

-- Create a function to update username with validation
CREATE OR REPLACE FUNCTION public.update_username(new_username text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  result json;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate username format
  IF new_username IS NULL OR LENGTH(new_username) < 3 THEN
    RETURN json_build_object('success', false, 'error', 'Username must be at least 3 characters');
  END IF;
  
  IF LENGTH(new_username) > 20 THEN
    RETURN json_build_object('success', false, 'error', 'Username must be 20 characters or less');
  END IF;
  
  IF new_username !~ '^[a-zA-Z0-9_]+$' THEN
    RETURN json_build_object('success', false, 'error', 'Username can only contain letters, numbers, and underscores');
  END IF;
  
  -- Check if username is already taken by another user
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE LOWER(username) = LOWER(new_username) 
    AND user_id != current_user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Username is already taken');
  END IF;
  
  -- Update the username
  UPDATE public.profiles 
  SET username = new_username, updated_at = now()
  WHERE user_id = current_user_id;
  
  RETURN json_build_object('success', true, 'username', new_username);
END;
$$;