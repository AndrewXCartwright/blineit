-- Add policy for authenticated users to view verified sponsor profiles
CREATE POLICY "Authenticated users can view verified sponsor profiles"
ON public.sponsor_profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND verification_status = 'verified'
);