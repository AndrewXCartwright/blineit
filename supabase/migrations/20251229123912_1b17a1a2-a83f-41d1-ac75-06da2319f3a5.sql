-- Allow authenticated users to view other users' basic profile info for messaging/social features
CREATE POLICY "Authenticated users can view all profiles for social features"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);