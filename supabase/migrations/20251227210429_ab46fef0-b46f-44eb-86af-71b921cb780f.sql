-- Create waitlist table for coming soon asset classes
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  asset_class TEXT NOT NULL CHECK (asset_class IN ('gold_commodities', 'private_business', 'startups_vc')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified BOOLEAN NOT NULL DEFAULT false,
  referral_code TEXT,
  referred_by TEXT,
  UNIQUE(email, asset_class)
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Everyone can view waitlist counts (for display purposes)
CREATE POLICY "Anyone can view waitlist counts"
ON public.waitlist
FOR SELECT
USING (true);

-- Anyone can join the waitlist
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist
FOR INSERT
WITH CHECK (true);

-- Users can update their own waitlist entries
CREATE POLICY "Users can update their own waitlist entries"
ON public.waitlist
FOR UPDATE
USING (
  (user_id IS NOT NULL AND auth.uid() = user_id) OR
  (user_id IS NULL AND email = current_setting('request.jwt.claims', true)::json->>'email')
);

-- Create index for faster lookups
CREATE INDEX idx_waitlist_asset_class ON public.waitlist(asset_class);
CREATE INDEX idx_waitlist_email ON public.waitlist(email);
CREATE INDEX idx_waitlist_user_id ON public.waitlist(user_id);