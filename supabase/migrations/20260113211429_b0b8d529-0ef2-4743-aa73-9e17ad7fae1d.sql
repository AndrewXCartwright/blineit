-- Create sponsor_properties table for the property wizard
CREATE TABLE public.sponsor_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES public.sponsor_profiles(id) ON DELETE CASCADE,
  
  -- Step 1: Basic Information
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  "shortDescription" TEXT DEFAULT '',
  "propertyType" TEXT DEFAULT '',
  "investmentType" TEXT DEFAULT '',
  status TEXT DEFAULT 'Draft',
  
  -- Step 2: Location
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  zip TEXT DEFAULT '',
  country TEXT DEFAULT 'USA',
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Step 3: Financial Terms
  "targetRaise" NUMERIC DEFAULT 0,
  "minimumInvestment" NUMERIC DEFAULT 0,
  "maximumInvestment" NUMERIC,
  "pricePerShare" NUMERIC DEFAULT 0,
  "totalShares" INTEGER DEFAULT 0,
  "projectedReturn" NUMERIC,
  "holdPeriod" INTEGER,
  "distributionFrequency" TEXT DEFAULT 'Quarterly',
  
  -- Step 4: Token Configuration (stored as JSON array)
  "shareTypes" JSONB DEFAULT '[]'::jsonb,
  
  -- Step 5: Property Details
  "propertyValue" NUMERIC,
  "squareFootage" INTEGER,
  units INTEGER,
  "yearBuilt" INTEGER,
  "occupancyRate" NUMERIC,
  "capRate" NUMERIC,
  noi NUMERIC,
  ltv NUMERIC,
  dscr NUMERIC,
  
  -- Step 6: Media
  "featuredImage" TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  video TEXT DEFAULT '',
  "virtualTour" TEXT DEFAULT '',
  
  -- Step 7: Documents
  documents JSONB DEFAULT '[]'::jsonb,
  
  -- Tracking
  "currentStep" INTEGER DEFAULT 1,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsor_properties ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Sponsors can view their own properties"
ON public.sponsor_properties FOR SELECT
USING (sponsor_id IN (
  SELECT id FROM public.sponsor_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Sponsors can insert their own properties"
ON public.sponsor_properties FOR INSERT
WITH CHECK (sponsor_id IN (
  SELECT id FROM public.sponsor_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Sponsors can update their own properties"
ON public.sponsor_properties FOR UPDATE
USING (sponsor_id IN (
  SELECT id FROM public.sponsor_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Sponsors can delete their own properties"
ON public.sponsor_properties FOR DELETE
USING (sponsor_id IN (
  SELECT id FROM public.sponsor_profiles WHERE user_id = auth.uid()
));

-- Create storage bucket for sponsor properties
INSERT INTO storage.buckets (id, name, public) VALUES ('sponsor-properties', 'sponsor-properties', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Sponsors can upload property files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sponsor-properties' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view property files"
ON storage.objects FOR SELECT
USING (bucket_id = 'sponsor-properties');

CREATE POLICY "Sponsors can update property files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'sponsor-properties' AND auth.uid() IS NOT NULL);

CREATE POLICY "Sponsors can delete property files"
ON storage.objects FOR DELETE
USING (bucket_id = 'sponsor-properties' AND auth.uid() IS NOT NULL);