-- Secondary Market Tables

-- Listings (Sell Orders)
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('property_token', 'loan_token')),
  item_id UUID NOT NULL,
  token_quantity NUMERIC NOT NULL CHECK (token_quantity > 0),
  price_per_token NUMERIC NOT NULL CHECK (price_per_token > 0),
  total_price NUMERIC GENERATED ALWAYS AS (token_quantity * price_per_token) STORED,
  min_purchase_quantity NUMERIC NOT NULL DEFAULT 1 CHECK (min_purchase_quantity > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'partially_filled', 'filled', 'cancelled', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  filled_quantity NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Buy Orders
CREATE TABLE public.buy_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('property_token', 'loan_token')),
  item_id UUID NOT NULL,
  token_quantity NUMERIC NOT NULL CHECK (token_quantity > 0),
  max_price_per_token NUMERIC NOT NULL CHECK (max_price_per_token > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'partially_filled', 'filled', 'cancelled', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  filled_quantity NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trades
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id),
  buy_order_id UUID REFERENCES public.buy_orders(id),
  seller_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  token_quantity NUMERIC NOT NULL CHECK (token_quantity > 0),
  price_per_token NUMERIC NOT NULL CHECK (price_per_token > 0),
  total_price NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL DEFAULT 0,
  seller_receives NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'disputed')),
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Token Price History
CREATE TABLE public.token_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  price NUMERIC NOT NULL,
  volume NUMERIC NOT NULL DEFAULT 0,
  trade_count INTEGER NOT NULL DEFAULT 0,
  high NUMERIC,
  low NUMERIC,
  period TEXT NOT NULL CHECK (period IN ('hourly', 'daily')),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_listings_item ON public.listings(item_type, item_id);
CREATE INDEX idx_listings_seller ON public.listings(seller_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_buy_orders_item ON public.buy_orders(item_type, item_id);
CREATE INDEX idx_buy_orders_buyer ON public.buy_orders(buyer_id);
CREATE INDEX idx_buy_orders_status ON public.buy_orders(status);
CREATE INDEX idx_trades_item ON public.trades(item_type, item_id);
CREATE INDEX idx_trades_seller ON public.trades(seller_id);
CREATE INDEX idx_trades_buyer ON public.trades(buyer_id);
CREATE INDEX idx_token_price_history_item ON public.token_price_history(item_type, item_id, period, period_start);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buy_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_price_history ENABLE ROW LEVEL SECURITY;

-- Listings policies
CREATE POLICY "Anyone can view active listings" ON public.listings FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "Users can create their own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own listings" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete their own listings" ON public.listings FOR DELETE USING (auth.uid() = seller_id AND status IN ('active', 'partially_filled'));
CREATE POLICY "Admins can view all listings" ON public.listings FOR SELECT USING (is_admin());

-- Buy orders policies
CREATE POLICY "Users can view their own buy orders" ON public.buy_orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can create their own buy orders" ON public.buy_orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update their own buy orders" ON public.buy_orders FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "Users can delete their own buy orders" ON public.buy_orders FOR DELETE USING (auth.uid() = buyer_id AND status IN ('active', 'partially_filled'));
CREATE POLICY "Admins can view all buy orders" ON public.buy_orders FOR SELECT USING (is_admin());
CREATE POLICY "Sellers can view buy orders for their listings" ON public.buy_orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.listings WHERE listings.item_id = buy_orders.item_id AND listings.seller_id = auth.uid())
);

-- Trades policies
CREATE POLICY "Users can view their own trades" ON public.trades FOR SELECT USING (auth.uid() = seller_id OR auth.uid() = buyer_id);
CREATE POLICY "Admins can view all trades" ON public.trades FOR SELECT USING (is_admin());

-- Token price history policies
CREATE POLICY "Anyone can view price history" ON public.token_price_history FOR SELECT USING (true);
CREATE POLICY "Admins can insert price history" ON public.token_price_history FOR INSERT WITH CHECK (is_admin());

-- Trigger for updated_at on listings
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on buy_orders
CREATE TRIGGER update_buy_orders_updated_at
  BEFORE UPDATE ON public.buy_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to execute a market trade
CREATE OR REPLACE FUNCTION public.execute_market_trade(
  p_listing_id UUID,
  p_buyer_id UUID,
  p_quantity NUMERIC
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_listing RECORD;
  v_buyer_balance NUMERIC;
  v_total_cost NUMERIC;
  v_platform_fee NUMERIC;
  v_seller_receives NUMERIC;
  v_trade_id UUID;
  v_remaining_quantity NUMERIC;
BEGIN
  -- Get and lock listing
  SELECT * INTO v_listing FROM listings WHERE id = p_listing_id FOR UPDATE;
  
  IF v_listing IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'listing_not_found');
  END IF;
  
  IF v_listing.status NOT IN ('active', 'partially_filled') THEN
    RETURN json_build_object('success', false, 'error', 'listing_not_available');
  END IF;
  
  IF v_listing.seller_id = p_buyer_id THEN
    RETURN json_build_object('success', false, 'error', 'cannot_buy_own_listing');
  END IF;
  
  v_remaining_quantity := v_listing.token_quantity - v_listing.filled_quantity;
  
  IF p_quantity > v_remaining_quantity THEN
    RETURN json_build_object('success', false, 'error', 'insufficient_tokens_available');
  END IF;
  
  IF p_quantity < v_listing.min_purchase_quantity AND p_quantity != v_remaining_quantity THEN
    RETURN json_build_object('success', false, 'error', 'below_minimum_purchase');
  END IF;
  
  -- Calculate costs
  v_total_cost := p_quantity * v_listing.price_per_token;
  v_platform_fee := v_total_cost * 0.01;
  v_seller_receives := v_total_cost - v_platform_fee;
  
  -- Check buyer balance
  SELECT wallet_balance INTO v_buyer_balance FROM profiles WHERE user_id = p_buyer_id FOR UPDATE;
  
  IF v_buyer_balance < (v_total_cost + v_platform_fee) THEN
    RETURN json_build_object('success', false, 'error', 'insufficient_balance');
  END IF;
  
  -- Deduct from buyer
  UPDATE profiles SET wallet_balance = wallet_balance - (v_total_cost + v_platform_fee), updated_at = now() WHERE user_id = p_buyer_id;
  
  -- Credit seller
  UPDATE profiles SET wallet_balance = wallet_balance + v_seller_receives, updated_at = now() WHERE user_id = v_listing.seller_id;
  
  -- Transfer tokens
  IF v_listing.item_type = 'property_token' THEN
    -- Add to buyer holdings
    INSERT INTO user_holdings (user_id, property_id, tokens, average_buy_price)
    VALUES (p_buyer_id, v_listing.item_id, p_quantity, v_listing.price_per_token)
    ON CONFLICT (user_id, property_id) DO UPDATE
    SET tokens = user_holdings.tokens + p_quantity,
        average_buy_price = ((user_holdings.tokens * user_holdings.average_buy_price) + (p_quantity * v_listing.price_per_token)) / (user_holdings.tokens + p_quantity),
        updated_at = now();
  END IF;
  
  -- Create trade record
  INSERT INTO trades (listing_id, seller_id, buyer_id, item_type, item_id, token_quantity, price_per_token, total_price, platform_fee, seller_receives, status, executed_at)
  VALUES (p_listing_id, v_listing.seller_id, p_buyer_id, v_listing.item_type, v_listing.item_id, p_quantity, v_listing.price_per_token, v_total_cost, v_platform_fee, v_seller_receives, 'completed', now())
  RETURNING id INTO v_trade_id;
  
  -- Update listing
  UPDATE listings
  SET filled_quantity = filled_quantity + p_quantity,
      status = CASE WHEN filled_quantity + p_quantity >= token_quantity THEN 'filled' ELSE 'partially_filled' END,
      updated_at = now()
  WHERE id = p_listing_id;
  
  -- Record transactions
  INSERT INTO transactions (user_id, type, amount, description, property_id)
  VALUES 
    (p_buyer_id, 'market_buy', -(v_total_cost + v_platform_fee), 'Bought ' || p_quantity || ' tokens on secondary market', CASE WHEN v_listing.item_type = 'property_token' THEN v_listing.item_id ELSE NULL END),
    (v_listing.seller_id, 'market_sell', v_seller_receives, 'Sold ' || p_quantity || ' tokens on secondary market', CASE WHEN v_listing.item_type = 'property_token' THEN v_listing.item_id ELSE NULL END);
  
  RETURN json_build_object('success', true, 'trade_id', v_trade_id, 'total_cost', v_total_cost + v_platform_fee, 'seller_receives', v_seller_receives);
END;
$$;

-- Function to create a listing
CREATE OR REPLACE FUNCTION public.create_listing(
  p_item_type TEXT,
  p_item_id UUID,
  p_quantity NUMERIC,
  p_price_per_token NUMERIC,
  p_min_purchase NUMERIC DEFAULT 1,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_tokens NUMERIC;
  v_listing_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  -- Check token ownership
  IF p_item_type = 'property_token' THEN
    SELECT tokens INTO v_user_tokens FROM user_holdings WHERE user_id = v_user_id AND property_id = p_item_id FOR UPDATE;
    
    IF v_user_tokens IS NULL OR v_user_tokens < p_quantity THEN
      RETURN json_build_object('success', false, 'error', 'insufficient_tokens');
    END IF;
    
    -- Lock tokens by reducing available
    UPDATE user_holdings SET tokens = tokens - p_quantity, updated_at = now() WHERE user_id = v_user_id AND property_id = p_item_id;
  END IF;
  
  -- Create listing
  INSERT INTO listings (seller_id, item_type, item_id, token_quantity, price_per_token, min_purchase_quantity, expires_at)
  VALUES (v_user_id, p_item_type, p_item_id, p_quantity, p_price_per_token, p_min_purchase, p_expires_at)
  RETURNING id INTO v_listing_id;
  
  RETURN json_build_object('success', true, 'listing_id', v_listing_id);
END;
$$;

-- Function to cancel a listing
CREATE OR REPLACE FUNCTION public.cancel_listing(p_listing_id UUID) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_listing RECORD;
  v_remaining_quantity NUMERIC;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  SELECT * INTO v_listing FROM listings WHERE id = p_listing_id AND seller_id = v_user_id FOR UPDATE;
  
  IF v_listing IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'listing_not_found');
  END IF;
  
  IF v_listing.status NOT IN ('active', 'partially_filled') THEN
    RETURN json_build_object('success', false, 'error', 'listing_not_cancellable');
  END IF;
  
  v_remaining_quantity := v_listing.token_quantity - v_listing.filled_quantity;
  
  -- Return tokens
  IF v_listing.item_type = 'property_token' THEN
    UPDATE user_holdings SET tokens = tokens + v_remaining_quantity, updated_at = now() WHERE user_id = v_user_id AND property_id = v_listing.item_id;
  END IF;
  
  -- Update listing status
  UPDATE listings SET status = 'cancelled', updated_at = now() WHERE id = p_listing_id;
  
  RETURN json_build_object('success', true, 'tokens_returned', v_remaining_quantity);
END;
$$;