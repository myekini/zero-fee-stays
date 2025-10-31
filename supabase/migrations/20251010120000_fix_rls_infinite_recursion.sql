-- Fix infinite recursion in RLS policies
-- The profiles policy was checking properties which checks profiles = infinite loop

BEGIN;

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS public_read_profiles_for_active_properties ON public.profiles;

-- Create a simpler policy: allow reading profiles that are referenced by properties
-- This uses a security definer function to break the recursion
CREATE OR REPLACE FUNCTION public.is_host_profile(profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.properties
    WHERE host_id = profile_id
    LIMIT 1
  );
$$;

-- Recreate the policy using the security definer function
CREATE POLICY public_read_host_profiles
ON public.profiles
FOR SELECT
USING (
  -- Allow if this profile is a host (has properties)
  public.is_host_profile(id)
);

-- Also need a policy to allow users to read their own profile
DROP POLICY IF EXISTS users_read_own_profile ON public.profiles;
CREATE POLICY users_read_own_profile
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

COMMIT;
