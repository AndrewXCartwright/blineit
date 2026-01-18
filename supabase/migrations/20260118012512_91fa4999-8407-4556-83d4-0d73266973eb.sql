-- Add sponsor_id to vc_funds and pe_funds
ALTER TABLE public.vc_funds ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES auth.users(id);
ALTER TABLE public.pe_funds ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES auth.users(id);

-- Create RLS policies for investments (excluding vc_funds and pe_funds for now as they need sponsor_id)
DROP POLICY IF EXISTS "Sponsors view investments in their offerings" ON public.investments;
DROP POLICY IF EXISTS "Sponsors update investments in their offerings" ON public.investments;

CREATE POLICY "Sponsors view investments in their offerings" ON public.investments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.properties WHERE properties.id = investments.investment_id AND properties.sponsor_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.factor_deals WHERE factor_deals.id = investments.investment_id AND factor_deals.sponsor_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.lien_deals WHERE lien_deals.id = investments.investment_id AND lien_deals.sponsor_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.safe_deals WHERE safe_deals.id = investments.investment_id AND safe_deals.sponsor_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.vc_funds WHERE vc_funds.id = investments.investment_id AND vc_funds.sponsor_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.pe_funds WHERE pe_funds.id = investments.investment_id AND pe_funds.sponsor_id = auth.uid()
  )
);

CREATE POLICY "Sponsors update investments in their offerings" ON public.investments FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.properties WHERE properties.id = investments.investment_id AND properties.sponsor_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.factor_deals WHERE factor_deals.id = investments.investment_id AND factor_deals.sponsor_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.lien_deals WHERE lien_deals.id = investments.investment_id AND lien_deals.sponsor_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.safe_deals WHERE safe_deals.id = investments.investment_id AND safe_deals.sponsor_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.vc_funds WHERE vc_funds.id = investments.investment_id AND vc_funds.sponsor_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.pe_funds WHERE pe_funds.id = investments.investment_id AND pe_funds.sponsor_id = auth.uid()
  )
);