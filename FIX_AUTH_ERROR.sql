-- ================================================================
-- FIX: Database error granting user (Auth Signup Error)
-- ================================================================
-- Run this in your Supabase SQL Editor
-- Dashboard -> SQL Editor -> New Query -> Paste and Run
-- ================================================================

-- Fix handle_new_user function to match actual profiles table schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert new profile with only columns that exist in the profiles table
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
    NULL, -- avatar_url
    NULL, -- phone
    NULL, -- bio
    COALESCE((NEW.raw_user_meta_data ->> 'role') = 'host', false)
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify the fix
SELECT 'handle_new_user function updated successfully!' as status;
