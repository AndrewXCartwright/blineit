-- Add server-side validation for KYC data to prevent client-side bypass

CREATE OR REPLACE FUNCTION public.validate_kyc_verifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_digits_only TEXT;
BEGIN
  -- Prevent basic HTML/script injection markers from being stored
  IF NEW.full_legal_name IS NOT NULL AND (position('<' in NEW.full_legal_name) > 0 OR position('>' in NEW.full_legal_name) > 0) THEN
    RAISE EXCEPTION 'Invalid full legal name';
  END IF;

  IF NEW.address_line1 IS NOT NULL AND (position('<' in NEW.address_line1) > 0 OR position('>' in NEW.address_line1) > 0) THEN
    RAISE EXCEPTION 'Invalid address';
  END IF;

  IF NEW.address_line2 IS NOT NULL AND (position('<' in NEW.address_line2) > 0 OR position('>' in NEW.address_line2) > 0) THEN
    RAISE EXCEPTION 'Invalid address';
  END IF;

  IF NEW.city IS NOT NULL AND (position('<' in NEW.city) > 0 OR position('>' in NEW.city) > 0) THEN
    RAISE EXCEPTION 'Invalid city';
  END IF;

  IF NEW.state IS NOT NULL AND (position('<' in NEW.state) > 0 OR position('>' in NEW.state) > 0) THEN
    RAISE EXCEPTION 'Invalid state';
  END IF;

  IF NEW.country IS NOT NULL AND (position('<' in NEW.country) > 0 OR position('>' in NEW.country) > 0) THEN
    RAISE EXCEPTION 'Invalid country';
  END IF;

  -- Validate date of birth (only when present)
  IF NEW.date_of_birth IS NOT NULL THEN
    IF NEW.date_of_birth > current_date THEN
      RAISE EXCEPTION 'Invalid date of birth';
    END IF;

    -- Must be at least 18 years old
    IF NEW.date_of_birth > (current_date - INTERVAL '18 years')::date THEN
      RAISE EXCEPTION 'Must be at least 18 years old';
    END IF;

    -- Must be no older than 120 years
    IF NEW.date_of_birth < (current_date - INTERVAL '120 years')::date THEN
      RAISE EXCEPTION 'Invalid date of birth';
    END IF;
  END IF;

  -- Validate phone number format (only when present)
  IF NEW.phone_number IS NOT NULL THEN
    IF length(NEW.phone_number) < 7 OR length(NEW.phone_number) > 20 THEN
      RAISE EXCEPTION 'Invalid phone number';
    END IF;

    IF NEW.phone_number !~ '^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$' THEN
      RAISE EXCEPTION 'Invalid phone number';
    END IF;

    -- Ensure at least 7 digits
    v_digits_only := regexp_replace(NEW.phone_number, '[^0-9]', '', 'g');
    IF length(v_digits_only) < 7 THEN
      RAISE EXCEPTION 'Invalid phone number';
    END IF;
  END IF;

  -- Validate postal code (only when present)
  IF NEW.postal_code IS NOT NULL THEN
    IF length(NEW.postal_code) > 20 THEN
      RAISE EXCEPTION 'Invalid postal code';
    END IF;

    IF NEW.postal_code !~* '^[A-Z0-9\s-]{3,20}$' THEN
      RAISE EXCEPTION 'Invalid postal code';
    END IF;
  END IF;

  -- Validate SSN last4 format (only when present)
  IF NEW.ssn_last4 IS NOT NULL AND NEW.ssn_last4 !~ '^[0-9]{4}$' THEN
    RAISE EXCEPTION 'Invalid SSN last4';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_kyc_before_insert_or_update ON public.kyc_verifications;

CREATE TRIGGER validate_kyc_before_insert_or_update
BEFORE INSERT OR UPDATE ON public.kyc_verifications
FOR EACH ROW
EXECUTE FUNCTION public.validate_kyc_verifications();
