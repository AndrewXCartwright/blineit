-- Sponsor distributions
CREATE TABLE IF NOT EXISTS public.sponsor_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.sponsor_deals(id) ON DELETE CASCADE NOT NULL,
  distribution_date DATE NOT NULL,
  total_amount NUMERIC NOT NULL,
  distribution_type TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform fees
CREATE TABLE IF NOT EXISTS public.sponsor_platform_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES public.sponsor_profiles(id) ON DELETE CASCADE NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  total_aum NUMERIC NOT NULL,
  fee_rate NUMERIC DEFAULT 0.005,
  fee_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  paid_at TIMESTAMPTZ,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsor messages
CREATE TABLE IF NOT EXISTS public.sponsor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES public.sponsor_profiles(id) ON DELETE CASCADE NOT NULL,
  deal_id UUID REFERENCES public.sponsor_deals(id) ON DELETE SET NULL,
  recipient_id UUID,
  message_type TEXT NOT NULL CHECK (message_type IN ('announcement', 'direct', 'support')),
  subject TEXT,
  body TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsor deal updates (for investor communications)
CREATE TABLE IF NOT EXISTS public.sponsor_deal_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.sponsor_deals(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  notify_investors BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.sponsor_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_platform_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_deal_updates ENABLE ROW LEVEL SECURITY;

-- Distributions policies
CREATE POLICY "Sponsors can manage own distributions" ON public.sponsor_distributions 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sponsor_deals sd 
      JOIN public.sponsor_profiles sp ON sd.sponsor_id = sp.id 
      WHERE sd.id = deal_id AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all distributions" ON public.sponsor_distributions 
  FOR ALL USING (is_admin());

-- Platform fees policies
CREATE POLICY "Sponsors can view own fees" ON public.sponsor_platform_fees 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sponsor_profiles WHERE id = sponsor_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all fees" ON public.sponsor_platform_fees 
  FOR ALL USING (is_admin());

-- Messages policies
CREATE POLICY "Sponsors can manage own messages" ON public.sponsor_messages 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.sponsor_profiles WHERE id = sponsor_id AND user_id = auth.uid())
  );

CREATE POLICY "Recipients can view their messages" ON public.sponsor_messages 
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Admins can manage all messages" ON public.sponsor_messages 
  FOR ALL USING (is_admin());

-- Deal updates policies
CREATE POLICY "Sponsors can manage own deal updates" ON public.sponsor_deal_updates 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sponsor_deals sd 
      JOIN public.sponsor_profiles sp ON sd.sponsor_id = sp.id 
      WHERE sd.id = deal_id AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view updates for active deals" ON public.sponsor_deal_updates 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sponsor_deals WHERE id = deal_id AND status IN ('active', 'funded'))
  );

CREATE POLICY "Admins can manage all updates" ON public.sponsor_deal_updates 
  FOR ALL USING (is_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sponsor_distributions_deal_id ON public.sponsor_distributions(deal_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_platform_fees_sponsor_id ON public.sponsor_platform_fees(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_messages_sponsor_id ON public.sponsor_messages(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_messages_recipient_id ON public.sponsor_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_deal_updates_deal_id ON public.sponsor_deal_updates(deal_id);