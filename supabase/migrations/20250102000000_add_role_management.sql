-- Add role management system to profiles table
-- This migration adds role column, updates RLS policies, and creates admin management functions

-- Step 1: Add role column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'host', 'admin'));

-- Step 2: Add additional columns for better user management
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Step 3: Update existing profiles to have default role
UPDATE public.profiles
SET role = CASE
  WHEN is_host = true THEN 'host'
  ELSE 'user'
END
WHERE role IS NULL;

-- Step 4: Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Step 5: Drop old restrictive policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Step 6: Create new role-based RLS policies for profiles
CREATE POLICY "Anyone can view active profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Step 7: Update properties policies to check role
DROP POLICY IF EXISTS "Hosts can manage their own properties" ON public.properties;

CREATE POLICY "Hosts can manage their own properties"
ON public.properties FOR ALL
USING (
  host_id IN (
    SELECT id FROM public.profiles
    WHERE user_id = auth.uid() AND (role = 'host' OR role = 'admin')
  )
);

CREATE POLICY "Admins can manage all properties"
ON public.properties FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Step 8: Update bookings policies for admin access
CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage all bookings"
ON public.bookings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Step 9: Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create function to check if user is host
CREATE OR REPLACE FUNCTION public.is_host(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = user_uuid AND (role = 'host' OR role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  user_role VARCHAR(20);
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE user_id = user_uuid;

  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Update handle_new_user function to set role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role VARCHAR(20);
BEGIN
  -- Get role from user metadata, default to 'user'
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'user');

  -- Ensure role is valid
  IF user_role NOT IN ('user', 'host', 'admin') THEN
    user_role := 'user';
  END IF;

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
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    user_role,
    COALESCE((NEW.raw_user_meta_data ->> 'is_host')::boolean, user_role = 'host' OR user_role = 'admin'),
    COALESCE((NEW.raw_user_meta_data ->> 'is_verified')::boolean, false),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'bio',
    NEW.raw_user_meta_data ->> 'location',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Create function to update user login tracking
CREATE OR REPLACE FUNCTION public.update_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    last_login_at = NOW(),
    login_count = login_count + 1
  WHERE user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 14: Create trigger for login tracking (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_user_login'
  ) THEN
    CREATE TRIGGER on_user_login
      AFTER UPDATE OF last_sign_in_at ON auth.users
      FOR EACH ROW
      WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
      EXECUTE FUNCTION public.update_user_login();
  END IF;
END $$;

-- Step 15: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_host TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role TO authenticated;

-- Step 16: Add comments for documentation
COMMENT ON COLUMN public.profiles.role IS 'User role: user, host, or admin';
COMMENT ON COLUMN public.profiles.is_verified IS 'Whether user email/identity is verified';
COMMENT ON COLUMN public.profiles.location IS 'User location/city';
COMMENT ON COLUMN public.profiles.last_login_at IS 'Last successful login timestamp';
COMMENT ON COLUMN public.profiles.login_count IS 'Total number of logins';

COMMENT ON FUNCTION public.is_admin IS 'Check if user has admin role';
COMMENT ON FUNCTION public.is_host IS 'Check if user is host or admin';
COMMENT ON FUNCTION public.get_user_role IS 'Get user role from profiles table';
