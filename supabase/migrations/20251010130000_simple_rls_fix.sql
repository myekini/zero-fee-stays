-- Simple RLS fix - remove all recursive policies and create basic ones
BEGIN;

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS public_read_active_properties ON public.properties;
DROP POLICY IF EXISTS public_read_images_for_active_properties ON public.property_images;
DROP POLICY IF EXISTS public_read_profiles_for_active_properties ON public.profiles;
DROP POLICY IF EXISTS public_read_host_profiles ON public.profiles;
DROP POLICY IF EXISTS users_read_own_profile ON public.profiles;

-- Drop the security definer function if it exists
DROP FUNCTION IF EXISTS public.is_host_profile(uuid);

-- Properties: Allow reading all active properties (no joins needed in policy)
CREATE POLICY properties_public_read
ON public.properties
FOR SELECT
USING (is_active = true);

-- Property Images: Allow reading all images (let app filter by property)
CREATE POLICY property_images_public_read
ON public.property_images
FOR SELECT
USING (true);

-- Profiles: Allow reading profiles (let app handle filtering)
-- Users can always read their own profile
CREATE POLICY profiles_users_read_own
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow reading profiles that are referenced in active bookings or properties
-- (using a simple check without recursion)
CREATE POLICY profiles_public_read
ON public.profiles
FOR SELECT
USING (
  -- Profile is public if user is authenticated OR profile has any activity
  auth.uid() IS NOT NULL OR
  id IN (SELECT DISTINCT host_id FROM public.properties WHERE is_active = true)
);

COMMIT;
