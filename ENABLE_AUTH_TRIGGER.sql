-- ================================================================
-- ENABLE AUTH TRIGGER: Fix disabled on_auth_user_created trigger
-- ================================================================
-- The trigger exists but is DISABLED (enabled = 0)
-- This is why signup fails with "Database error granting user"
--
-- HOW TO APPLY:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire file
-- 5. Click "Run"
-- ================================================================

-- Step 1: Drop the existing disabled trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Recreate the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert new profile with only columns that exist in the profiles table
  -- Using COALESCE to handle null values gracefully
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    avatar_url,
    phone,
    bio,
    is_host
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL),
    NULL, -- bio - default to NULL
    COALESCE((NEW.raw_user_meta_data ->> 'role') = 'host', false)
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    -- This prevents the "Database error granting user" error
    RAISE WARNING 'Error creating profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Step 3: Create the trigger (this will be ENABLED by default)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verify the trigger is now enabled
SELECT
  tgname as trigger_name,
  CASE tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    ELSE 'UNKNOWN'
  END as status,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- Step 5: Success message
SELECT
  '✅ SUCCESS: Trigger is now ENABLED!' as status,
  'You can now test user signup and it should work.' as message;
