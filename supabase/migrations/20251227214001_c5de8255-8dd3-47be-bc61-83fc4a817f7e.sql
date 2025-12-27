-- Add referred_by and referral_earnings columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(user_id),
ADD COLUMN IF NOT EXISTS referral_earnings numeric DEFAULT 0;

-- Create referral_rewards table for tracking individual rewards
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  referral_id uuid NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  reward_type text NOT NULL, -- signup_bonus, kyc_bonus, investment_bonus, milestone_bonus
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending, credited, expired
  credited_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on referral_rewards
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral_rewards
CREATE POLICY "Users can view their own referral rewards"
ON public.referral_rewards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all referral rewards"
ON public.referral_rewards
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can insert referral rewards"
ON public.referral_rewards
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update referral rewards"
ON public.referral_rewards
FOR UPDATE
USING (is_admin());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON public.referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referral_id ON public.referral_rewards(referral_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);

-- Function to credit referral reward
CREATE OR REPLACE FUNCTION public.credit_referral_reward(
  p_user_id uuid,
  p_referral_id uuid,
  p_reward_type text,
  p_amount numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reward_id uuid;
BEGIN
  -- Insert reward record
  INSERT INTO referral_rewards (user_id, referral_id, reward_type, amount, status, credited_at)
  VALUES (p_user_id, p_referral_id, p_reward_type, p_amount, 'credited', now())
  RETURNING id INTO v_reward_id;
  
  -- Add to user's wallet balance
  UPDATE profiles
  SET wallet_balance = COALESCE(wallet_balance, 0) + p_amount,
      referral_earnings = COALESCE(referral_earnings, 0) + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (p_user_id, 'referral_bonus', p_amount, 'Referral bonus: ' || p_reward_type);
  
  -- Create notification
  PERFORM create_system_notification(
    p_user_id,
    'referral_bonus',
    'Referral Bonus!',
    'You earned $' || p_amount::text || ' from a referral!',
    jsonb_build_object('amount', p_amount, 'reward_type', p_reward_type)
  );
  
  RETURN v_reward_id;
END;
$$;