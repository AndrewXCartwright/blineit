-- Create atomic RPC function for placing bets with balance validation
CREATE OR REPLACE FUNCTION public.place_bet(
  p_market_id UUID,
  p_position TEXT,
  p_amount NUMERIC,
  p_entry_price NUMERIC
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_balance NUMERIC;
  v_shares NUMERIC;
  v_market_status TEXT;
BEGIN
  -- Validate authentication
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  -- Validate inputs
  IF p_amount <= 0 OR p_entry_price <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'invalid_amount');
  END IF;
  
  IF p_position NOT IN ('YES', 'NO') THEN
    RETURN json_build_object('success', false, 'error', 'invalid_position');
  END IF;
  
  -- Check market exists and is open
  SELECT status INTO v_market_status
  FROM prediction_markets
  WHERE id = p_market_id;
  
  IF v_market_status IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'market_not_found');
  END IF;
  
  IF v_market_status != 'open' THEN
    RETURN json_build_object('success', false, 'error', 'market_closed');
  END IF;
  
  -- Lock and check balance atomically
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
  
  -- Calculate shares
  v_shares := p_amount / (p_entry_price / 100);
  
  -- Deduct balance atomically
  UPDATE profiles
  SET wallet_balance = wallet_balance - p_amount, updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Insert bet record
  INSERT INTO user_bets (user_id, market_id, position, shares, entry_price, amount, status)
  VALUES (v_user_id, p_market_id, p_position, v_shares, p_entry_price, p_amount, 'active');
  
  -- Insert transaction record
  INSERT INTO transactions (user_id, type, amount, description, market_id)
  VALUES (v_user_id, 'bet_placed', -p_amount, 'Placed ' || p_position || ' bet', p_market_id);
  
  RETURN json_build_object('success', true, 'shares', v_shares);
END;
$$;