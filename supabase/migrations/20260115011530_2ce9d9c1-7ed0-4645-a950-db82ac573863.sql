-- Create pe_funds table
CREATE TABLE IF NOT EXISTS pe_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_name TEXT NOT NULL,
  fund_manager TEXT NOT NULL,
  gp_name TEXT NOT NULL,
  description TEXT,
  strategy TEXT CHECK (strategy IN ('buyout', 'growth', 'turnaround', 'distressed', 'secondaries', 'fund_of_funds', 'real_assets', 'infrastructure')),
  thesis TEXT,
  target_fund_size DECIMAL NOT NULL,
  current_raised DECIMAL DEFAULT 0,
  min_investment DECIMAL DEFAULT 50000,
  management_fee DECIMAL DEFAULT 2,
  carried_interest DECIMAL DEFAULT 20,
  preferred_return DECIMAL DEFAULT 8,
  fund_term_years INTEGER DEFAULT 10,
  investment_period_years INTEGER DEFAULT 5,
  vintage_year INTEGER,
  fund_stage TEXT CHECK (fund_stage IN ('emerging', 'established', 'flagship')),
  target_company_size TEXT,
  geographic_focus TEXT,
  target_sectors JSONB DEFAULT '[]',
  track_record JSONB DEFAULT '[]',
  team JSONB DEFAULT '[]',
  portfolio_companies JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  exemption_type TEXT DEFAULT 'reg_d_506c',
  image_url TEXT,
  location_city TEXT,
  location_state TEXT,
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pe_funds ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing active funds
CREATE POLICY "Anyone can view active pe funds" ON pe_funds 
  FOR SELECT USING (status = 'active');

-- Add trigger for updated_at
CREATE TRIGGER update_pe_funds_updated_at
  BEFORE UPDATE ON pe_funds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();