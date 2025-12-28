
-- Create accredited_investors table
CREATE TABLE public.accredited_investors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  investor_type TEXT NOT NULL CHECK (investor_type IN ('individual', 'entity', 'trust', 'ira')),
  accreditation_type TEXT NOT NULL CHECK (accreditation_type IN ('income', 'net_worth', 'professional', 'entity')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'expired', 'rejected')),
  verification_method TEXT CHECK (verification_method IN ('self_certified', 'third_party', 'documents')),
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  annual_income DECIMAL,
  net_worth DECIMAL,
  documents JSONB DEFAULT '[]'::jsonb,
  reviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_accreditation UNIQUE (user_id)
);

-- Create institutional_accounts table
CREATE TABLE public.institutional_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('corporation', 'llc', 'partnership', 'trust', 'fund', 'family_office')),
  ein TEXT,
  formation_state TEXT,
  formation_date DATE,
  aum DECIMAL,
  authorized_signers JSONB DEFAULT '[]'::jsonb,
  compliance_contact JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  tier TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('standard', 'premium', 'elite')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_institutional UNIQUE (user_id)
);

-- Create exclusive_offerings table
CREATE TABLE public.exclusive_offerings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  offering_type TEXT NOT NULL CHECK (offering_type IN ('property', 'fund', 'syndication', 'debt')),
  minimum_investment DECIMAL NOT NULL,
  target_raise DECIMAL NOT NULL,
  current_raised DECIMAL NOT NULL DEFAULT 0,
  target_irr DECIMAL,
  target_multiple DECIMAL,
  hold_period_years INTEGER,
  investor_requirements JSONB DEFAULT '{}'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'coming_soon' CHECK (status IN ('coming_soon', 'open', 'fully_subscribed', 'closed')),
  opens_at TIMESTAMP WITH TIME ZONE,
  closes_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create institutional_transactions table
CREATE TABLE public.institutional_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institutional_account_id UUID NOT NULL REFERENCES institutional_accounts(id) ON DELETE CASCADE,
  offering_id UUID NOT NULL REFERENCES exclusive_offerings(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  shares_units DECIMAL NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription', 'redemption', 'distribution')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  wire_reference TEXT,
  documents_signed JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create relationship_managers table
CREATE TABLE public.relationship_managers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  calendar_link TEXT,
  assigned_accounts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accredited_investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exclusive_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_managers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accredited_investors
CREATE POLICY "Users can view their own accreditation" ON public.accredited_investors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accreditation" ON public.accredited_investors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending accreditation" ON public.accredited_investors
  FOR UPDATE USING (auth.uid() = user_id AND verification_status IN ('pending', 'expired', 'rejected'));

CREATE POLICY "Admins can manage all accreditations" ON public.accredited_investors
  FOR ALL USING (is_admin());

-- RLS Policies for institutional_accounts
CREATE POLICY "Users can view their own institutional account" ON public.institutional_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own institutional account" ON public.institutional_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own institutional account" ON public.institutional_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all institutional accounts" ON public.institutional_accounts
  FOR ALL USING (is_admin());

-- RLS Policies for exclusive_offerings
CREATE POLICY "Verified investors can view open offerings" ON public.exclusive_offerings
  FOR SELECT USING (
    status IN ('open', 'fully_subscribed') AND
    EXISTS (
      SELECT 1 FROM accredited_investors 
      WHERE user_id = auth.uid() AND verification_status = 'verified'
    )
  );

CREATE POLICY "Admins can manage all offerings" ON public.exclusive_offerings
  FOR ALL USING (is_admin());

-- RLS Policies for institutional_transactions
CREATE POLICY "Users can view their own transactions" ON public.institutional_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM institutional_accounts 
      WHERE id = institutional_account_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own transactions" ON public.institutional_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM institutional_accounts 
      WHERE id = institutional_account_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all transactions" ON public.institutional_transactions
  FOR ALL USING (is_admin());

-- RLS Policies for relationship_managers
CREATE POLICY "Verified investors can view relationship managers" ON public.relationship_managers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM accredited_investors 
      WHERE user_id = auth.uid() AND verification_status = 'verified'
    )
  );

CREATE POLICY "Admins can manage relationship managers" ON public.relationship_managers
  FOR ALL USING (is_admin());

-- Add updated_at triggers
CREATE TRIGGER update_accredited_investors_updated_at
  BEFORE UPDATE ON public.accredited_investors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutional_accounts_updated_at
  BEFORE UPDATE ON public.institutional_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
