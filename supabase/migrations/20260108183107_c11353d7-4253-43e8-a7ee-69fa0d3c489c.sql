-- Liquidity Program Settings (per offering)
CREATE TABLE public.liquidity_program_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id UUID NOT NULL REFERENCES public.exclusive_offerings(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  fee_tiers JSONB NOT NULL DEFAULT '[
    {"min_months": 0, "max_months": 12, "fee_percent": 10},
    {"min_months": 12, "max_months": 24, "fee_percent": 7},
    {"min_months": 24, "max_months": 36, "fee_percent": 5},
    {"min_months": 36, "max_months": null, "fee_percent": 3}
  ]'::jsonb,
  reserve_percent NUMERIC NOT NULL DEFAULT 5.0,
  reserve_balance NUMERIC NOT NULL DEFAULT 0,
  max_monthly_redemptions INTEGER,
  min_holding_days INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(offering_id)
);

-- Function to generate liquidity request number
CREATE OR REPLACE FUNCTION public.generate_liquidity_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.request_number := 'LIQ-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
  RETURN NEW;
END;
$$;

-- Liquidity Requests
CREATE TABLE public.liquidity_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE,
  investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offering_id UUID NOT NULL REFERENCES public.exclusive_offerings(id) ON DELETE CASCADE,
  token_holding_id UUID REFERENCES public.user_holdings(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  token_value_at_request NUMERIC NOT NULL,
  holding_start_date DATE NOT NULL,
  holding_period_days INTEGER NOT NULL,
  fee_tier_applied JSONB NOT NULL,
  fee_percent_applied NUMERIC NOT NULL,
  gross_value NUMERIC NOT NULL,
  fee_amount NUMERIC NOT NULL,
  net_payout NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'denied', 'cancelled')),
  denial_reason TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  payout_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER generate_liquidity_request_number_trigger
  BEFORE INSERT ON public.liquidity_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_liquidity_request_number();

-- Function to generate secondary listing number
CREATE OR REPLACE FUNCTION public.generate_secondary_listing_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.listing_number := 'SEC-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
  RETURN NEW;
END;
$$;

-- Secondary Listings
CREATE TABLE public.secondary_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_number TEXT UNIQUE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offering_id UUID NOT NULL REFERENCES public.exclusive_offerings(id) ON DELETE CASCADE,
  token_holding_id UUID REFERENCES public.user_holdings(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_per_token NUMERIC NOT NULL CHECK (price_per_token > 0),
  original_token_price NUMERIC NOT NULL,
  price_change_percent NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled', 'expired')),
  listed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sold_at TIMESTAMPTZ,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER generate_secondary_listing_number_trigger
  BEFORE INSERT ON public.secondary_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_secondary_listing_number();

-- Updated_at triggers
CREATE TRIGGER update_liquidity_program_settings_updated_at
  BEFORE UPDATE ON public.liquidity_program_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_liquidity_requests_updated_at
  BEFORE UPDATE ON public.liquidity_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_secondary_listings_updated_at
  BEFORE UPDATE ON public.secondary_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.liquidity_program_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secondary_listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for liquidity_program_settings
CREATE POLICY "Anyone can view liquidity program settings"
  ON public.liquidity_program_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage liquidity program settings"
  ON public.liquidity_program_settings
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for liquidity_requests
CREATE POLICY "Users can view their own liquidity requests"
  ON public.liquidity_requests
  FOR SELECT
  USING (auth.uid() = investor_id);

CREATE POLICY "Admins can view all liquidity requests"
  ON public.liquidity_requests
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own liquidity requests"
  ON public.liquidity_requests
  FOR INSERT
  WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Users can cancel their own pending liquidity requests"
  ON public.liquidity_requests
  FOR UPDATE
  USING (auth.uid() = investor_id AND status = 'pending')
  WITH CHECK (auth.uid() = investor_id AND status = 'cancelled');

CREATE POLICY "Admins can update all liquidity requests"
  ON public.liquidity_requests
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for secondary_listings
CREATE POLICY "Anyone can view active secondary listings"
  ON public.secondary_listings
  FOR SELECT
  USING (status = 'active' OR auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "Users can create their own listings"
  ON public.secondary_listings
  FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings"
  ON public.secondary_listings
  FOR UPDATE
  USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own listings"
  ON public.secondary_listings
  FOR DELETE
  USING (auth.uid() = seller_id);

-- Indexes for performance
CREATE INDEX idx_liquidity_program_settings_offering ON public.liquidity_program_settings(offering_id);
CREATE INDEX idx_liquidity_requests_investor ON public.liquidity_requests(investor_id);
CREATE INDEX idx_liquidity_requests_offering ON public.liquidity_requests(offering_id);
CREATE INDEX idx_liquidity_requests_status ON public.liquidity_requests(status);
CREATE INDEX idx_secondary_listings_seller ON public.secondary_listings(seller_id);
CREATE INDEX idx_secondary_listings_offering ON public.secondary_listings(offering_id);
CREATE INDEX idx_secondary_listings_status ON public.secondary_listings(status);