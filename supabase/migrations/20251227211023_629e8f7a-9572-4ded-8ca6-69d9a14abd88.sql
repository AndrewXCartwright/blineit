-- Add is_admin column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster admin lookups
CREATE INDEX idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;

-- Create admin check function for RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND is_admin = true
  )
$$;

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());

-- Allow admins to update all profiles  
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.is_admin());

-- Allow admins to view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (public.is_admin());

-- Allow admins to view all user_holdings
CREATE POLICY "Admins can view all holdings"
ON public.user_holdings
FOR SELECT
USING (public.is_admin());

-- Allow admins to view all user_bets
CREATE POLICY "Admins can view all bets"
ON public.user_bets
FOR SELECT
USING (public.is_admin());

-- Allow admins to view all user_loan_investments
CREATE POLICY "Admins can view all loan investments"
ON public.user_loan_investments
FOR SELECT
USING (public.is_admin());

-- Allow admins to insert/update/delete properties
CREATE POLICY "Admins can insert properties"
ON public.properties
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update properties"
ON public.properties
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete properties"
ON public.properties
FOR DELETE
USING (public.is_admin());

-- Allow admins to insert/update/delete loans
CREATE POLICY "Admins can insert loans"
ON public.loans
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update loans"
ON public.loans
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete loans"
ON public.loans
FOR DELETE
USING (public.is_admin());

-- Allow admins to insert/update prediction_markets
CREATE POLICY "Admins can insert prediction markets"
ON public.prediction_markets
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update prediction markets"
ON public.prediction_markets
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete prediction markets"
ON public.prediction_markets
FOR DELETE
USING (public.is_admin());

-- Allow admins to view all waitlist entries
CREATE POLICY "Admins can view all waitlist entries"
ON public.waitlist
FOR SELECT
USING (public.is_admin());

-- Allow admins to delete waitlist entries
CREATE POLICY "Admins can delete waitlist entries"
ON public.waitlist
FOR DELETE
USING (public.is_admin());

-- Allow admins to view all KYC verifications
CREATE POLICY "Admins can view all KYC verifications"
ON public.kyc_verifications
FOR SELECT
USING (public.is_admin());

-- Allow admins to update KYC verifications (for approval/rejection)
CREATE POLICY "Admins can update all KYC verifications"
ON public.kyc_verifications
FOR UPDATE
USING (public.is_admin());

-- Allow admins to view all notifications
CREATE POLICY "Admins can view all notifications"
ON public.notifications
FOR SELECT
USING (public.is_admin());

-- Allow admins to view all loan_payments
CREATE POLICY "Admins can view all loan payments"
ON public.loan_payments
FOR SELECT
USING (public.is_admin());

-- Allow admins to view all referrals
CREATE POLICY "Admins can view all referrals"
ON public.referrals
FOR SELECT
USING (public.is_admin());