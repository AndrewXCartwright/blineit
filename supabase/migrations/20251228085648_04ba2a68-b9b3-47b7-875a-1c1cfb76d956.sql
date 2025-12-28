-- Create tax_documents table
CREATE TABLE public.tax_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tax_year INTEGER NOT NULL,
  document_type TEXT NOT NULL, -- 1099-DIV, 1099-INT, 1099-MISC, 1099-B, tax_summary
  status TEXT NOT NULL DEFAULT 'pending', -- pending, generating, ready, error
  file_url TEXT,
  generated_at TIMESTAMP WITH TIME ZONE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_document_type CHECK (document_type IN ('1099-DIV', '1099-INT', '1099-MISC', '1099-B', 'tax_summary')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'generating', 'ready', 'error'))
);

-- Create taxable_events table
CREATE TABLE public.taxable_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tax_year INTEGER NOT NULL,
  event_type TEXT NOT NULL, -- dividend, interest, capital_gain, capital_loss, prediction_winnings
  event_date DATE NOT NULL,
  description TEXT NOT NULL,
  item_type TEXT NOT NULL, -- property, loan, prediction
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  gross_amount DECIMAL NOT NULL,
  fees DECIMAL NOT NULL DEFAULT 0,
  net_amount DECIMAL NOT NULL,
  cost_basis DECIMAL,
  gain_loss DECIMAL,
  holding_period TEXT, -- short_term, long_term
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_event_type CHECK (event_type IN ('dividend', 'interest', 'capital_gain', 'capital_loss', 'prediction_winnings')),
  CONSTRAINT valid_item_type CHECK (item_type IN ('property', 'loan', 'prediction')),
  CONSTRAINT valid_holding_period CHECK (holding_period IS NULL OR holding_period IN ('short_term', 'long_term'))
);

-- Create tax_settings table
CREATE TABLE public.tax_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  tax_id_type TEXT DEFAULT 'ssn', -- ssn, ein
  tax_id_last_four TEXT,
  tax_id_encrypted TEXT,
  filing_status TEXT DEFAULT 'single', -- single, married_joint, married_separate, head_of_household
  state TEXT,
  cost_basis_method TEXT NOT NULL DEFAULT 'fifo', -- fifo, lifo, specific_id, average
  electronic_delivery BOOLEAN NOT NULL DEFAULT true,
  mail_paper_copies BOOLEAN NOT NULL DEFAULT false,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_tax_id_type CHECK (tax_id_type IS NULL OR tax_id_type IN ('ssn', 'ein')),
  CONSTRAINT valid_filing_status CHECK (filing_status IS NULL OR filing_status IN ('single', 'married_joint', 'married_separate', 'head_of_household')),
  CONSTRAINT valid_cost_basis_method CHECK (cost_basis_method IN ('fifo', 'lifo', 'specific_id', 'average'))
);

-- Enable RLS
ALTER TABLE public.tax_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxable_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for tax_documents
CREATE POLICY "Users can view their own tax documents"
  ON public.tax_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax documents"
  ON public.tax_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax documents"
  ON public.tax_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tax documents"
  ON public.tax_documents FOR SELECT
  USING (is_admin());

-- RLS policies for taxable_events
CREATE POLICY "Users can view their own taxable events"
  ON public.taxable_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own taxable events"
  ON public.taxable_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all taxable events"
  ON public.taxable_events FOR SELECT
  USING (is_admin());

-- RLS policies for tax_settings
CREATE POLICY "Users can view their own tax settings"
  ON public.tax_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax settings"
  ON public.tax_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax settings"
  ON public.tax_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tax settings"
  ON public.tax_settings FOR SELECT
  USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_tax_documents_user_year ON public.tax_documents(user_id, tax_year);
CREATE INDEX idx_taxable_events_user_year ON public.taxable_events(user_id, tax_year);
CREATE INDEX idx_taxable_events_type ON public.taxable_events(event_type);

-- Trigger for updated_at
CREATE TRIGGER update_tax_documents_updated_at
  BEFORE UPDATE ON public.tax_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_settings_updated_at
  BEFORE UPDATE ON public.tax_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();