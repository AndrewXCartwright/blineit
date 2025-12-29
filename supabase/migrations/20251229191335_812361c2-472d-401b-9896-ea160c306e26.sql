-- Drop the SECURITY DEFINER view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.api_requests_log_safe;

-- Recreate the view with SECURITY INVOKER (which is the default and safer)
CREATE VIEW public.api_requests_log_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  api_key_id,
  user_id,
  endpoint,
  method,
  status_code,
  response_time_ms,
  -- Mask IP address for non-owners (show only first octet)
  CASE 
    WHEN auth.uid() = user_id THEN ip_address
    ELSE regexp_replace(COALESCE(ip_address, ''), '(\d+)\.\d+\.\d+\.\d+', '\1.xxx.xxx.xxx')
  END as ip_address,
  -- Mask user agent for non-owners
  CASE 
    WHEN auth.uid() = user_id THEN user_agent
    ELSE LEFT(COALESCE(user_agent, ''), 50) || CASE WHEN LENGTH(COALESCE(user_agent, '')) > 50 THEN '...' ELSE '' END
  END as user_agent,
  -- Mask request body for non-owners
  CASE 
    WHEN auth.uid() = user_id THEN request_body
    ELSE jsonb_build_object(
      '_masked', true,
      '_reason', 'Sensitive data redacted for privacy'
    )
  END as request_body,
  error_message,
  created_at
FROM public.api_requests_log;

-- Grant access to the view
GRANT SELECT ON public.api_requests_log_safe TO authenticated;

-- Drop the old function that used SECURITY DEFINER unnecessarily
DROP FUNCTION IF EXISTS public.mask_api_request_body(jsonb, uuid);