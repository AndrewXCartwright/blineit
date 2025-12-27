-- Create loans table
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('bridge', 'construction', 'stabilized', 'mezzanine', 'preferred_equity')),
  description TEXT,
  loan_amount DECIMAL NOT NULL,
  amount_funded DECIMAL NOT NULL DEFAULT 0,
  apy DECIMAL NOT NULL,
  term_months INTEGER NOT NULL,
  ltv_ratio DECIMAL NOT NULL,
  loan_position TEXT NOT NULL CHECK (loan_position IN ('1st_lien', '2nd_lien', 'mezzanine')),
  dscr DECIMAL,
  borrower_type TEXT CHECK (borrower_type IN ('LLC', 'Corporation', 'Individual')),
  personal_guarantee BOOLEAN DEFAULT false,
  property_value DECIMAL,
  min_investment DECIMAL NOT NULL DEFAULT 1000,
  max_investment DECIMAL DEFAULT 100000,
  payment_frequency TEXT DEFAULT 'monthly' CHECK (payment_frequency IN ('monthly', 'quarterly')),
  start_date DATE,
  maturity_date DATE,
  status TEXT NOT NULL DEFAULT 'funding' CHECK (status IN ('funding', 'active', 'paid_off', 'default')),
  investor_count INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_loan_investments table
CREATE TABLE public.user_loan_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  principal_invested DECIMAL NOT NULL,
  investment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expected_monthly_payment DECIMAL NOT NULL,
  total_interest_earned DECIMAL NOT NULL DEFAULT 0,
  total_principal_returned DECIMAL NOT NULL DEFAULT 0,
  next_payment_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid_off', 'default')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loan_payments table
CREATE TABLE public.loan_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  user_investment_id UUID NOT NULL REFERENCES public.user_loan_investments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('interest', 'principal', 'both')),
  amount DECIMAL NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'paid', 'late')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_loan_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

-- Loans are viewable by everyone (public listings)
CREATE POLICY "Loans are viewable by everyone"
ON public.loans FOR SELECT
USING (true);

-- User loan investments policies
CREATE POLICY "Users can view their own loan investments"
ON public.user_loan_investments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loan investments"
ON public.user_loan_investments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loan investments"
ON public.user_loan_investments FOR UPDATE
USING (auth.uid() = user_id);

-- Loan payments policies
CREATE POLICY "Users can view their own loan payments"
ON public.loan_payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loan payments"
ON public.loan_payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_loans_updated_at
BEFORE UPDATE ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_loan_investments_updated_at
BEFORE UPDATE ON public.user_loan_investments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create invest_in_loan function
CREATE OR REPLACE FUNCTION public.invest_in_loan(
  p_loan_id UUID,
  p_amount DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_balance DECIMAL;
  v_loan RECORD;
  v_monthly_payment DECIMAL;
  v_investment_id UUID;
  v_rate_check JSON;
BEGIN
  -- Validate authentication
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  -- Check rate limit
  v_rate_check := check_rate_limit(v_user_id, 10);
  IF NOT (v_rate_check->>'allowed')::boolean THEN
    RETURN json_build_object('success', false, 'error', v_rate_check->>'error');
  END IF;
  
  -- Get loan details with lock
  SELECT * INTO v_loan
  FROM loans
  WHERE id = p_loan_id
  FOR UPDATE;
  
  IF v_loan IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'loan_not_found');
  END IF;
  
  -- Check loan status
  IF v_loan.status != 'funding' THEN
    RETURN json_build_object('success', false, 'error', 'loan_not_accepting_investments');
  END IF;
  
  -- Validate amount
  IF p_amount < v_loan.min_investment THEN
    RETURN json_build_object('success', false, 'error', 'below_minimum_investment');
  END IF;
  
  IF p_amount > v_loan.max_investment THEN
    RETURN json_build_object('success', false, 'error', 'above_maximum_investment');
  END IF;
  
  -- Check remaining funding capacity
  IF (v_loan.amount_funded + p_amount) > v_loan.loan_amount THEN
    RETURN json_build_object('success', false, 'error', 'exceeds_funding_capacity');
  END IF;
  
  -- Get and lock user balance
  SELECT wallet_balance INTO v_balance
  FROM profiles
  WHERE user_id = v_user_id
  FOR UPDATE;
  
  IF v_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'profile_not_found');
  END IF;
  
  IF v_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'insufficient_balance');
  END IF;
  
  -- Calculate monthly payment
  v_monthly_payment := (p_amount * (v_loan.apy / 100)) / 12;
  
  -- Deduct from wallet
  UPDATE profiles
  SET wallet_balance = wallet_balance - p_amount, updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Create investment record
  INSERT INTO user_loan_investments (
    user_id, loan_id, principal_invested, expected_monthly_payment, next_payment_date
  )
  VALUES (
    v_user_id, p_loan_id, p_amount, v_monthly_payment, CURRENT_DATE + INTERVAL '30 days'
  )
  RETURNING id INTO v_investment_id;
  
  -- Update loan funding
  UPDATE loans
  SET 
    amount_funded = amount_funded + p_amount,
    investor_count = investor_count + 1,
    status = CASE WHEN (amount_funded + p_amount) >= loan_amount THEN 'active' ELSE status END,
    updated_at = now()
  WHERE id = p_loan_id;
  
  -- Record transaction
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (v_user_id, 'debt_investment', -p_amount, 'Invested in ' || v_loan.name);
  
  RETURN json_build_object(
    'success', true, 
    'investment_id', v_investment_id,
    'monthly_payment', v_monthly_payment
  );
END;
$$;

-- Enable realtime for loans table
ALTER PUBLICATION supabase_realtime ADD TABLE public.loans;

-- Seed sample loan data
INSERT INTO public.loans (name, loan_type, description, loan_amount, amount_funded, apy, term_months, ltv_ratio, loan_position, dscr, borrower_type, personal_guarantee, property_value, min_investment, max_investment, payment_frequency, maturity_date, status, investor_count, city, state)
VALUES
  ('Sunset Apartments - Bridge Loan', 'bridge', 'Bridge loan secured by a 24-unit multifamily property. The borrower is refinancing to complete renovations and stabilize occupancy.', 2400000, 1872000, 10.5, 18, 65, '1st_lien', 1.45, 'LLC', true, 3700000, 1000, 100000, 'monthly', CURRENT_DATE + INTERVAL '18 months', 'funding', 47, 'Austin', 'TX'),
  ('Marina Heights - Construction', 'construction', 'Construction loan for a new 48-unit luxury apartment complex with waterfront views. Ground-up development with experienced sponsor.', 5100000, 2295000, 13.0, 24, 70, '1st_lien', 1.25, 'LLC', true, 7300000, 2500, 100000, 'monthly', CURRENT_DATE + INTERVAL '24 months', 'funding', 31, 'Miami', 'FL'),
  ('Downtown Tower - Stabilized', 'stabilized', 'Stabilized loan on a Class A office tower with 95% occupancy. Long-term tenants include Fortune 500 companies.', 8200000, 7544000, 8.5, 36, 55, '1st_lien', 1.65, 'Corporation', true, 14900000, 1000, 100000, 'monthly', CURRENT_DATE + INTERVAL '36 months', 'funding', 124, 'Phoenix', 'AZ'),
  ('Palm Gardens - Mezzanine', 'mezzanine', 'Mezzanine financing for a senior living facility expansion. Higher yield opportunity with experienced operator.', 1800000, 1800000, 14.5, 12, 75, 'mezzanine', 1.15, 'LLC', true, 2400000, 5000, 100000, 'monthly', CURRENT_DATE + INTERVAL '12 months', 'active', 28, 'Las Vegas', 'NV'),
  ('Riverfront Plaza - Bridge Loan', 'bridge', 'Bridge loan for retail plaza repositioning. Prime riverfront location with strong tenant demand.', 3200000, 960000, 11.0, 15, 68, '1st_lien', 1.35, 'LLC', true, 4700000, 1000, 100000, 'monthly', CURRENT_DATE + INTERVAL '15 months', 'funding', 19, 'Denver', 'CO');