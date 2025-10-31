-- ========================================================================
-- COMPREHENSIVE AUTH SYSTEM FIXES
-- ========================================================================
-- This migration fixes all identified authentication and role management issues:
-- 1. Creates activity_logs table for audit trail
-- 2. Adds profile-metadata sync trigger to keep roles consistent
-- 3. Creates cache invalidation notification system
-- 4. Ensures all existing users have profiles
-- ========================================================================

BEGIN;

-- ========================================================================
-- STEP 1: Create activity_logs table for audit trail
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Activity logs policies (only admins can view, system can insert)
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;
CREATE POLICY "System can insert activity logs"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (true);

GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;

COMMENT ON TABLE public.activity_logs IS
  'Audit log for tracking important user actions and system events, especially role changes and security events.';

-- ========================================================================
-- STEP 2: Add sync trigger to keep profiles.role and user_metadata in sync
-- ========================================================================

-- Function to sync profile when auth.users metadata changes
CREATE OR REPLACE FUNCTION public.sync_profile_from_auth_metadata()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_role VARCHAR(20);
  old_role VARCHAR(20);
  profile_exists BOOLEAN;
BEGIN
  -- Extract role from metadata
  new_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'user');

  -- Validate role
  IF new_role NOT IN ('user', 'host', 'admin') THEN
    new_role := 'user';
  END IF;

  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = NEW.id) INTO profile_exists;

  IF profile_exists THEN
    -- Get old role
    SELECT role INTO old_role FROM public.profiles WHERE user_id = NEW.id;

    -- Only update if role changed
    IF old_role IS DISTINCT FROM new_role THEN
      UPDATE public.profiles
      SET
        role = new_role,
        is_host = new_role IN ('host', 'admin'),
        updated_at = NOW()
      WHERE user_id = NEW.id;

      RAISE NOTICE 'Synced profile role for user % from % to %', NEW.id, old_role, new_role;

      -- Log the change
      INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, metadata)
      VALUES (
        NEW.id,
        'role_sync_from_metadata',
        'user',
        NEW.id,
        jsonb_build_object(
          'old_role', old_role,
          'new_role', new_role,
          'source', 'auth_metadata'
        )
      );
    END IF;
  ELSE
    -- Profile doesn't exist, create it (fallback safety)
    INSERT INTO public.profiles (
      user_id,
      first_name,
      last_name,
      role,
      is_host,
      is_verified,
      avatar_url
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'first_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
      new_role,
      new_role IN ('host', 'admin'),
      NEW.email_confirmed_at IS NOT NULL,
      COALESCE(
        NEW.raw_user_meta_data ->> 'avatar_url',
        NEW.raw_user_meta_data ->> 'picture',
        NEW.raw_user_meta_data ->> 'avatar'
      )
    );

    RAISE NOTICE 'Created missing profile for user % with role %', NEW.id, new_role;
  END IF;

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error syncing profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Create trigger for auth.users UPDATE
DROP TRIGGER IF EXISTS on_auth_user_metadata_updated ON auth.users;
CREATE TRIGGER on_auth_user_metadata_updated
  AFTER UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION public.sync_profile_from_auth_metadata();

COMMENT ON FUNCTION public.sync_profile_from_auth_metadata IS
  'Automatically syncs profile.role when auth.users.raw_user_meta_data.role changes.
   Ensures consistency between auth metadata and profile table.';

-- ========================================================================
-- STEP 3: Add reverse sync (profile -> metadata) for admin role changes
-- ========================================================================

CREATE OR REPLACE FUNCTION public.sync_metadata_from_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_metadata JSONB;
BEGIN
  -- Only sync if role actually changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Get current user metadata
    SELECT raw_user_meta_data INTO current_metadata
    FROM auth.users
    WHERE id = NEW.user_id;

    -- Update auth.users metadata
    UPDATE auth.users
    SET raw_user_meta_data =
      COALESCE(current_metadata, '{}'::jsonb) ||
      jsonb_build_object(
        'role', NEW.role,
        'is_host', NEW.is_host
      )
    WHERE id = NEW.user_id;

    RAISE NOTICE 'Synced auth metadata for user % to role %', NEW.user_id, NEW.role;

    -- Send notification for cache invalidation (if needed)
    PERFORM pg_notify(
      'profile_role_changed',
      json_build_object(
        'user_id', NEW.user_id,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'timestamp', extract(epoch from now())
      )::text
    );
  END IF;

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error syncing metadata for user %: % (SQLSTATE: %)', NEW.user_id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Create trigger for profiles UPDATE
DROP TRIGGER IF EXISTS on_profile_role_updated ON public.profiles;
CREATE TRIGGER on_profile_role_updated
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.sync_metadata_from_profile();

COMMENT ON FUNCTION public.sync_metadata_from_profile IS
  'Automatically syncs auth.users.raw_user_meta_data when profiles.role changes.
   Ensures bidirectional consistency and sends cache invalidation notification.';

-- ========================================================================
-- STEP 4: Create function to invalidate middleware cache
-- ========================================================================

CREATE OR REPLACE FUNCTION public.invalidate_profile_cache(target_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Send PostgreSQL notification for cache invalidation
  PERFORM pg_notify(
    'invalidate_profile_cache',
    json_build_object(
      'user_id', target_user_id,
      'timestamp', extract(epoch from now())
    )::text
  );

  RAISE NOTICE 'Cache invalidation notification sent for user %', target_user_id;
  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error sending cache invalidation for user %: %', target_user_id, SQLERRM;
    RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION public.invalidate_profile_cache IS
  'Sends PostgreSQL notification to invalidate middleware profile cache for a specific user.
   Called after role changes to ensure immediate effect.';

-- ========================================================================
-- STEP 5: Ensure all existing auth.users have profiles
-- ========================================================================

DO $$
DECLARE
  user_record RECORD;
  created_count INTEGER := 0;
BEGIN
  FOR user_record IN
    SELECT u.id, u.email, u.raw_user_meta_data, u.email_confirmed_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      INSERT INTO public.profiles (
        user_id,
        first_name,
        last_name,
        role,
        is_host,
        is_verified,
        avatar_url
      ) VALUES (
        user_record.id,
        COALESCE(user_record.raw_user_meta_data ->> 'first_name', split_part(user_record.email, '@', 1)),
        COALESCE(user_record.raw_user_meta_data ->> 'last_name', ''),
        COALESCE(user_record.raw_user_meta_data ->> 'role', 'user'),
        COALESCE((user_record.raw_user_meta_data ->> 'role') IN ('host', 'admin'), false),
        user_record.email_confirmed_at IS NOT NULL,
        COALESCE(
          user_record.raw_user_meta_data ->> 'avatar_url',
          user_record.raw_user_meta_data ->> 'picture',
          user_record.raw_user_meta_data ->> 'avatar'
        )
      );
      created_count := created_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for user %: %', user_record.id, SQLERRM;
    END;
  END LOOP;

  IF created_count > 0 THEN
    RAISE NOTICE 'Created % missing profiles', created_count;
  ELSE
    RAISE NOTICE 'All users already have profiles';
  END IF;
END $$;

-- ========================================================================
-- STEP 6: Add helper function to check role consistency
-- ========================================================================

CREATE OR REPLACE FUNCTION public.check_role_consistency()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  metadata_role TEXT,
  profile_role TEXT,
  is_consistent BOOLEAN
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data ->> 'role', 'user') as metadata_role,
    COALESCE(p.role, 'unknown') as profile_role,
    COALESCE(u.raw_user_meta_data ->> 'role', 'user') = COALESCE(p.role, 'user') as is_consistent
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE COALESCE(u.raw_user_meta_data ->> 'role', 'user') != COALESCE(p.role, 'user')
     OR p.id IS NULL;
END;
$$;

COMMENT ON FUNCTION public.check_role_consistency IS
  'Diagnostic function to check for role inconsistencies between auth.users and profiles.
   Returns users where metadata role does not match profile role.';

COMMIT;

-- ========================================================================
-- Success message
-- ========================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ =================================================================';
  RAISE NOTICE '✅ AUTH SYSTEM FIXES APPLIED SUCCESSFULLY!';
  RAISE NOTICE '✅ =================================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 What was fixed:';
  RAISE NOTICE '  1. ✅ Created activity_logs table with proper RLS';
  RAISE NOTICE '  2. ✅ Added bidirectional role sync (metadata ↔️ profile)';
  RAISE NOTICE '  3. ✅ Created cache invalidation notification system';
  RAISE NOTICE '  4. ✅ Ensured all existing users have profiles';
  RAISE NOTICE '  5. ✅ Added role consistency checker';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 New functions available:';
  RAISE NOTICE '  - public.invalidate_profile_cache(user_id)';
  RAISE NOTICE '  - public.check_role_consistency()';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Test role consistency:';
  RAISE NOTICE '  SELECT * FROM public.check_role_consistency();';
  RAISE NOTICE '';
END $$;
