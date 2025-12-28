-- Create auto_invest_plans table
CREATE TABLE public.auto_invest_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  amount NUMERIC NOT NULL,
  funding_source TEXT NOT NULL DEFAULT 'wallet',
  linked_account_id UUID REFERENCES public.linked_accounts(id) ON DELETE SET NULL,
  insufficient_funds_action TEXT NOT NULL DEFAULT 'skip',
  start_date DATE NOT NULL,
  next_execution_date DATE NOT NULL,
  last_execution_date DATE,
  total_invested NUMERIC NOT NULL DEFAULT 0,
  total_executions INTEGER NOT NULL DEFAULT 0,
  paused_at TIMESTAMP WITH TIME ZONE,
  pause_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'cancelled')),
  CONSTRAINT valid_frequency CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
  CONSTRAINT valid_funding_source CHECK (funding_source IN ('wallet', 'linked_account')),
  CONSTRAINT valid_insufficient_action CHECK (insufficient_funds_action IN ('skip', 'partial', 'pause'))
);

-- Create auto_invest_allocations table
CREATE TABLE public.auto_invest_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.auto_invest_plans(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id UUID,
  category TEXT,
  allocation_percent NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_target_type CHECK (target_type IN ('property', 'loan', 'category')),
  CONSTRAINT valid_allocation CHECK (allocation_percent > 0 AND allocation_percent <= 100)
);

-- Create auto_invest_executions table
CREATE TABLE public.auto_invest_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.auto_invest_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  execution_date DATE NOT NULL,
  total_amount NUMERIC NOT NULL,
  actual_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_execution_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'partial'))
);

-- Create auto_invest_execution_details table
CREATE TABLE public.auto_invest_execution_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL REFERENCES public.auto_invest_executions(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  target_name TEXT NOT NULL,
  intended_amount NUMERIC NOT NULL,
  actual_amount NUMERIC NOT NULL DEFAULT 0,
  tokens_purchased NUMERIC NOT NULL DEFAULT 0,
  token_price NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  transaction_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auto_invest_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_invest_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_invest_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_invest_execution_details ENABLE ROW LEVEL SECURITY;

-- RLS policies for auto_invest_plans
CREATE POLICY "Users can view their own plans" ON public.auto_invest_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans" ON public.auto_invest_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" ON public.auto_invest_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans" ON public.auto_invest_plans
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all plans" ON public.auto_invest_plans
  FOR SELECT USING (is_admin());

-- RLS policies for auto_invest_allocations
CREATE POLICY "Users can view allocations of their plans" ON public.auto_invest_allocations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.auto_invest_plans WHERE id = plan_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert allocations for their plans" ON public.auto_invest_allocations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.auto_invest_plans WHERE id = plan_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update allocations of their plans" ON public.auto_invest_allocations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.auto_invest_plans WHERE id = plan_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete allocations of their plans" ON public.auto_invest_allocations
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.auto_invest_plans WHERE id = plan_id AND user_id = auth.uid())
  );

-- RLS policies for auto_invest_executions
CREATE POLICY "Users can view their own executions" ON public.auto_invest_executions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own executions" ON public.auto_invest_executions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all executions" ON public.auto_invest_executions
  FOR SELECT USING (is_admin());

-- RLS policies for auto_invest_execution_details
CREATE POLICY "Users can view details of their executions" ON public.auto_invest_execution_details
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.auto_invest_executions WHERE id = execution_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert details for their executions" ON public.auto_invest_execution_details
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.auto_invest_executions WHERE id = execution_id AND user_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX idx_auto_invest_plans_user ON public.auto_invest_plans(user_id);
CREATE INDEX idx_auto_invest_plans_status ON public.auto_invest_plans(status);
CREATE INDEX idx_auto_invest_plans_next_execution ON public.auto_invest_plans(next_execution_date);
CREATE INDEX idx_auto_invest_allocations_plan ON public.auto_invest_allocations(plan_id);
CREATE INDEX idx_auto_invest_executions_plan ON public.auto_invest_executions(plan_id);
CREATE INDEX idx_auto_invest_executions_user ON public.auto_invest_executions(user_id);
CREATE INDEX idx_auto_invest_execution_details_execution ON public.auto_invest_execution_details(execution_id);

-- Trigger for updated_at
CREATE TRIGGER update_auto_invest_plans_updated_at
  BEFORE UPDATE ON public.auto_invest_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();