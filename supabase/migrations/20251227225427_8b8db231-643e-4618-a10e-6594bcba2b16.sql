
-- Create document_templates table
CREATE TABLE public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'legal',
  document_type TEXT NOT NULL,
  template_url TEXT,
  provider_template_id TEXT,
  required_for TEXT[] DEFAULT '{}',
  signing_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document_envelopes table
CREATE TABLE public.document_envelopes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_id UUID REFERENCES public.document_templates(id),
  property_id UUID REFERENCES public.properties(id),
  loan_id UUID REFERENCES public.loans(id),
  investment_amount NUMERIC,
  provider TEXT DEFAULT 'internal',
  provider_envelope_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  decline_reason TEXT,
  signed_document_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document_fields table
CREATE TABLE public.document_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  envelope_id UUID NOT NULL REFERENCES public.document_envelopes(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_value TEXT,
  field_type TEXT NOT NULL DEFAULT 'text',
  is_required BOOLEAN DEFAULT true,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_signatures table for saved signatures
CREATE TABLE public.user_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  signature_data TEXT NOT NULL,
  signature_type TEXT NOT NULL DEFAULT 'typed',
  font_style TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_document_templates_active ON public.document_templates(is_active);
CREATE INDEX idx_document_templates_category ON public.document_templates(category);
CREATE INDEX idx_document_envelopes_user ON public.document_envelopes(user_id);
CREATE INDEX idx_document_envelopes_status ON public.document_envelopes(status);
CREATE INDEX idx_document_envelopes_property ON public.document_envelopes(property_id);
CREATE INDEX idx_document_envelopes_loan ON public.document_envelopes(loan_id);
CREATE INDEX idx_document_fields_envelope ON public.document_fields(envelope_id);
CREATE INDEX idx_user_signatures_user ON public.user_signatures(user_id);

-- Enable RLS
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_signatures ENABLE ROW LEVEL SECURITY;

-- Document templates policies (viewable by all authenticated, editable by admins)
CREATE POLICY "Document templates are viewable by everyone"
  ON public.document_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage document templates"
  ON public.document_templates FOR ALL
  USING (is_admin());

-- Document envelopes policies
CREATE POLICY "Users can view their own envelopes"
  ON public.document_envelopes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all envelopes"
  ON public.document_envelopes FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can insert their own envelopes"
  ON public.document_envelopes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own envelopes"
  ON public.document_envelopes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all envelopes"
  ON public.document_envelopes FOR UPDATE
  USING (is_admin());

-- Document fields policies
CREATE POLICY "Users can view fields of their envelopes"
  ON public.document_fields FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.document_envelopes
    WHERE id = envelope_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all fields"
  ON public.document_fields FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can insert fields for their envelopes"
  ON public.document_fields FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.document_envelopes
    WHERE id = envelope_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update fields of their envelopes"
  ON public.document_fields FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.document_envelopes
    WHERE id = envelope_id AND user_id = auth.uid()
  ));

-- User signatures policies
CREATE POLICY "Users can view their own signatures"
  ON public.user_signatures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own signatures"
  ON public.user_signatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signatures"
  ON public.user_signatures FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own signatures"
  ON public.user_signatures FOR DELETE
  USING (auth.uid() = user_id);

-- Add documents_signed and last_document_signed_at to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS documents_signed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_document_signed_at TIMESTAMP WITH TIME ZONE;

-- Insert default document templates
INSERT INTO public.document_templates (name, description, category, document_type, required_for, signing_order, version) VALUES
('Private Placement Memorandum', 'Important disclosures about this investment. Please read carefully before signing.', 'legal', 'ppm', ARRAY['equity'], 1, '1.0'),
('Subscription Agreement', 'Your agreement to invest in the property offering.', 'investment', 'equity_subscription', ARRAY['equity'], 2, '1.0'),
('Operating Agreement', 'Terms of the LLC that holds the property.', 'legal', 'operating_agreement', ARRAY['equity'], 3, '1.0'),
('Loan Participation Agreement', 'Your agreement to participate in the loan offering.', 'investment', 'debt_subscription', ARRAY['debt'], 1, '1.0'),
('Risk Disclosure', 'Important risk disclosures for debt investments.', 'legal', 'risk_disclosure', ARRAY['debt'], 2, '1.0'),
('W-9 Tax Form', 'Required for US tax reporting purposes.', 'tax', 'w9', ARRAY['all'], 1, '1.0'),
('Accreditation Verification', 'Verification of your accredited investor status.', 'kyc', 'accreditation', ARRAY['equity'], 0, '1.0');

-- Create function to sign document
CREATE OR REPLACE FUNCTION public.sign_document(
  p_envelope_id UUID,
  p_signature_data TEXT,
  p_fields JSONB DEFAULT '[]'::jsonb
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_envelope RECORD;
  v_field RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  -- Get envelope
  SELECT * INTO v_envelope
  FROM document_envelopes
  WHERE id = p_envelope_id AND user_id = v_user_id
  FOR UPDATE;
  
  IF v_envelope IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'envelope_not_found');
  END IF;
  
  IF v_envelope.status = 'signed' OR v_envelope.status = 'completed' THEN
    RETURN json_build_object('success', false, 'error', 'already_signed');
  END IF;
  
  IF v_envelope.expires_at < now() THEN
    RETURN json_build_object('success', false, 'error', 'envelope_expired');
  END IF;
  
  -- Update signature field
  UPDATE document_fields
  SET field_value = p_signature_data, signed_at = now()
  WHERE envelope_id = p_envelope_id AND field_type = 'signature';
  
  -- Update other fields from the JSONB array
  FOR v_field IN SELECT * FROM jsonb_to_recordset(p_fields) AS x(field_name TEXT, field_value TEXT)
  LOOP
    UPDATE document_fields
    SET field_value = v_field.field_value, signed_at = now()
    WHERE envelope_id = p_envelope_id AND field_name = v_field.field_name;
  END LOOP;
  
  -- Update envelope status
  UPDATE document_envelopes
  SET status = 'signed', signed_at = now(), completed_at = now()
  WHERE id = p_envelope_id;
  
  -- Update user's document count
  UPDATE profiles
  SET documents_signed = COALESCE(documents_signed, 0) + 1,
      last_document_signed_at = now()
  WHERE user_id = v_user_id;
  
  RETURN json_build_object('success', true, 'signed_at', now());
END;
$$;

-- Create function to create envelope with fields
CREATE OR REPLACE FUNCTION public.create_document_envelope(
  p_template_id UUID,
  p_property_id UUID DEFAULT NULL,
  p_loan_id UUID DEFAULT NULL,
  p_investment_amount NUMERIC DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_envelope_id UUID;
  v_template RECORD;
  v_profile RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  -- Get template
  SELECT * INTO v_template FROM document_templates WHERE id = p_template_id AND is_active = true;
  IF v_template IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'template_not_found');
  END IF;
  
  -- Get user profile
  SELECT * INTO v_profile FROM profiles WHERE user_id = v_user_id;
  
  -- Create envelope
  INSERT INTO document_envelopes (user_id, template_id, property_id, loan_id, investment_amount, status, sent_at)
  VALUES (v_user_id, p_template_id, p_property_id, p_loan_id, p_investment_amount, 'sent', now())
  RETURNING id INTO v_envelope_id;
  
  -- Create default fields
  INSERT INTO document_fields (envelope_id, field_name, field_value, field_type, is_required) VALUES
  (v_envelope_id, 'investor_name', COALESCE(v_profile.name, v_profile.display_name), 'text', true),
  (v_envelope_id, 'investor_signature', NULL, 'signature', true),
  (v_envelope_id, 'signing_date', to_char(now(), 'Month DD, YYYY'), 'date', true),
  (v_envelope_id, 'investment_amount', '$' || COALESCE(p_investment_amount, 0)::text, 'text', false),
  (v_envelope_id, 'acknowledge_read', NULL, 'checkbox', true),
  (v_envelope_id, 'acknowledge_risks', NULL, 'checkbox', true),
  (v_envelope_id, 'acknowledge_accredited', NULL, 'checkbox', true);
  
  RETURN json_build_object('success', true, 'envelope_id', v_envelope_id);
END;
$$;
