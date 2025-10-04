-- User Activity Tracking System
-- Tracks all important user actions for security and analytics

-- Create user_activity table
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL,
  activity_category VARCHAR(50) NOT NULL CHECK (
    activity_category IN ('auth', 'booking', 'property', 'profile', 'admin', 'payment', 'message')
  ),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_profile_id ON public.user_activity(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_category ON public.user_activity(activity_category);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_success ON public.user_activity(success);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_user_activity_user_created ON public.user_activity(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own activity"
ON public.user_activity FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
ON public.user_activity FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Service role can insert activity"
ON public.user_activity FOR INSERT
WITH CHECK (true); -- Service role bypasses RLS anyway

-- Create function to log activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_activity_type VARCHAR,
  p_activity_category VARCHAR,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
  p_profile_id UUID;
BEGIN
  -- Get profile ID
  SELECT id INTO p_profile_id
  FROM public.profiles
  WHERE user_id = p_user_id;

  -- Insert activity
  INSERT INTO public.user_activity (
    user_id,
    profile_id,
    activity_type,
    activity_category,
    description,
    metadata,
    ip_address,
    user_agent,
    success
  ) VALUES (
    p_user_id,
    p_profile_id,
    p_activity_type,
    p_activity_category,
    p_description,
    p_metadata,
    p_ip_address,
    p_user_agent,
    p_success
  ) RETURNING id INTO activity_id;

  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user activity summary
CREATE OR REPLACE FUNCTION public.get_user_activity_summary(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  activity_category VARCHAR,
  activity_count BIGINT,
  last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ua.activity_category,
    COUNT(*)::BIGINT as activity_count,
    MAX(ua.created_at) as last_activity
  FROM public.user_activity ua
  WHERE ua.user_id = p_user_id
    AND ua.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY ua.activity_category
  ORDER BY activity_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log certain activities
CREATE OR REPLACE FUNCTION public.trigger_log_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Log profile update
  PERFORM public.log_user_activity(
    NEW.user_id,
    'profile_updated',
    'profile',
    'User profile was updated',
    jsonb_build_object(
      'updated_fields', jsonb_object_keys(to_jsonb(NEW) - to_jsonb(OLD)),
      'profile_id', NEW.id
    ),
    NULL,
    NULL,
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS trigger_profile_update_activity ON public.profiles;
CREATE TRIGGER trigger_profile_update_activity
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION public.trigger_log_profile_update();

-- Create trigger to log booking creation
CREATE OR REPLACE FUNCTION public.trigger_log_booking_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Log booking creation
  PERFORM public.log_user_activity(
    (SELECT user_id FROM public.profiles WHERE id = NEW.guest_id),
    'booking_created',
    'booking',
    'New booking created',
    jsonb_build_object(
      'booking_id', NEW.id,
      'property_id', NEW.property_id,
      'total_amount', NEW.total_amount,
      'status', NEW.status
    ),
    NULL,
    NULL,
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking creation
DROP TRIGGER IF EXISTS trigger_booking_created_activity ON public.bookings;
CREATE TRIGGER trigger_booking_created_activity
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_log_booking_created();

-- Create trigger to log booking status changes
CREATE OR REPLACE FUNCTION public.trigger_log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log booking status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.log_user_activity(
      (SELECT user_id FROM public.profiles WHERE id = NEW.guest_id),
      'booking_status_changed',
      'booking',
      'Booking status changed from ' || OLD.status || ' to ' || NEW.status,
      jsonb_build_object(
        'booking_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status
      ),
      NULL,
      NULL,
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking status changes
DROP TRIGGER IF EXISTS trigger_booking_status_change_activity ON public.bookings;
CREATE TRIGGER trigger_booking_status_change_activity
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.trigger_log_booking_status_change();

-- Grant permissions
GRANT SELECT ON public.user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_activity_summary TO authenticated;

-- Add comments
COMMENT ON TABLE public.user_activity IS 'Tracks all user activities for security and analytics';
COMMENT ON COLUMN public.user_activity.activity_type IS 'Type of activity (e.g., login, booking_created, property_updated)';
COMMENT ON COLUMN public.user_activity.activity_category IS 'Category: auth, booking, property, profile, admin, payment, message';
COMMENT ON COLUMN public.user_activity.metadata IS 'Additional data about the activity';
COMMENT ON COLUMN public.user_activity.ip_address IS 'IP address of the user when activity occurred';
COMMENT ON COLUMN public.user_activity.user_agent IS 'Browser/device user agent';
COMMENT ON COLUMN public.user_activity.success IS 'Whether the activity was successful';

COMMENT ON FUNCTION public.log_user_activity IS 'Log a user activity event';
COMMENT ON FUNCTION public.get_user_activity_summary IS 'Get summary of user activities over specified days';

-- Insert initial test data (optional)
-- This helps verify the system is working
DO $$
BEGIN
  -- You can uncomment this to test the activity logging
  -- PERFORM public.log_user_activity(
  --   auth.uid(),
  --   'system_initialized',
  --   'admin',
  --   'Activity tracking system initialized',
  --   '{"version": "1.0"}'::jsonb
  -- );
END $$;

SELECT 'Activity tracking system created successfully!' AS status;
