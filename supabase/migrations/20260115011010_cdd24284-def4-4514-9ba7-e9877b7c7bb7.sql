-- Create vc_funds table
CREATE TABLE IF NOT EXISTS vc_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_name TEXT NOT NULL,
  fund_manager TEXT NOT NULL,
  gp_name TEXT NOT NULL,
  description TEXT,
  thesis TEXT,
  target_fund_size DECIMAL NOT NULL,
  current_raised DECIMAL DEFAULT 0,
  min_investment DECIMAL DEFAULT 25000,
  management_fee DECIMAL DEFAULT 2,
  carried_interest DECIMAL DEFAULT 20,
  fund_term_years INTEGER DEFAULT 10,
  vintage_year INTEGER,
  fund_stage TEXT CHECK (fund_stage IN ('emerging', 'established', 'flagship')),
  investment_focus TEXT,
  target_portfolio_size INTEGER,
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
ALTER TABLE vc_funds ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing active funds
CREATE POLICY "Anyone can view active vc funds" ON vc_funds 
  FOR SELECT USING (status = 'active');

-- Add trigger for updated_at
CREATE TRIGGER update_vc_funds_updated_at
  BEFORE UPDATE ON vc_funds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();