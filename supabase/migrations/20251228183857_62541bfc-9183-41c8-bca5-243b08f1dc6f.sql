-- Fix signup failure: generate_referral_code() couldn't see gen_random_bytes() when pgcrypto is installed in the extensions schema
CREATE OR REPLACE FUNCTION public.generate_referral_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  IF NEW.referral_code IS NULL THEN
    LOOP
      -- Generate cryptographically secure random code (12 chars)
      new_code := upper(encode(gen_random_bytes(6), 'hex'));

      -- Check for collisions
      SELECT EXISTS(
        SELECT 1 FROM profiles WHERE referral_code = new_code
      ) INTO code_exists;

      EXIT WHEN NOT code_exists;
    END LOOP;

    NEW.referral_code := new_code;
  END IF;
  RETURN NEW;
END;
$function$;