-- Create drip_settings table for user DRIP preferences
CREATE TABLE public.drip_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  drip_type TEXT NOT NULL DEFAULT 'same_property',
  reinvest_equity_dividends BOOLEAN NOT NULL DEFAULT true,
  reinvest_debt_interest BOOLEAN NOT NULL DEFAULT true,
  reinvest_prediction_winnings BOOLEAN NOT NULL DEFAULT false,
  minimum_reinvest_amount DECIMAL NOT NULL DEFAULT 10.00,
  drip_balance DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create drip_property_settings table for per-property DRIP settings
CREATE TABLE public.drip_property_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  reinvest_to TEXT NOT NULL DEFAULT 'same_property',
  custom_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- Create drip_transactions table for DRIP activity log
CREATE TABLE public.drip_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  source_amount DECIMAL NOT NULL,
  reinvest_property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tokens_purchased DECIMAL NOT NULL,
  token_price DECIMAL NOT NULL,
  reinvest_amount DECIMAL NOT NULL,
  remainder_to_balance DECIMAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drip_summary table for aggregated DRIP stats
CREATE TABLE public.drip_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period TEXT NOT NULL,
  period_start DATE NOT NULL,
  total_reinvested DECIMAL NOT NULL DEFAULT 0,
  tokens_acquired DECIMAL NOT NULL DEFAULT 0,
  estimated_extra_value DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, period, period_start)
);

-- Enable RLS on all tables
ALTER TABLE public.drip_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drip_property_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drip_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drip_summary ENABLE ROW LEVEL SECURITY;

-- RLS policies for drip_settings
CREATE POLICY "Users can view their own DRIP settings"
  ON public.drip_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own DRIP settings"
  ON public.drip_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own DRIP settings"
  ON public.drip_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all DRIP settings"
  ON public.drip_settings FOR SELECT
  USING (is_admin());

-- RLS policies for drip_property_settings
CREATE POLICY "Users can view their own property DRIP settings"
  ON public.drip_property_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own property DRIP settings"
  ON public.drip_property_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own property DRIP settings"
  ON public.drip_property_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own property DRIP settings"
  ON public.drip_property_settings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for drip_transactions
CREATE POLICY "Users can view their own DRIP transactions"
  ON public.drip_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own DRIP transactions"
  ON public.drip_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all DRIP transactions"
  ON public.drip_transactions FOR SELECT
  USING (is_admin());

-- RLS policies for drip_summary
CREATE POLICY "Users can view their own DRIP summary"
  ON public.drip_summary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own DRIP summary"
  ON public.drip_summary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own DRIP summary"
  ON public.drip_summary FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all DRIP summaries"
  ON public.drip_summary FOR SELECT
  USING (is_admin());

-- Create indexes for better query performance
CREATE INDEX idx_drip_settings_user ON public.drip_settings(user_id);
CREATE INDEX idx_drip_property_settings_user ON public.drip_property_settings(user_id);
CREATE INDEX idx_drip_property_settings_property ON public.drip_property_settings(property_id);
CREATE INDEX idx_drip_transactions_user ON public.drip_transactions(user_id);
CREATE INDEX idx_drip_transactions_created ON public.drip_transactions(created_at DESC);
CREATE INDEX idx_drip_summary_user_period ON public.drip_summary(user_id, period, period_start);

-- Create trigger for updated_at on drip_settings
CREATE TRIGGER update_drip_settings_updated_at
  BEFORE UPDATE ON public.drip_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();