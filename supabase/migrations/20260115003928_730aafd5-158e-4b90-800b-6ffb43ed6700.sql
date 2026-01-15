-- Create private_businesses table for equity and revenue share investments
CREATE TABLE IF NOT EXISTS public.private_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  description TEXT,
  industry TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('revenue_share', 'equity', 'convertible_note', 'profit_share')),
  annual_revenue DECIMAL,
  years_in_operation INTEGER,
  target_raise DECIMAL NOT NULL,
  current_raised DECIMAL DEFAULT 0,
  min_investment DECIMAL DEFAULT 100,
  projected_return DECIMAL,
  term_months INTEGER,
  revenue_share_percentage DECIMAL,
  status TEXT DEFAULT 'active',
  exemption_type TEXT DEFAULT 'reg_cf',
  location_city TEXT,
  location_state TEXT,
  team JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  sponsor_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.private_businesses ENABLE ROW LEVEL SECURITY;

-- Anyone can view active private businesses
CREATE POLICY "Anyone can view active private businesses" 
ON public.private_businesses 
FOR SELECT 
USING (status = 'active');

-- Sponsors can manage their own businesses
CREATE POLICY "Sponsors can insert their own businesses"
ON public.private_businesses
FOR INSERT
WITH CHECK (auth.uid() = sponsor_id);

CREATE POLICY "Sponsors can update their own businesses"
ON public.private_businesses
FOR UPDATE
USING (auth.uid() = sponsor_id);

-- Create updated_at trigger
CREATE TRIGGER update_private_businesses_updated_at
BEFORE UPDATE ON public.private_businesses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();