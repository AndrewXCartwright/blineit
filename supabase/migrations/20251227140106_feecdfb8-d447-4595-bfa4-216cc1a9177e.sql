-- Fix: Remove permissive INSERT policy that allows any user to create notifications for anyone
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a secure SECURITY DEFINER function for creating system notifications
-- This can only be called from other server-side functions, not directly by users
CREATE OR REPLACE FUNCTION public.create_system_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_notification_id UUID;
  v_valid_types TEXT[] := ARRAY['bet_won', 'bet_lost', 'bet_placed', 'tokens_bought', 'tokens_sold', 'dividend_paid', 'kyc_approved', 'kyc_rejected', 'referral_bonus', 'system'];
BEGIN
  -- Validate notification type
  IF p_type IS NULL OR NOT (p_type = ANY(v_valid_types)) THEN
    RAISE EXCEPTION 'Invalid notification type: %', COALESCE(p_type, 'NULL');
  END IF;
  
  -- Validate required fields
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;
  
  IF p_title IS NULL OR length(trim(p_title)) = 0 THEN
    RAISE EXCEPTION 'Title is required';
  END IF;
  
  IF p_message IS NULL OR length(trim(p_message)) = 0 THEN
    RAISE EXCEPTION 'Message is required';
  END IF;
  
  -- Validate length limits
  IF length(p_title) > 200 THEN
    RAISE EXCEPTION 'Title too long (max 200 characters)';
  END IF;
  
  IF length(p_message) > 1000 THEN
    RAISE EXCEPTION 'Message too long (max 1000 characters)';
  END IF;
  
  -- Insert notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, trim(p_title), trim(p_message), COALESCE(p_data, '{}'::jsonb))
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Create helper function specifically for bet results (called from place_bet or settlement functions)
CREATE OR REPLACE FUNCTION public.notify_bet_result(
  p_user_id UUID,
  p_won BOOLEAN,
  p_amount NUMERIC,
  p_market_title TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN create_system_notification(
    p_user_id,
    CASE WHEN p_won THEN 'bet_won' ELSE 'bet_lost' END,
    CASE WHEN p_won THEN 'Bet Won!' ELSE 'Bet Lost' END,
    CASE 
      WHEN p_won THEN 'Congratulations! You won $' || p_amount::text || ' on "' || COALESCE(p_market_title, 'Unknown Market') || '"'
      ELSE 'Your bet on "' || COALESCE(p_market_title, 'Unknown Market') || '" did not win.'
    END,
    jsonb_build_object('amount', p_amount, 'market_title', p_market_title, 'won', p_won)
  );
END;
$$;

-- Create helper function for token transactions
CREATE OR REPLACE FUNCTION public.notify_token_transaction(
  p_user_id UUID,
  p_is_buy BOOLEAN,
  p_tokens NUMERIC,
  p_property_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN create_system_notification(
    p_user_id,
    CASE WHEN p_is_buy THEN 'tokens_bought' ELSE 'tokens_sold' END,
    CASE WHEN p_is_buy THEN 'Tokens Purchased' ELSE 'Tokens Sold' END,
    CASE 
      WHEN p_is_buy THEN 'You purchased ' || p_tokens::text || ' tokens of "' || COALESCE(p_property_name, 'Unknown Property') || '"'
      ELSE 'You sold ' || p_tokens::text || ' tokens of "' || COALESCE(p_property_name, 'Unknown Property') || '"'
    END,
    jsonb_build_object('tokens', p_tokens, 'property_name', p_property_name, 'is_buy', p_is_buy)
  );
END;
$$;