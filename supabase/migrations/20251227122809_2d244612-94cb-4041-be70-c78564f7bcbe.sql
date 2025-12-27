-- Add wallet_balance to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL DEFAULT 10000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing columns if needed
UPDATE public.profiles SET wallet_balance = 10000 WHERE wallet_balance IS NULL;

-- Add title and status to prediction_markets if not exists
ALTER TABLE public.prediction_markets ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.prediction_markets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';

-- Update existing markets with status
UPDATE public.prediction_markets 
SET status = CASE 
  WHEN is_resolved = true THEN 'resolved'
  WHEN expires_at < now() THEN 'closed'
  ELSE 'open'
END
WHERE status IS NULL;

-- Add status to user_bets if not exists
ALTER TABLE public.user_bets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
UPDATE public.user_bets 
SET status = CASE 
  WHEN is_settled = true AND payout > 0 THEN 'won'
  WHEN is_settled = true AND (payout IS NULL OR payout = 0) THEN 'lost'
  ELSE 'active'
END
WHERE status IS NULL;

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  market_id UUID REFERENCES public.prediction_markets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update the handle_new_user function to include wallet_balance
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, display_name, wallet_balance)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    10000
  );
  RETURN new;
END;
$$;