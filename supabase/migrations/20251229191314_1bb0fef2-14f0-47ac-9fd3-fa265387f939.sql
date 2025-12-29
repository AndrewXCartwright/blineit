-- Create a function to mask sensitive data in request_body for non-owners
CREATE OR REPLACE FUNCTION public.mask_api_request_body(request_body jsonb, log_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the current user is the owner, return full data
  IF auth.uid() = log_user_id THEN
    RETURN request_body;
  END IF;
  
  -- For admins viewing others' data, return masked version
  IF request_body IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Return a sanitized version that only shows structure, not values
  RETURN jsonb_build_object(
    '_masked', true,
    '_reason', 'Sensitive data redacted for privacy',
    '_keys_count', (SELECT count(*) FROM jsonb_object_keys(COALESCE(request_body, '{}'::jsonb)))
  );
END;
$$;

-- Create a view that masks sensitive data for admin access
CREATE OR REPLACE VIEW public.api_requests_log_safe AS
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
  -- Mask request body using the function
  mask_api_request_body(request_body, user_id) as request_body,
  error_message,
  created_at
FROM public.api_requests_log;

-- Grant access to the view
GRANT SELECT ON public.api_requests_log_safe TO authenticated;

-- Create a function to clean up old API logs (30-day retention)
CREATE OR REPLACE FUNCTION public.cleanup_old_api_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.api_requests_log
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create an index to speed up cleanup queries
CREATE INDEX IF NOT EXISTS idx_api_requests_log_created_at 
ON public.api_requests_log(created_at);

-- Add a comment documenting the retention policy
COMMENT ON TABLE public.api_requests_log IS 'API request logs with 30-day retention policy. Sensitive data is masked for admin views via api_requests_log_safe view.';