-- Create digishares_sync table to map investments to DigiShares STOs
CREATE TABLE IF NOT EXISTS public.digishares_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_type TEXT NOT NULL,
  investment_id UUID NOT NULL,
  digishares_sto_id TEXT,
  digishares_meta_key TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(investment_type, investment_id)
);

-- Enable RLS
ALTER TABLE public.digishares_sync ENABLE ROW LEVEL SECURITY;

-- Only service role can manage sync records
CREATE POLICY "Service role can manage digishares_sync" 
ON public.digishares_sync 
FOR ALL 
USING (auth.role() = 'service_role');

-- Authenticated users can read sync status
CREATE POLICY "Authenticated users can read digishares_sync"
ON public.digishares_sync
FOR SELECT
USING (auth.role() = 'authenticated');