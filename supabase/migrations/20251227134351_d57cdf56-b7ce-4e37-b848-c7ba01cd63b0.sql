-- Fix Issue 1: Update user_bets position constraint from bull/bear to YES/NO
ALTER TABLE public.user_bets DROP CONSTRAINT IF EXISTS user_bets_position_check;
ALTER TABLE public.user_bets ADD CONSTRAINT user_bets_position_check 
  CHECK (position IN ('YES', 'NO'));

-- Update existing data if any
UPDATE public.user_bets SET position = 'YES' WHERE position = 'bull';
UPDATE public.user_bets SET position = 'NO' WHERE position = 'bear';

-- Fix Issue 2: Create rate limiting table
CREATE TABLE IF NOT EXISTS public.user_rate_limits (
  user_id UUID PRIMARY KEY,
  last_trade_at TIMESTAMP WITH TIME ZONE,
  trades_last_minute INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.user_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow users to view/update their own rate limits (managed by RPC functions)
CREATE POLICY "Users can view their own rate limits"
ON public.user_rate_limits FOR SELECT
USING (auth.uid() = user_id);

-- Create helper function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id UUID, p_max_per_minute INTEGER DEFAULT 10)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_trades_this_minute INTEGER;
  v_last_trade TIMESTAMP WITH TIME ZONE;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get recent trading activity with lock
  SELECT trades_last_minute, last_trade_at, window_start
  INTO v_trades_this_minute, v_last_trade, v_window_start
  FROM user_rate_limits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_rate_limits (user_id, trades_last_minute, last_trade_at, window_start)
    VALUES (p_user_id, 1, now(), now());
    RETURN json_build_object('allowed', true);
  END IF;
  
  -- Reset counter if window expired
  IF now() - v_window_start > INTERVAL '1 minute' THEN
    UPDATE user_rate_limits
    SET trades_last_minute = 1, last_trade_at = now(), window_start = now()
    WHERE user_id = p_user_id;
    RETURN json_build_object('allowed', true);
  END IF;
  
  -- Check rate limit
  IF v_trades_this_minute >= p_max_per_minute THEN
    RETURN json_build_object('allowed', false, 'error', 'rate_limit_exceeded');
  END IF;
  
  -- Check minimum interval (1 second between trades)
  IF v_last_trade IS NOT NULL AND (now() - v_last_trade) < INTERVAL '1 second' THEN
    RETURN json_build_object('allowed', false, 'error', 'too_fast');
  END IF;
  
  -- Update counters
  UPDATE user_rate_limits
  SET trades_last_minute = trades_last_minute + 1, last_trade_at = now()
  WHERE user_id = p_user_id;
  
  RETURN json_build_object('allowed', true);
END;
$$;

-- Update buy_tokens function with rate limiting
CREATE OR REPLACE FUNCTION public.buy_tokens(p_property_id uuid, p_tokens numeric, p_token_price numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  v_rate_check json;
BEGIN
  -- Validate authentication
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  -- Check rate limit (10 trades per minute for token operations)
  v_rate_check := check_rate_limit(v_user_id, 10);
  IF NOT (v_rate_check->>'allowed')::boolean THEN
    RETURN json_build_object('success', false, 'error', v_rate_check->>'error');
  END IF;
  
  -- Validate inputs
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

-- Update sell_tokens function with rate limiting
CREATE OR REPLACE FUNCTION public.sell_tokens(p_property_id uuid, p_tokens numeric, p_token_price numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_subtotal NUMERIC;
  v_fee NUMERIC;
  v_proceeds NUMERIC;
  v_existing_tokens NUMERIC;
  v_new_tokens NUMERIC;
  v_rate_check json;
BEGIN
  -- Validate authentication
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  -- Check rate limit (10 trades per minute for token operations)
  v_rate_check := check_rate_limit(v_user_id, 10);
  IF NOT (v_rate_check->>'allowed')::boolean THEN
    RETURN json_build_object('success', false, 'error', v_rate_check->>'error');
  END IF;
  
  -- Validate inputs
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

-- Update place_bet function with rate limiting
CREATE OR REPLACE FUNCTION public.place_bet(p_market_id uuid, p_position text, p_amount numeric, p_entry_price numeric)
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
  v_rate_check json;
BEGIN
  -- Validate authentication
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  -- Check rate limit (20 bets per minute)
  v_rate_check := check_rate_limit(v_user_id, 20);
  IF NOT (v_rate_check->>'allowed')::boolean THEN
    RETURN json_build_object('success', false, 'error', v_rate_check->>'error');
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