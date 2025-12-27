-- Fix 1: Restrict profiles table to only allow users to view their own profile
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = user_id);

-- Fix 2: Add database constraints for KYC validation
ALTER TABLE public.kyc_verifications
ADD CONSTRAINT check_name_length CHECK (full_legal_name IS NULL OR length(full_legal_name) BETWEEN 2 AND 200),
ADD CONSTRAINT check_ssn_format CHECK (ssn_last4 IS NULL OR ssn_last4 ~ '^[0-9]{4}$'),
ADD CONSTRAINT check_phone_length CHECK (phone_number IS NULL OR length(phone_number) BETWEEN 7 AND 20),
ADD CONSTRAINT check_address_length CHECK (address_line1 IS NULL OR length(address_line1) <= 200),
ADD CONSTRAINT check_city_length CHECK (city IS NULL OR length(city) <= 100),
ADD CONSTRAINT check_state_length CHECK (state IS NULL OR length(state) <= 100),
ADD CONSTRAINT check_postal_code_length CHECK (postal_code IS NULL OR length(postal_code) <= 20),
ADD CONSTRAINT check_country_length CHECK (country IS NULL OR length(country) <= 100);

-- Fix 3: Create secure server-side function for buying tokens
CREATE OR REPLACE FUNCTION public.buy_tokens(
  p_property_id UUID,
  p_tokens NUMERIC,
  p_token_price NUMERIC
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_subtotal NUMERIC;
  v_fee NUMERIC;
  v_total_cost NUMERIC;
  v_balance NUMERIC;
  v_existing_tokens NUMERIC;
  v_existing_avg_price NUMERIC;
  v_new_tokens NUMERIC;
  v_new_avg_price NUMERIC;
BEGIN
  -- Validate inputs
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  IF p_tokens <= 0 OR p_token_price <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'invalid_input');
  END IF;
  
  -- Calculate costs
  v_subtotal := p_tokens * p_token_price;
  v_fee := v_subtotal * 0.01;
  v_total_cost := v_subtotal + v_fee;
  
  -- Get and lock user balance
  SELECT wallet_balance INTO v_balance
  FROM profiles
  WHERE user_id = v_user_id
  FOR UPDATE;
  
  IF v_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'profile_not_found');
  END IF;
  
  IF v_balance < v_total_cost THEN
    RETURN json_build_object('success', false, 'error', 'insufficient_balance');
  END IF;
  
  -- Check existing holdings
  SELECT tokens, average_buy_price INTO v_existing_tokens, v_existing_avg_price
  FROM user_holdings
  WHERE user_id = v_user_id AND property_id = p_property_id
  FOR UPDATE;
  
  IF v_existing_tokens IS NOT NULL THEN
    -- Update existing holding
    v_new_tokens := v_existing_tokens + p_tokens;
    v_new_avg_price := ((v_existing_tokens * v_existing_avg_price) + v_subtotal) / v_new_tokens;
    
    UPDATE user_holdings
    SET tokens = v_new_tokens, average_buy_price = v_new_avg_price, updated_at = now()
    WHERE user_id = v_user_id AND property_id = p_property_id;
  ELSE
    -- Create new holding
    INSERT INTO user_holdings (user_id, property_id, tokens, average_buy_price)
    VALUES (v_user_id, p_property_id, p_tokens, p_token_price);
  END IF;
  
  -- Deduct from wallet
  UPDATE profiles
  SET wallet_balance = wallet_balance - v_total_cost, updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Record transaction
  INSERT INTO transactions (user_id, type, amount, description, property_id)
  VALUES (v_user_id, 'buy_tokens', -v_total_cost, 'Purchased ' || p_tokens::text || ' tokens', p_property_id);
  
  RETURN json_build_object('success', true, 'tokens', p_tokens, 'total_cost', v_total_cost);
END;
$$;

-- Create secure server-side function for selling tokens
CREATE OR REPLACE FUNCTION public.sell_tokens(
  p_property_id UUID,
  p_tokens NUMERIC,
  p_token_price NUMERIC
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_subtotal NUMERIC;
  v_fee NUMERIC;
  v_proceeds NUMERIC;
  v_existing_tokens NUMERIC;
  v_new_tokens NUMERIC;
BEGIN
  -- Validate inputs
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  IF p_tokens <= 0 OR p_token_price <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'invalid_input');
  END IF;
  
  -- Calculate proceeds
  v_subtotal := p_tokens * p_token_price;
  v_fee := v_subtotal * 0.01;
  v_proceeds := v_subtotal - v_fee;
  
  -- Get and lock existing holding
  SELECT tokens INTO v_existing_tokens
  FROM user_holdings
  WHERE user_id = v_user_id AND property_id = p_property_id
  FOR UPDATE;
  
  IF v_existing_tokens IS NULL OR v_existing_tokens < p_tokens THEN
    RETURN json_build_object('success', false, 'error', 'insufficient_tokens');
  END IF;
  
  v_new_tokens := v_existing_tokens - p_tokens;
  
  IF v_new_tokens <= 0 THEN
    -- Delete the holding
    DELETE FROM user_holdings
    WHERE user_id = v_user_id AND property_id = p_property_id;
  ELSE
    -- Update the holding
    UPDATE user_holdings
    SET tokens = v_new_tokens, updated_at = now()
    WHERE user_id = v_user_id AND property_id = p_property_id;
  END IF;
  
  -- Add to wallet
  UPDATE profiles
  SET wallet_balance = wallet_balance + v_proceeds, updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Record transaction
  INSERT INTO transactions (user_id, type, amount, description, property_id)
  VALUES (v_user_id, 'sell_tokens', v_proceeds, 'Sold ' || p_tokens::text || ' tokens', p_property_id);
  
  RETURN json_build_object('success', true, 'proceeds', v_proceeds);
END;
$$;