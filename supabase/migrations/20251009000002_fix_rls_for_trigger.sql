-- Fix RLS policy to allow trigger inserts
-- The issue: During handle_new_user() trigger, auth.uid() may be NULL
-- Solution: Allow inserts from trigger context

BEGIN;

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users and triggers can insert profiles" ON public.profiles;

-- Create a new policy that works for both user inserts AND trigger inserts
CREATE POLICY "Users and triggers can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    -- Allow if auth.uid() matches user_id (normal user insert)
    auth.uid() = user_id
    OR
    -- Allow if auth.uid() is NULL (trigger context)
    auth.uid() IS NULL
  );

COMMENT ON POLICY "Users and triggers can insert profiles" ON public.profiles IS
  'Allows both authenticated users to create their own profile AND the handle_new_user trigger to create profiles';

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Updated RLS policy to allow trigger inserts when auth.uid() is NULL';
END $$;
