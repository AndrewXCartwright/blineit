-- Create table for sponsor past projects
CREATE TABLE public.sponsor_past_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES public.sponsor_profiles(id) ON DELETE CASCADE NOT NULL,
  project_name TEXT NOT NULL,
  property_type TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_state TEXT NOT NULL,
  image_url TEXT,
  acquisition_date DATE,
  exit_date DATE,
  purchase_price NUMERIC,
  sale_price NUMERIC,
  investor_irr NUMERIC,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for sponsor team members
CREATE TABLE public.sponsor_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES public.sponsor_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  photo_url TEXT,
  linkedin_url TEXT,
  bio TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for sponsor media (photos gallery)
CREATE TABLE public.sponsor_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES public.sponsor_profiles(id) ON DELETE CASCADE NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for sponsor credentials/certifications
CREATE TABLE public.sponsor_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES public.sponsor_profiles(id) ON DELETE CASCADE NOT NULL,
  credential_type TEXT NOT NULL,
  credential_name TEXT NOT NULL,
  issuing_organization TEXT,
  document_url TEXT,
  issue_date DATE,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns to sponsor_profiles for enhanced bio section
ALTER TABLE public.sponsor_profiles
ADD COLUMN IF NOT EXISTS investment_thesis TEXT,
ADD COLUMN IF NOT EXISTS geographic_focus TEXT[],
ADD COLUMN IF NOT EXISTS asset_specialties TEXT[],
ADD COLUMN IF NOT EXISTS intro_video_url TEXT;

-- Enable RLS
ALTER TABLE public.sponsor_past_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_past_projects
CREATE POLICY "Sponsors can manage their own past projects"
ON public.sponsor_past_projects
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.sponsor_profiles sp
    WHERE sp.id = sponsor_past_projects.sponsor_id
    AND sp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sponsor_profiles sp
    WHERE sp.id = sponsor_past_projects.sponsor_id
    AND sp.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view approved public past projects"
ON public.sponsor_past_projects
FOR SELECT
USING (is_public = true AND review_status = 'approved');

-- RLS Policies for sponsor_team_members
CREATE POLICY "Sponsors can manage their own team members"
ON public.sponsor_team_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.sponsor_profiles sp
    WHERE sp.id = sponsor_team_members.sponsor_id
    AND sp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sponsor_profiles sp
    WHERE sp.id = sponsor_team_members.sponsor_id
    AND sp.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view team members"
ON public.sponsor_team_members
FOR SELECT
USING (true);

-- RLS Policies for sponsor_media
CREATE POLICY "Sponsors can manage their own media"
ON public.sponsor_media
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.sponsor_profiles sp
    WHERE sp.id = sponsor_media.sponsor_id
    AND sp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sponsor_profiles sp
    WHERE sp.id = sponsor_media.sponsor_id
    AND sp.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view sponsor media"
ON public.sponsor_media
FOR SELECT
USING (true);

-- RLS Policies for sponsor_credentials
CREATE POLICY "Sponsors can manage their own credentials"
ON public.sponsor_credentials
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.sponsor_profiles sp
    WHERE sp.id = sponsor_credentials.sponsor_id
    AND sp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sponsor_profiles sp
    WHERE sp.id = sponsor_credentials.sponsor_id
    AND sp.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view verified credentials"
ON public.sponsor_credentials
FOR SELECT
USING (is_verified = true);

-- Admins can manage all
CREATE POLICY "Admins can manage all past projects"
ON public.sponsor_past_projects FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all team members"
ON public.sponsor_team_members FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all media"
ON public.sponsor_media FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all credentials"
ON public.sponsor_credentials FOR ALL USING (is_admin());