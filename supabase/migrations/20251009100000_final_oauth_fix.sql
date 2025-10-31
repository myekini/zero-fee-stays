-- ========================================================================
-- FINAL FIX FOR OAUTH "Database error granting user" ISSUE
-- ========================================================================
-- This migration fixes three critical issues:
-- 1. Adds SECURITY DEFINER to handle_new_user function
-- 2. Updates RLS policy to allow trigger inserts
-- 3. Adds proper error handling and grants
-- ========================================================================

BEGIN;

-- Step 1: Drop and recreate the handle_new_user function with SECURITY DEFINER
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER -- This is CRITICAL for OAuth to work
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role VARCHAR(20);
BEGIN
  -- Get role from user metadata, default to 'user'
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'user');

  -- Ensure role is valid
  IF user_role NOT IN ('user', 'host', 'admin') THEN
    user_role := 'user';
  END IF;

  -- Insert new profile with all available data
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    role,
    is_host,
    is_verified,
    phone,
    bio,
    location,
    avatar_url
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    user_role,
    COALESCE((NEW.raw_user_meta_data ->> 'is_host')::boolean, user_role IN ('host', 'admin')),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'bio',
    NEW.raw_user_meta_data ->> 'location',
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture')
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Error creating profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    -- Re-raise to prevent user creation without profile
    RAISE;
END;
$$;

-- Step 2: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Update RLS policies to allow both user and trigger inserts
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users and triggers can insert profiles" ON public.profiles;

CREATE POLICY "Users and triggers can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    -- Allow if auth.uid() matches user_id (normal user insert)
    auth.uid() = user_id
    OR
    -- Allow if auth.uid() is NULL (trigger context during OAuth/signup)
    auth.uid() IS NULL
  );

-- Step 4: Ensure proper grants
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Step 5: Add helpful comments
COMMENT ON FUNCTION public.handle_new_user IS
  'Automatically creates a profile when a new user signs up via email or OAuth. Runs with SECURITY DEFINER to bypass RLS.';

COMMENT ON POLICY "Users and triggers can insert profiles" ON public.profiles IS
  'Allows both authenticated users to create their own profile AND the handle_new_user trigger to create profiles (when auth.uid() is NULL)';

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ OAuth fix applied successfully!';
  RAISE NOTICE '✅ handle_new_user function recreated with SECURITY DEFINER';
  RAISE NOTICE '✅ RLS policy updated to allow trigger inserts';
  RAISE NOTICE '✅ Grants configured correctly';
END $$;
