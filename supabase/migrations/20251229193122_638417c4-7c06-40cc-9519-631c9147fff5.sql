-- Drop and recreate the view with security_invoker = true
-- This makes the view respect RLS policies of underlying tables (transactions table has admin-only SELECT)
DROP VIEW IF EXISTS public.transactions_admin_view;

CREATE VIEW public.transactions_admin_view
WITH (security_invoker = true)
AS
SELECT 
    t.id,
    t.user_id,
    (left(COALESCE(p.email, ''::text), 3) || '***@***'::text) || right(COALESCE(p.email, ''::text), 4) AS masked_email,
    t.type,
    t.amount,
    t.description,
    t.property_id,
    t.market_id,
    t.created_at
FROM transactions t
LEFT JOIN profiles p ON p.user_id = t.user_id;

COMMENT ON VIEW public.transactions_admin_view IS 'Admin view of transactions with masked emails. Uses security_invoker to enforce RLS from underlying tables - only admins can access.';