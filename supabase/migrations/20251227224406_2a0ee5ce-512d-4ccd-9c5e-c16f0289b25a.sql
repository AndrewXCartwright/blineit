-- Create linked_accounts table for bank accounts
CREATE TABLE public.linked_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  plaid_item_id text,
  plaid_access_token text,
  institution_id text,
  institution_name text NOT NULL,
  institution_logo text,
  account_id text,
  account_name text NOT NULL,
  account_type text NOT NULL DEFAULT 'checking',
  account_mask text,
  is_primary boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  verification_status text DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create transfers table for deposits/withdrawals
CREATE TABLE public.transfers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  linked_account_id uuid REFERENCES public.linked_accounts(id) ON DELETE SET NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  plaid_transfer_id text,
  confirmation_number text,
  initiated_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  failure_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create plaid_identity_verification table
CREATE TABLE public.plaid_identity_verification (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  plaid_idv_id text,
  status text NOT NULL DEFAULT 'pending',
  verified_name text,
  verified_address text,
  verified_dob date,
  risk_level text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plaid_identity_verification ENABLE ROW LEVEL SECURITY;

-- RLS policies for linked_accounts
CREATE POLICY "Users can view their own linked accounts"
  ON public.linked_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own linked accounts"
  ON public.linked_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own linked accounts"
  ON public.linked_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own linked accounts"
  ON public.linked_accounts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all linked accounts"
  ON public.linked_accounts FOR SELECT
  USING (is_admin());

-- RLS policies for transfers
CREATE POLICY "Users can view their own transfers"
  ON public.transfers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transfers"
  ON public.transfers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transfers"
  ON public.transfers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transfers"
  ON public.transfers FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all transfers"
  ON public.transfers FOR UPDATE
  USING (is_admin());

-- RLS policies for plaid_identity_verification
CREATE POLICY "Users can view their own identity verification"
  ON public.plaid_identity_verification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own identity verification"
  ON public.plaid_identity_verification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all identity verifications"
  ON public.plaid_identity_verification FOR SELECT
  USING (is_admin());

-- Indexes
CREATE INDEX idx_linked_accounts_user_id ON public.linked_accounts(user_id);
CREATE INDEX idx_transfers_user_id ON public.transfers(user_id);
CREATE INDEX idx_transfers_status ON public.transfers(status);
CREATE INDEX idx_transfers_created_at ON public.transfers(created_at DESC);

-- Function to generate confirmation number
CREATE OR REPLACE FUNCTION public.generate_transfer_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.confirmation_number := CASE 
    WHEN NEW.type = 'deposit' THEN 'DEP-'
    ELSE 'WTH-'
  END || to_char(now(), 'YYYYMMDD') || lpad(floor(random() * 100000)::text, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_transfer_confirmation
  BEFORE INSERT ON public.transfers
  FOR EACH ROW
  EXECUTE FUNCTION generate_transfer_confirmation();

-- Function to process deposit
CREATE OR REPLACE FUNCTION public.process_deposit(
  p_linked_account_id uuid,
  p_amount numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_transfer_id uuid;
  v_account RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'invalid_amount');
  END IF;
  
  IF p_amount > 50000 THEN
    RETURN json_build_object('success', false, 'error', 'exceeds_limit');
  END IF;
  
  -- Verify account ownership
  SELECT * INTO v_account
  FROM linked_accounts
  WHERE id = p_linked_account_id AND user_id = v_user_id;
  
  IF v_account IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'account_not_found');
  END IF;
  
  IF NOT v_account.is_verified THEN
    RETURN json_build_object('success', false, 'error', 'account_not_verified');
  END IF;
  
  -- Create transfer record
  INSERT INTO transfers (user_id, linked_account_id, type, amount, status)
  VALUES (v_user_id, p_linked_account_id, 'deposit', p_amount, 'pending')
  RETURNING id INTO v_transfer_id;
  
  RETURN json_build_object(
    'success', true,
    'transfer_id', v_transfer_id
  );
END;
$$;

-- Function to process withdrawal
CREATE OR REPLACE FUNCTION public.process_withdrawal(
  p_linked_account_id uuid,
  p_amount numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_transfer_id uuid;
  v_account RECORD;
  v_balance numeric;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'invalid_amount');
  END IF;
  
  IF p_amount > 25000 THEN
    RETURN json_build_object('success', false, 'error', 'exceeds_limit');
  END IF;
  
  -- Check balance
  SELECT wallet_balance INTO v_balance
  FROM profiles
  WHERE user_id = v_user_id
  FOR UPDATE;
  
  IF v_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'insufficient_balance');
  END IF;
  
  -- Verify account ownership
  SELECT * INTO v_account
  FROM linked_accounts
  WHERE id = p_linked_account_id AND user_id = v_user_id;
  
  IF v_account IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'account_not_found');
  END IF;
  
  IF NOT v_account.is_verified THEN
    RETURN json_build_object('success', false, 'error', 'account_not_verified');
  END IF;
  
  -- Deduct from wallet
  UPDATE profiles
  SET wallet_balance = wallet_balance - p_amount, updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Create transfer record
  INSERT INTO transfers (user_id, linked_account_id, type, amount, status)
  VALUES (v_user_id, p_linked_account_id, 'withdrawal', p_amount, 'pending')
  RETURNING id INTO v_transfer_id;
  
  -- Record transaction
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (v_user_id, 'withdrawal', -p_amount, 'Withdrawal to ' || v_account.institution_name || ' ****' || v_account.account_mask);
  
  RETURN json_build_object(
    'success', true,
    'transfer_id', v_transfer_id
  );
END;
$$;

-- Function to complete transfer (for demo/admin)
CREATE OR REPLACE FUNCTION public.complete_transfer(p_transfer_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transfer RECORD;
BEGIN
  SELECT * INTO v_transfer
  FROM transfers
  WHERE id = p_transfer_id
  FOR UPDATE;
  
  IF v_transfer IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'transfer_not_found');
  END IF;
  
  IF v_transfer.status != 'pending' AND v_transfer.status != 'processing' THEN
    RETURN json_build_object('success', false, 'error', 'invalid_status');
  END IF;
  
  -- For deposits, add to wallet
  IF v_transfer.type = 'deposit' THEN
    UPDATE profiles
    SET wallet_balance = wallet_balance + v_transfer.amount, updated_at = now()
    WHERE user_id = v_transfer.user_id;
    
    INSERT INTO transactions (user_id, type, amount, description)
    VALUES (v_transfer.user_id, 'deposit', v_transfer.amount, 'Deposit from linked bank account');
  END IF;
  
  -- Update transfer status
  UPDATE transfers
  SET status = 'completed', completed_at = now()
  WHERE id = p_transfer_id;
  
  RETURN json_build_object('success', true);
END;
$$;