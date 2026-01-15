-- Investments table for all investment types
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  investment_type TEXT NOT NULL CHECK (investment_type IN ('real_estate', 'factor', 'lien', 'safe')),
  investment_id UUID NOT NULL,
  amount DECIMAL NOT NULL CHECK (amount > 0),
  tokens DECIMAL NOT NULL CHECK (tokens > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  digishares_transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Users can view their own investments
CREATE POLICY "Users can view own investments" ON investments 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own investments
CREATE POLICY "Users can create investments" ON investments 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending investments
CREATE POLICY "Users can update own pending investments" ON investments 
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Create index for faster queries
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_type_id ON investments(investment_type, investment_id);