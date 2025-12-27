-- Create portfolio_snapshots table
CREATE TABLE public.portfolio_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_value DECIMAL NOT NULL DEFAULT 0,
  equity_value DECIMAL NOT NULL DEFAULT 0,
  debt_value DECIMAL NOT NULL DEFAULT 0,
  prediction_value DECIMAL NOT NULL DEFAULT 0,
  cash_balance DECIMAL NOT NULL DEFAULT 0,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asset_price_history table
CREATE TABLE public.asset_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  price DECIMAL NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_performance table
CREATE TABLE public.user_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period TEXT NOT NULL,
  period_start DATE NOT NULL,
  starting_value DECIMAL NOT NULL DEFAULT 0,
  ending_value DECIMAL NOT NULL DEFAULT 0,
  deposits DECIMAL NOT NULL DEFAULT 0,
  withdrawals DECIMAL NOT NULL DEFAULT 0,
  dividends_earned DECIMAL NOT NULL DEFAULT 0,
  interest_earned DECIMAL NOT NULL DEFAULT 0,
  prediction_pnl DECIMAL NOT NULL DEFAULT 0,
  total_return DECIMAL NOT NULL DEFAULT 0,
  return_percentage DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_performance ENABLE ROW LEVEL SECURITY;

-- Portfolio snapshots policies
CREATE POLICY "Users can view their own snapshots"
  ON public.portfolio_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snapshots"
  ON public.portfolio_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all snapshots"
  ON public.portfolio_snapshots FOR SELECT
  USING (is_admin());

-- Asset price history policies (public read for market data)
CREATE POLICY "Anyone can view price history"
  ON public.asset_price_history FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert price history"
  ON public.asset_price_history FOR INSERT
  WITH CHECK (is_admin());

-- User performance policies
CREATE POLICY "Users can view their own performance"
  ON public.user_performance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own performance"
  ON public.user_performance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all performance"
  ON public.user_performance FOR SELECT
  USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_portfolio_snapshots_user_date ON public.portfolio_snapshots(user_id, snapshot_date);
CREATE INDEX idx_asset_price_history_entity ON public.asset_price_history(entity_type, entity_id, recorded_at);
CREATE INDEX idx_user_performance_user_period ON public.user_performance(user_id, period, period_start);