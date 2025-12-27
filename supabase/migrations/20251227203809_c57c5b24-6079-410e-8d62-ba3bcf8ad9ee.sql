-- Create function to process monthly interest payment for a single investment
CREATE OR REPLACE FUNCTION public.process_interest_payment(p_investment_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_investment RECORD;
  v_loan RECORD;
  v_interest_amount DECIMAL;
  v_payment_id UUID;
BEGIN
  -- Validate authentication
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  -- Get investment with lock
  SELECT * INTO v_investment
  FROM user_loan_investments
  WHERE id = p_investment_id AND user_id = v_user_id
  FOR UPDATE;
  
  IF v_investment IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'investment_not_found');
  END IF;
  
  IF v_investment.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'investment_not_active');
  END IF;
  
  -- Get loan details
  SELECT * INTO v_loan
  FROM loans
  WHERE id = v_investment.loan_id;
  
  IF v_loan IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'loan_not_found');
  END IF;
  
  -- Calculate monthly interest
  v_interest_amount := (v_investment.principal_invested * v_loan.apy / 100) / 12;
  
  -- Create loan payment record
  INSERT INTO loan_payments (loan_id, user_investment_id, user_id, payment_type, amount, status)
  VALUES (v_loan.id, v_investment.id, v_user_id, 'interest', v_interest_amount, 'paid')
  RETURNING id INTO v_payment_id;
  
  -- Add to user's wallet balance
  UPDATE profiles
  SET wallet_balance = wallet_balance + v_interest_amount, updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Update investment totals
  UPDATE user_loan_investments
  SET 
    total_interest_earned = total_interest_earned + v_interest_amount,
    next_payment_date = CURRENT_DATE + INTERVAL '30 days',
    updated_at = now()
  WHERE id = p_investment_id;
  
  -- Create transaction record
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (v_user_id, 'interest_received', v_interest_amount, 
    'Interest payment from ' || v_loan.name);
  
  RETURN json_build_object(
    'success', true, 
    'amount', v_interest_amount,
    'loan_name', v_loan.name,
    'payment_id', v_payment_id
  );
END;
$$;

-- Create function to process all active investments for a user
CREATE OR REPLACE FUNCTION public.process_all_interest_payments()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_investment RECORD;
  v_loan RECORD;
  v_interest_amount DECIMAL;
  v_total_paid DECIMAL := 0;
  v_payment_count INT := 0;
BEGIN
  -- Validate authentication
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  -- Loop through all active investments
  FOR v_investment IN 
    SELECT uli.*, l.name as loan_name, l.apy as loan_apy
    FROM user_loan_investments uli
    JOIN loans l ON l.id = uli.loan_id
    WHERE uli.user_id = v_user_id AND uli.status = 'active'
    FOR UPDATE OF uli
  LOOP
    -- Calculate monthly interest
    v_interest_amount := (v_investment.principal_invested * v_investment.loan_apy / 100) / 12;
    
    -- Create loan payment record
    INSERT INTO loan_payments (loan_id, user_investment_id, user_id, payment_type, amount, status)
    VALUES (v_investment.loan_id, v_investment.id, v_user_id, 'interest', v_interest_amount, 'paid');
    
    -- Update investment totals
    UPDATE user_loan_investments
    SET 
      total_interest_earned = total_interest_earned + v_interest_amount,
      next_payment_date = CURRENT_DATE + INTERVAL '30 days',
      updated_at = now()
    WHERE id = v_investment.id;
    
    -- Create transaction record
    INSERT INTO transactions (user_id, type, amount, description)
    VALUES (v_user_id, 'interest_received', v_interest_amount, 
      'Interest payment from ' || v_investment.loan_name);
    
    v_total_paid := v_total_paid + v_interest_amount;
    v_payment_count := v_payment_count + 1;
  END LOOP;
  
  -- Add total to user's wallet balance
  IF v_total_paid > 0 THEN
    UPDATE profiles
    SET wallet_balance = wallet_balance + v_total_paid, updated_at = now()
    WHERE user_id = v_user_id;
  END IF;
  
  RETURN json_build_object(
    'success', true, 
    'total_amount', v_total_paid,
    'payment_count', v_payment_count
  );
END;
$$;

-- Create function to simulate loan payoff (return principal)
CREATE OR REPLACE FUNCTION public.process_loan_payoff(p_investment_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_investment RECORD;
  v_loan RECORD;
  v_principal_amount DECIMAL;
BEGIN
  -- Validate authentication
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  -- Get investment with lock
  SELECT * INTO v_investment
  FROM user_loan_investments
  WHERE id = p_investment_id AND user_id = v_user_id
  FOR UPDATE;
  
  IF v_investment IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'investment_not_found');
  END IF;
  
  IF v_investment.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'investment_already_paid_off');
  END IF;
  
  -- Get loan details
  SELECT * INTO v_loan
  FROM loans
  WHERE id = v_investment.loan_id;
  
  -- Calculate remaining principal
  v_principal_amount := v_investment.principal_invested - v_investment.total_principal_returned;
  
  -- Create loan payment record for principal
  INSERT INTO loan_payments (loan_id, user_investment_id, user_id, payment_type, amount, status)
  VALUES (v_loan.id, v_investment.id, v_user_id, 'principal', v_principal_amount, 'paid');
  
  -- Add to user's wallet balance
  UPDATE profiles
  SET wallet_balance = wallet_balance + v_principal_amount, updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Update investment status
  UPDATE user_loan_investments
  SET 
    status = 'paid_off',
    total_principal_returned = principal_invested,
    updated_at = now()
  WHERE id = p_investment_id;
  
  -- Create transaction record
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (v_user_id, 'principal_returned', v_principal_amount, 
    'Principal returned from ' || v_loan.name);
  
  RETURN json_build_object(
    'success', true, 
    'principal_amount', v_principal_amount,
    'loan_name', v_loan.name,
    'total_interest_earned', v_investment.total_interest_earned
  );
END;
$$;