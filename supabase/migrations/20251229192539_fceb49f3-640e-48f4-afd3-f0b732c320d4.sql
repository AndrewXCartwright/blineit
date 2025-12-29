-- Create audit log table for tracking admin access to sensitive data
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'view', 'query', 'export', 'update', 'delete'
  table_name TEXT NOT NULL,
  query_context TEXT, -- Description of what was queried
  record_count INTEGER, -- Number of records accessed
  ip_address TEXT,
  user_agent TEXT,
  filters_used JSONB DEFAULT '{}'::jsonb, -- Any filters applied (date range, user_id, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (is_admin());

-- No one can delete audit logs (immutable for compliance)
-- No DELETE policy means no deletions allowed

-- Create indexes for efficient querying
CREATE INDEX idx_admin_audit_log_admin_user ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_log_table ON public.admin_audit_log(table_name);
CREATE INDEX idx_admin_audit_log_created ON public.admin_audit_log(created_at DESC);

-- Function to log admin access
CREATE OR REPLACE FUNCTION public.log_admin_access(
  p_table_name TEXT,
  p_action_type TEXT,
  p_query_context TEXT DEFAULT NULL,
  p_record_count INTEGER DEFAULT NULL,
  p_filters JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_is_admin BOOLEAN;
  v_log_id UUID;
BEGIN
  -- Verify caller is admin
  SELECT is_admin INTO v_is_admin
  FROM profiles
  WHERE user_id = v_user_id;
  
  IF NOT COALESCE(v_is_admin, false) THEN
    RETURN NULL; -- Silently fail for non-admins
  END IF;
  
  -- Validate action type
  IF p_action_type NOT IN ('view', 'query', 'export', 'update', 'delete') THEN
    RAISE EXCEPTION 'Invalid action type';
  END IF;
  
  -- Insert audit log
  INSERT INTO admin_audit_log (
    admin_user_id,
    action_type,
    table_name,
    query_context,
    record_count,
    filters_used
  )
  VALUES (
    v_user_id,
    p_action_type,
    p_table_name,
    p_query_context,
    p_record_count,
    COALESCE(p_filters, '{}'::jsonb)
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Create a secure view for admin transaction access with email masking
CREATE OR REPLACE VIEW public.transactions_admin_view 
WITH (security_invoker = true)
AS
SELECT 
  t.id,
  t.user_id,
  -- Mask user email for privacy
  LEFT(COALESCE(p.email, ''), 3) || '***@***' || RIGHT(COALESCE(p.email, ''), 4) as masked_email,
  t.type,
  t.amount,
  t.description,
  t.property_id,
  t.market_id,
  t.created_at
FROM transactions t
LEFT JOIN profiles p ON p.user_id = t.user_id;

-- Grant access
GRANT SELECT ON public.transactions_admin_view TO authenticated;
GRANT SELECT ON public.admin_audit_log TO authenticated;

-- Add comment
COMMENT ON TABLE public.admin_audit_log IS 'Tracks all admin access to sensitive user data for compliance and security auditing. Records cannot be deleted for compliance purposes.';