-- Consolidate handle_new_user function to correctly handle new user profiles
-- This combines the logic from 20250801004200_add_role_management.sql and 20250801004400_fix_handle_new_user.sql

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
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
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    user_role,
    COALESCE((NEW.raw_user_meta_data ->> 'is_host')::boolean, user_role = 'host' OR user_role = 'admin'),
    COALESCE((NEW.raw_user_meta_data ->> 'is_verified')::boolean, false),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'bio',
    NEW.raw_user_meta_data ->> 'location',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
