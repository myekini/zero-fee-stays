-- Property Approval and Moderation System
-- Adds approval workflow for property listings

-- Add approval status and moderation fields to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'needs_review')),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_reason TEXT,
ADD COLUMN IF NOT EXISTS rejection_notes TEXT;

-- Create property_moderation_log table for tracking approval history
CREATE TABLE IF NOT EXISTS public.property_moderation_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'request_changes', 'verify', 'flag', 'unflag')),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_flags table for content flagging
CREATE TABLE IF NOT EXISTS public.property_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  flagged_by UUID REFERENCES auth.users(id), -- NULL for anonymous reports
  flag_type TEXT NOT NULL CHECK (flag_type IN ('inappropriate_content', 'fake_listing', 'spam', 'wrong_location', 'price_manipulation', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_approval_status ON public.properties(approval_status);
CREATE INDEX IF NOT EXISTS idx_properties_is_verified ON public.properties(is_verified);
CREATE INDEX IF NOT EXISTS idx_property_moderation_log_property_id ON public.property_moderation_log(property_id);
CREATE INDEX IF NOT EXISTS idx_property_moderation_log_admin_id ON public.property_moderation_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_property_flags_property_id ON public.property_flags(property_id);
CREATE INDEX IF NOT EXISTS idx_property_flags_status ON public.property_flags(status);

-- Enable RLS
ALTER TABLE public.property_moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_moderation_log
CREATE POLICY "Admins can view all moderation logs"
ON public.property_moderation_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can insert moderation logs"
ON public.property_moderation_log FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for property_flags
CREATE POLICY "Anyone can view property flags"
ON public.property_flags FOR SELECT
USING (true);

CREATE POLICY "Anyone can flag properties"
ON public.property_flags FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update flag status"
ON public.property_flags FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Update existing properties to have default approval status
UPDATE public.properties 
SET approval_status = CASE 
  WHEN is_active = true THEN 'approved'
  ELSE 'pending'
END
WHERE approval_status IS NULL;

-- Create function to log property moderation actions
CREATE OR REPLACE FUNCTION public.log_property_moderation(
  p_property_id UUID,
  p_action TEXT,
  p_notes TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.property_moderation_log (
    property_id,
    admin_id,
    action,
    notes,
    metadata
  ) VALUES (
    p_property_id,
    auth.uid(),
    p_action,
    p_notes,
    p_metadata
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to approve a property
CREATE OR REPLACE FUNCTION public.approve_property(
  p_property_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  log_id UUID;
BEGIN
  -- Update property status
  UPDATE public.properties
  SET 
    approval_status = 'approved',
    is_active = true,
    approved_by = auth.uid(),
    approved_at = NOW(),
    admin_notes = p_notes
  WHERE id = p_property_id;

  -- Log the action
  SELECT public.log_property_moderation(p_property_id, 'approve', p_notes) INTO log_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reject a property
CREATE OR REPLACE FUNCTION public.reject_property(
  p_property_id UUID,
  p_reason TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  log_id UUID;
BEGIN
  -- Update property status
  UPDATE public.properties
  SET 
    approval_status = 'rejected',
    is_active = false,
    rejected_reason = p_reason,
    rejection_notes = p_notes,
    admin_notes = p_notes
  WHERE id = p_property_id;

  -- Log the action
  SELECT public.log_property_moderation(
    p_property_id, 
    'reject', 
    p_notes,
    jsonb_build_object('reason', p_reason)
  ) INTO log_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get property moderation queue
CREATE OR REPLACE FUNCTION public.get_property_moderation_queue(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  property_id UUID,
  title TEXT,
  host_name TEXT,
  host_email TEXT,
  approval_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  flag_count BIGINT,
  last_moderation_action TEXT,
  last_moderation_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as property_id,
    p.title,
    CONCAT(pr.first_name, ' ', pr.last_name) as host_name,
    pr.email as host_email,
    p.approval_status,
    p.created_at,
    COALESCE(flag_counts.count, 0) as flag_count,
    last_actions.action as last_moderation_action,
    last_actions.created_at as last_moderation_date
  FROM public.properties p
  JOIN public.profiles pr ON p.host_id = pr.id
  LEFT JOIN (
    SELECT 
      property_id,
      COUNT(*) as count
    FROM public.property_flags
    WHERE status IN ('pending', 'reviewed')
    GROUP BY property_id
  ) flag_counts ON p.id = flag_counts.property_id
  LEFT JOIN LATERAL (
    SELECT 
      action,
      created_at
    FROM public.property_moderation_log pml
    WHERE pml.property_id = p.id
    ORDER BY created_at DESC
    LIMIT 1
  ) last_actions ON true
  WHERE p.approval_status IN ('pending', 'needs_review')
  ORDER BY p.created_at ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.log_property_moderation TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_property TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_property TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_property_moderation_queue TO authenticated;

-- Add comments
COMMENT ON TABLE public.property_moderation_log IS 'Tracks all property moderation actions by admins';
COMMENT ON TABLE public.property_flags IS 'Tracks property flags and reports from users';
COMMENT ON FUNCTION public.approve_property IS 'Approves a property listing';
COMMENT ON FUNCTION public.reject_property IS 'Rejects a property listing with reason';
COMMENT ON FUNCTION public.get_property_moderation_queue IS 'Gets properties pending moderation review';

SELECT 'Property approval system created successfully!' AS status;
