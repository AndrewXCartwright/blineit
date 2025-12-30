-- Add 'sponsor' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sponsor';

-- Create sponsor_profiles table
CREATE TABLE public.sponsor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name text NOT NULL,
  company_logo_url text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  business_address text,
  ein_tax_id text,
  years_in_business integer,
  total_assets_managed numeric DEFAULT 0,
  deals_completed integer DEFAULT 0,
  average_irr numeric,
  bio text,
  website_url text,
  linkedin_url text,
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsor_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_profiles
CREATE POLICY "Users can view their own sponsor profile"
ON public.sponsor_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sponsor profile"
ON public.sponsor_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sponsor profile"
ON public.sponsor_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all sponsor profiles"
ON public.sponsor_profiles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX idx_sponsor_profiles_user_id ON public.sponsor_profiles(user_id);
CREATE INDEX idx_sponsor_profiles_verification_status ON public.sponsor_profiles(verification_status);

-- Create trigger for updated_at
CREATE TRIGGER update_sponsor_profiles_updated_at
BEFORE UPDATE ON public.sponsor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create sponsor_documents table for uploaded documents
CREATE TABLE public.sponsor_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_profile_id uuid REFERENCES public.sponsor_profiles(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('entity_proof', 'track_record', 'other')),
  document_name text NOT NULL,
  document_url text NOT NULL,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on sponsor_documents
ALTER TABLE public.sponsor_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_documents
CREATE POLICY "Sponsors can view their own documents"
ON public.sponsor_documents
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.sponsor_profiles
  WHERE sponsor_profiles.id = sponsor_documents.sponsor_profile_id
  AND sponsor_profiles.user_id = auth.uid()
));

CREATE POLICY "Sponsors can insert their own documents"
ON public.sponsor_documents
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.sponsor_profiles
  WHERE sponsor_profiles.id = sponsor_documents.sponsor_profile_id
  AND sponsor_profiles.user_id = auth.uid()
));

CREATE POLICY "Sponsors can delete their own documents"
ON public.sponsor_documents
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.sponsor_profiles
  WHERE sponsor_profiles.id = sponsor_documents.sponsor_profile_id
  AND sponsor_profiles.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all sponsor documents"
ON public.sponsor_documents
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));