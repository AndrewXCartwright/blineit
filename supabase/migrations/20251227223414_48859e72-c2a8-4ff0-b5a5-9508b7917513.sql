-- Add 2FA columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_method text,
ADD COLUMN IF NOT EXISTS two_factor_secret text,
ADD COLUMN IF NOT EXISTS two_factor_phone text,
ADD COLUMN IF NOT EXISTS two_factor_backup_codes text[],
ADD COLUMN IF NOT EXISTS two_factor_enabled_at timestamp with time zone;

-- Create two_factor_attempts table for tracking login attempts
CREATE TABLE public.two_factor_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  method text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create trusted_devices table
CREATE TABLE public.trusted_devices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  device_hash text NOT NULL,
  device_name text,
  last_used_at timestamp with time zone NOT NULL DEFAULT now(),
  trusted_until timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_hash)
);

-- Enable RLS on new tables
ALTER TABLE public.two_factor_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;

-- Policies for two_factor_attempts
CREATE POLICY "Users can view their own 2FA attempts"
  ON public.two_factor_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 2FA attempts"
  ON public.two_factor_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all 2FA attempts"
  ON public.two_factor_attempts
  FOR SELECT
  USING (is_admin());

-- Policies for trusted_devices
CREATE POLICY "Users can view their own trusted devices"
  ON public.trusted_devices
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trusted devices"
  ON public.trusted_devices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trusted devices"
  ON public.trusted_devices
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trusted devices"
  ON public.trusted_devices
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all trusted devices"
  ON public.trusted_devices
  FOR SELECT
  USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_two_factor_attempts_user_id ON public.two_factor_attempts(user_id);
CREATE INDEX idx_two_factor_attempts_created_at ON public.two_factor_attempts(created_at DESC);
CREATE INDEX idx_trusted_devices_user_id ON public.trusted_devices(user_id);
CREATE INDEX idx_trusted_devices_hash ON public.trusted_devices(device_hash);

-- Function to check 2FA rate limit (5 attempts per hour)
CREATE OR REPLACE FUNCTION public.check_2fa_rate_limit(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_failed_attempts INTEGER;
  v_last_lockout TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Count failed attempts in the last hour
  SELECT COUNT(*) INTO v_failed_attempts
  FROM two_factor_attempts
  WHERE user_id = p_user_id
    AND success = false
    AND created_at > now() - interval '1 hour';
  
  IF v_failed_attempts >= 5 THEN
    RETURN json_build_object(
      'allowed', false,
      'locked_until', now() + interval '30 minutes',
      'attempts_remaining', 0
    );
  END IF;
  
  RETURN json_build_object(
    'allowed', true,
    'attempts_remaining', 5 - v_failed_attempts
  );
END;
$$;

-- Function to log 2FA attempt
CREATE OR REPLACE FUNCTION public.log_2fa_attempt(
  p_user_id uuid,
  p_method text,
  p_success boolean,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt_id uuid;
BEGIN
  INSERT INTO two_factor_attempts (user_id, method, success, ip_address, user_agent)
  VALUES (p_user_id, p_method, p_success, p_ip_address, p_user_agent)
  RETURNING id INTO v_attempt_id;
  
  RETURN v_attempt_id;
END;
$$;

-- Function to verify and trust a device
CREATE OR REPLACE FUNCTION public.trust_device(
  p_user_id uuid,
  p_device_hash text,
  p_device_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_device_id uuid;
BEGIN
  INSERT INTO trusted_devices (user_id, device_hash, device_name, trusted_until)
  VALUES (p_user_id, p_device_hash, p_device_name, now() + interval '30 days')
  ON CONFLICT (user_id, device_hash) DO UPDATE
  SET last_used_at = now(),
      trusted_until = now() + interval '30 days',
      device_name = COALESCE(EXCLUDED.device_name, trusted_devices.device_name)
  RETURNING id INTO v_device_id;
  
  RETURN v_device_id;
END;
$$;

-- Function to check if device is trusted
CREATE OR REPLACE FUNCTION public.is_device_trusted(
  p_user_id uuid,
  p_device_hash text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM trusted_devices
    WHERE user_id = p_user_id
      AND device_hash = p_device_hash
      AND trusted_until > now()
  );
END;
$$;