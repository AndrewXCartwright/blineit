-- Fix 1: Enhanced KYC validation trigger to match client-side Zod validation exactly
-- This ensures defense in depth with identical validation on both client and server

CREATE OR REPLACE FUNCTION public.validate_kyc_verifications()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_digits_only TEXT;
  v_age_years NUMERIC;
BEGIN
  -- Validate full_legal_name: must be 2-200 chars, only letters, spaces, hyphens, apostrophes
  IF NEW.full_legal_name IS NOT NULL THEN
    IF length(NEW.full_legal_name) < 2 THEN
      RAISE EXCEPTION 'Name must be at least 2 characters';
    END IF;
    
    IF length(NEW.full_legal_name) > 200 THEN
      RAISE EXCEPTION 'Name must be less than 200 characters';
    END IF;
    
    -- Match Zod regex: ^[a-zA-Z\s'-]+$
    IF NEW.full_legal_name !~ '^[a-zA-Z\s''-]+$' THEN
      RAISE EXCEPTION 'Name contains invalid characters';
    END IF;
  END IF;

  -- Validate address_line1: 5-200 chars, alphanumeric with common address chars
  IF NEW.address_line1 IS NOT NULL THEN
    IF length(NEW.address_line1) < 5 THEN
      RAISE EXCEPTION 'Address too short';
    END IF;
    
    IF length(NEW.address_line1) > 200 THEN
      RAISE EXCEPTION 'Address too long';
    END IF;
    
    -- Match Zod regex: ^[a-zA-Z0-9\s,.#-]+$
    IF NEW.address_line1 !~ '^[a-zA-Z0-9\s,.#-]+$' THEN
      RAISE EXCEPTION 'Address contains invalid characters';
    END IF;
  END IF;

  -- Validate address_line2: max 200 chars, alphanumeric with common address chars (optional)
  IF NEW.address_line2 IS NOT NULL AND NEW.address_line2 != '' THEN
    IF length(NEW.address_line2) > 200 THEN
      RAISE EXCEPTION 'Address too long';
    END IF;
    
    -- Match Zod regex: ^[a-zA-Z0-9\s,.#-]*$
    IF NEW.address_line2 !~ '^[a-zA-Z0-9\s,.#-]*$' THEN
      RAISE EXCEPTION 'Address contains invalid characters';
    END IF;
  END IF;

  -- Validate city: 2-100 chars, only letters, spaces, hyphens, apostrophes
  IF NEW.city IS NOT NULL THEN
    IF length(NEW.city) < 2 THEN
      RAISE EXCEPTION 'City name too short';
    END IF;
    
    IF length(NEW.city) > 100 THEN
      RAISE EXCEPTION 'City name too long';
    END IF;
    
    -- Match Zod regex: ^[a-zA-Z\s'-]+$
    IF NEW.city !~ '^[a-zA-Z\s''-]+$' THEN
      RAISE EXCEPTION 'City contains invalid characters';
    END IF;
  END IF;

  -- Validate state: 2-100 chars, only letters, spaces, hyphens
  IF NEW.state IS NOT NULL THEN
    IF length(NEW.state) < 2 THEN
      RAISE EXCEPTION 'State name too short';
    END IF;
    
    IF length(NEW.state) > 100 THEN
      RAISE EXCEPTION 'State name too long';
    END IF;
    
    -- Match Zod regex: ^[a-zA-Z\s-]+$
    IF NEW.state !~ '^[a-zA-Z\s-]+$' THEN
      RAISE EXCEPTION 'State contains invalid characters';
    END IF;
  END IF;

  -- Validate country: 2-100 chars, only letters, spaces, hyphens
  IF NEW.country IS NOT NULL THEN
    IF length(NEW.country) < 2 THEN
      RAISE EXCEPTION 'Country name too short';
    END IF;
    
    IF length(NEW.country) > 100 THEN
      RAISE EXCEPTION 'Country name too long';
    END IF;
    
    -- Match Zod regex: ^[a-zA-Z\s-]+$
    IF NEW.country !~ '^[a-zA-Z\s-]+$' THEN
      RAISE EXCEPTION 'Country contains invalid characters';
    END IF;
  END IF;

  -- Validate date of birth: must be 18-120 years old
  IF NEW.date_of_birth IS NOT NULL THEN
    IF NEW.date_of_birth > current_date THEN
      RAISE EXCEPTION 'Invalid date of birth';
    END IF;

    -- Calculate age in years
    v_age_years := EXTRACT(YEAR FROM age(current_date, NEW.date_of_birth));
    
    IF v_age_years < 18 THEN
      RAISE EXCEPTION 'Must be at least 18 years old';
    END IF;

    IF v_age_years > 120 THEN
      RAISE EXCEPTION 'Invalid date of birth';
    END IF;
  END IF;

  -- Validate phone number: 7-20 chars, matches international format
  IF NEW.phone_number IS NOT NULL THEN
    IF length(NEW.phone_number) < 7 THEN
      RAISE EXCEPTION 'Phone number too short';
    END IF;
    
    IF length(NEW.phone_number) > 20 THEN
      RAISE EXCEPTION 'Phone number too long';
    END IF;

    -- Match Zod regex: ^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$
    IF NEW.phone_number !~ '^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$' THEN
      RAISE EXCEPTION 'Invalid phone number format';
    END IF;

    -- Ensure at least 7 digits
    v_digits_only := regexp_replace(NEW.phone_number, '[^0-9]', '', 'g');
    IF length(v_digits_only) < 7 THEN
      RAISE EXCEPTION 'Phone number must have at least 7 digits';
    END IF;
  END IF;

  -- Validate postal code: 3-20 chars, alphanumeric with spaces/hyphens
  IF NEW.postal_code IS NOT NULL THEN
    IF length(NEW.postal_code) < 3 THEN
      RAISE EXCEPTION 'Postal code too short';
    END IF;
    
    IF length(NEW.postal_code) > 20 THEN
      RAISE EXCEPTION 'Postal code too long';
    END IF;

    -- Match Zod regex: ^[A-Z0-9\s-]{3,20}$/i
    IF NEW.postal_code !~* '^[A-Z0-9\s-]{3,20}$' THEN
      RAISE EXCEPTION 'Invalid postal code format';
    END IF;
  END IF;

  -- Validate SSN last4: exactly 4 digits
  IF NEW.ssn_last4 IS NOT NULL THEN
    IF NEW.ssn_last4 !~ '^[0-9]{4}$' THEN
      RAISE EXCEPTION 'SSN must be exactly 4 digits';
    END IF;
  END IF;

  -- Validate status: must be a valid status value
  IF NEW.status IS NOT NULL THEN
    IF NEW.status NOT IN ('not_started', 'pending', 'in_review', 'verified', 'rejected') THEN
      RAISE EXCEPTION 'Invalid status value';
    END IF;
  END IF;

  -- Validate id_type if provided
  IF NEW.id_type IS NOT NULL THEN
    IF NEW.id_type NOT IN ('drivers_license', 'passport', 'state_id', 'military_id') THEN
      RAISE EXCEPTION 'Invalid ID type';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure trigger exists on kyc_verifications
DROP TRIGGER IF EXISTS validate_kyc_verifications_trigger ON public.kyc_verifications;
CREATE TRIGGER validate_kyc_verifications_trigger
  BEFORE INSERT OR UPDATE ON public.kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_kyc_verifications();

-- Fix 2: Add comments documenting why SECURITY DEFINER is required for transaction functions
-- These functions need DEFINER to perform atomic cross-table operations that bypass RLS

COMMENT ON FUNCTION public.buy_tokens IS 
'SECURITY DEFINER required: Performs atomic token purchase across profiles (wallet deduction) and user_holdings (token addition). Must bypass RLS to update both tables in a single transaction. Auth validated via auth.uid() at start.';

COMMENT ON FUNCTION public.sell_tokens IS 
'SECURITY DEFINER required: Performs atomic token sale across profiles (wallet credit) and user_holdings (token removal). Must bypass RLS to update both tables in a single transaction. Auth validated via auth.uid() at start.';

COMMENT ON FUNCTION public.place_bet IS 
'SECURITY DEFINER required: Performs atomic bet placement across profiles (balance deduction), user_bets (bet creation), and transactions (record). Must bypass RLS for atomicity. Auth validated via auth.uid() at start.';

COMMENT ON FUNCTION public.check_rate_limit IS 
'SECURITY DEFINER required: Updates user_rate_limits table which uses restrictive RLS (SELECT only for users). Function needs to INSERT/UPDATE rate limit records atomically. Auth validated via parameter.';

COMMENT ON FUNCTION public.handle_new_user IS 
'SECURITY DEFINER required: Trigger function that creates profile when user signs up. Runs in auth context without user session. Cannot use RLS as no authenticated user exists yet.';

COMMENT ON FUNCTION public.generate_referral_code IS 
'SECURITY DEFINER required: Trigger function that generates unique referral codes. Must query existing codes to avoid collisions. Runs during INSERT before user context is fully established.';

COMMENT ON FUNCTION public.create_system_notification IS 
'SECURITY DEFINER required: Server-side only function for creating notifications. Users cannot call directly (no INSERT policy). Bypasses RLS intentionally for system notifications.';

COMMENT ON FUNCTION public.notify_bet_result IS 
'SECURITY DEFINER required: Wrapper for create_system_notification. Used by settlement functions to notify users of bet results.';

COMMENT ON FUNCTION public.notify_token_transaction IS 
'SECURITY DEFINER required: Wrapper for create_system_notification. Used by buy_tokens/sell_tokens to notify users of transactions.';