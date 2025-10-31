-- Final RLS fix - completely break the circular dependency
BEGIN;

-- Drop the problematic policy
DROP POLICY IF EXISTS profiles_public_read ON public.profiles;

-- Create a simple policy for profiles that doesn't reference properties at all
-- Option 1: Allow all authenticated users to read profiles
CREATE POLICY profiles_authenticated_read
ON public.profiles
FOR SELECT
USING (
  -- Users can read their own profile OR any profile if authenticated
  auth.uid() = id OR auth.uid() IS NOT NULL
);

-- If you need anonymous users to see host profiles, use a materialized view or
-- handle it at the application level by checking if the profile is a host

COMMIT;
