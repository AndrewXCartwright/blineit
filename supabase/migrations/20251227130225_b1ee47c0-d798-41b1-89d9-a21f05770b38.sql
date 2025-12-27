-- Add KYC status to profiles
ALTER TABLE public.profiles 
ADD COLUMN kyc_status TEXT DEFAULT 'not_started',
ADD COLUMN kyc_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN kyc_verified_at TIMESTAMP WITH TIME ZONE;

-- Create KYC verifications table for detailed info
CREATE TABLE public.kyc_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  -- Personal info
  full_legal_name TEXT,
  date_of_birth DATE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  phone_number TEXT,
  ssn_last4 TEXT,
  -- Document URLs
  id_front_url TEXT,
  id_back_url TEXT,
  selfie_url TEXT,
  id_type TEXT,
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own KYC
CREATE POLICY "Users can view their own KYC"
ON public.kyc_verifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own KYC
CREATE POLICY "Users can insert their own KYC"
ON public.kyc_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own KYC (only if pending)
CREATE POLICY "Users can update their own KYC"
ON public.kyc_verifications
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Create index
CREATE INDEX idx_kyc_user_id ON public.kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON public.kyc_verifications(status);

-- Create trigger for updated_at
CREATE TRIGGER update_kyc_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false);

-- Storage policies - users can upload their own KYC docs
CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view their own KYC docs
CREATE POLICY "Users can view their own KYC documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update their own KYC docs
CREATE POLICY "Users can update their own KYC documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);