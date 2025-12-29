-- Drop and recreate the view with security_invoker = true
-- This makes the view respect RLS policies of underlying tables
DROP VIEW IF EXISTS public.api_requests_log_safe;

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
  error_message,
  ip_address,
  user_agent,
  request_body,
  created_at
FROM public.api_requests_log;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.api_requests_log_safe IS 'Safe view of API request logs that respects RLS policies from the underlying api_requests_log table. Only admins and the owning user can see their logs.';