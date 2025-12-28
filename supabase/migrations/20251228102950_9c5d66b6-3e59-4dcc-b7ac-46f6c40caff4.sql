-- Create biometric_settings table
CREATE TABLE public.biometric_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  biometric_enabled BOOLEAN NOT NULL DEFAULT false,
  biometric_type TEXT, -- face_id, touch_id, fingerprint, none
  device_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  pin_enabled BOOLEAN NOT NULL DEFAULT false,
  pin_hash TEXT,
  require_biometric_for_login BOOLEAN NOT NULL DEFAULT true,
  require_biometric_for_transactions BOOLEAN NOT NULL DEFAULT true,
  require_biometric_for_transfers BOOLEAN NOT NULL DEFAULT true,
  last_biometric_auth TIMESTAMP WITH TIME ZONE,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_id)
);

-- Enable RLS on biometric_settings
ALTER TABLE public.biometric_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for biometric_settings
CREATE POLICY "Users can view their own biometric settings"
  ON public.biometric_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own biometric settings"
  ON public.biometric_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own biometric settings"
  ON public.biometric_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own biometric settings"
  ON public.biometric_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Create auth_events table for logging authentication events
CREATE TABLE public.auth_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- login, transaction_approve, transfer_approve, settings_change
  auth_method TEXT NOT NULL, -- biometric, pin, password, 2fa
  device_id TEXT,
  ip_address TEXT,
  location TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on auth_events
ALTER TABLE public.auth_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for auth_events
CREATE POLICY "Users can view their own auth events"
  ON public.auth_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own auth events"
  ON public.auth_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all auth events"
  ON public.auth_events FOR SELECT
  USING (is_admin());

-- Add updated_at trigger for biometric_settings
CREATE TRIGGER update_biometric_settings_updated_at
  BEFORE UPDATE ON public.biometric_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_biometric_settings_user_id ON public.biometric_settings(user_id);
CREATE INDEX idx_auth_events_user_id ON public.auth_events(user_id);
CREATE INDEX idx_auth_events_created_at ON public.auth_events(created_at DESC);