-- Create sponsor_applications table for tracking sponsor applications
CREATE TABLE public.sponsor_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  property_types TEXT[] NOT NULL DEFAULT '{}',
  estimated_portfolio_value NUMERIC,
  investment_strategy TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  reviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sponsor_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own applications" 
ON public.sponsor_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" 
ON public.sponsor_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all applications
CREATE POLICY "Admins can view all applications" 
ON public.sponsor_applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Allow admins to update applications
CREATE POLICY "Admins can update applications" 
ON public.sponsor_applications 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_sponsor_applications_updated_at
BEFORE UPDATE ON public.sponsor_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();