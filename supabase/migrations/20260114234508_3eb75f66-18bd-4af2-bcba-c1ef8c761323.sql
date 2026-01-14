-- Factor deals table
CREATE TABLE IF NOT EXISTS factor_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  invoice_amount DECIMAL NOT NULL,
  discount_rate DECIMAL NOT NULL,
  term_days INTEGER NOT NULL,
  factor_type TEXT NOT NULL,
  risk_rating TEXT,
  status TEXT DEFAULT 'active',
  min_investment DECIMAL DEFAULT 100,
  target_raise DECIMAL,
  current_raised DECIMAL DEFAULT 0,
  documents JSONB DEFAULT '[]',
  sponsor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lien deals table
CREATE TABLE IF NOT EXISTS lien_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  property_address TEXT NOT NULL,
  property_city TEXT,
  property_state TEXT,
  lien_position TEXT NOT NULL,
  principal_amount DECIMAL NOT NULL,
  interest_rate DECIMAL NOT NULL,
  term_months INTEGER NOT NULL,
  collateral_value DECIMAL NOT NULL,
  ltv_ratio DECIMAL,
  status TEXT DEFAULT 'active',
  min_investment DECIMAL DEFAULT 100,
  documents JSONB DEFAULT '[]',
  sponsor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAFE deals table
CREATE TABLE IF NOT EXISTS safe_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  description TEXT,
  stage TEXT NOT NULL,
  valuation_cap DECIMAL,
  discount_rate DECIMAL,
  has_mfn BOOLEAN DEFAULT false,
  has_pro_rata BOOLEAN DEFAULT false,
  target_raise DECIMAL NOT NULL,
  current_raised DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'active',
  min_investment DECIMAL DEFAULT 100,
  team JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  sponsor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE factor_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE lien_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_deals ENABLE ROW LEVEL SECURITY;

-- Public read policies for active deals
CREATE POLICY "Anyone can view active factor deals" ON factor_deals FOR SELECT USING (status = 'active');
CREATE POLICY "Anyone can view active lien deals" ON lien_deals FOR SELECT USING (status = 'active');
CREATE POLICY "Anyone can view active safe deals" ON safe_deals FOR SELECT USING (status = 'active');

-- Sponsor management policies
CREATE POLICY "Sponsors can manage their factor deals" ON factor_deals FOR ALL USING (auth.uid() = sponsor_id);
CREATE POLICY "Sponsors can manage their lien deals" ON lien_deals FOR ALL USING (auth.uid() = sponsor_id);
CREATE POLICY "Sponsors can manage their safe deals" ON safe_deals FOR ALL USING (auth.uid() = sponsor_id);