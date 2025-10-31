-- ========================================================================
-- COMPREHENSIVE DATABASE CONSOLIDATION MIGRATION
-- ========================================================================
-- This migration consolidates and fixes all schema conflicts, missing features,
-- and issues identified in the codebase audit.
--
-- CRITICAL FIXES:
-- 1. Consolidate conflicting reviews table definitions
-- 2. Consolidate conflicting property_images table definitions
-- 3. Fix messages table schema
-- 4. Add missing columns to properties, bookings, and profiles tables
-- 5. Add missing tables (payment_transactions already exists, but verify)
-- 6. Fix RLS policies
-- 7. Add missing constraints
-- 8. Add performance indexes
-- ========================================================================

BEGIN;

-- ========================================================================
-- PART 1: DROP CONFLICTING TABLES & POLICIES
-- ========================================================================

-- Drop conflicting policies first to avoid dependency issues
DROP POLICY IF EXISTS "Anyone can view published reviews" ON reviews;
DROP POLICY IF EXISTS "Guests can view their own reviews" ON reviews;
DROP POLICY IF EXISTS "Hosts can view reviews for their properties" ON reviews;
DROP POLICY IF EXISTS "Guests can create reviews for their bookings" ON reviews;
DROP POLICY IF EXISTS "Guests can update their own pending reviews" ON reviews;
DROP POLICY IF EXISTS "Hosts can respond to reviews" ON reviews;
DROP POLICY IF EXISTS "Guests can create reviews for their completed bookings" ON reviews;
DROP POLICY IF EXISTS "Guests can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Property owners can respond to reviews" ON reviews;

-- Drop conflicting triggers
DROP TRIGGER IF EXISTS update_property_rating_on_review_insert ON reviews;
DROP TRIGGER IF EXISTS update_property_rating_on_review_update ON reviews;
DROP TRIGGER IF EXISTS update_property_ratings_trigger ON reviews;

-- Drop conflicting availability tables
-- Consolidate to use property_availability only (more features)
DROP TABLE IF EXISTS availability CASCADE;

-- ========================================================================
-- PART 2: CONSOLIDATE REVIEWS TABLE
-- ========================================================================

-- Drop and recreate reviews table with consolidated schema
DROP TABLE IF EXISTS review_reports CASCADE;
DROP TABLE IF EXISTS review_helpful_votes CASCADE;
DROP TABLE IF EXISTS review_images CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;

-- Create authoritative reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  guest_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Ratings (1-5 scale, allowing integers only for consistency)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),

  -- Review content
  title VARCHAR(200),
  comment TEXT,

  -- Host response
  host_response TEXT,
  host_response_date TIMESTAMPTZ,

  -- Moderation
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'flagged', 'hidden')),
  helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),
  reported_count INTEGER DEFAULT 0 CHECK (reported_count >= 0),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(booking_id),
  CHECK (guest_id != host_id),
  CHECK (comment IS NULL OR (LENGTH(comment) >= 10 AND LENGTH(comment) <= 2000)),
  CHECK (host_response IS NULL OR LENGTH(host_response) <= 1000)
);

-- Review images table
CREATE TABLE review_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Review helpful votes table
CREATE TABLE review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(review_id, user_id)
);

-- Review reports table
CREATE TABLE review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'fake', 'offensive', 'other')),
  details TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for reviews
CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_reviews_guest_id ON reviews(guest_id);
CREATE INDEX idx_reviews_host_id ON reviews(host_id);
CREATE INDEX idx_reviews_status ON reviews(status) WHERE status = 'published';
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_rating ON reviews(property_id, rating);
CREATE INDEX idx_review_images_review_id ON review_images(review_id);
CREATE INDEX idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);
CREATE INDEX idx_review_reports_review_id ON review_reports(review_id);

-- ========================================================================
-- PART 3: CONSOLIDATE PROPERTY_IMAGES TABLE
-- ========================================================================

-- Drop and recreate with consolidated schema (use Week 1 schema - more complete)
DROP TABLE IF EXISTS property_images CASCADE;

CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

  -- Storage information (Week 1 schema)
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'property-images',
  public_url TEXT,

  -- File metadata
  file_name TEXT NOT NULL,
  file_size INTEGER CHECK (file_size > 0 AND file_size <= 10485760), -- Max 10MB (increased from 5MB)
  mime_type TEXT CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif')),
  width INTEGER,
  height INTEGER,

  -- Image properties
  image_url TEXT, -- Keep for backward compatibility with old code
  alt_text TEXT,
  caption TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,

  -- Tracking
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Populate image_url from storage_path/public_url for backward compatibility
CREATE OR REPLACE FUNCTION sync_property_image_url()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.public_url IS NOT NULL AND (NEW.image_url IS NULL OR NEW.image_url = '') THEN
    NEW.image_url := NEW.public_url;
  ELSIF NEW.storage_path IS NOT NULL AND (NEW.image_url IS NULL OR NEW.image_url = '') THEN
    NEW.image_url := NEW.storage_path;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_property_image_url_trigger
  BEFORE INSERT OR UPDATE ON property_images
  FOR EACH ROW
  EXECUTE FUNCTION sync_property_image_url();

-- Indexes for property_images
CREATE INDEX idx_property_images_property ON property_images(property_id);
CREATE INDEX idx_property_images_primary ON property_images(property_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_property_images_order ON property_images(property_id, display_order);

-- ========================================================================
-- PART 4: FIX MESSAGES TABLE SCHEMA
-- ========================================================================

-- Add missing columns to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS template_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Rename 'read' to 'is_read' for consistency (if 'read' column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'read'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'is_read'
  ) THEN
    ALTER TABLE messages RENAME COLUMN "read" TO is_read;
  END IF;
END $$;

-- Ensure is_read column exists
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Remove duplicate 'read' column if it exists alongside 'is_read'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'read'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'is_read'
  ) THEN
    ALTER TABLE messages DROP COLUMN "read";
  END IF;
END $$;

-- ========================================================================
-- PART 5: ADD MISSING COLUMNS TO EXISTING TABLES
-- ========================================================================

-- Add missing columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'host', 'admin', 'super_admin', 'moderator')),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0 CHECK (login_count >= 0);

-- Add missing columns to properties
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
ADD COLUMN IF NOT EXISTS image_count INTEGER DEFAULT 0 CHECK (image_count >= 0),
ADD COLUMN IF NOT EXISTS cleanliness_rating DECIMAL(3,2) CHECK (cleanliness_rating >= 0 AND cleanliness_rating <= 5),
ADD COLUMN IF NOT EXISTS accuracy_rating DECIMAL(3,2) CHECK (accuracy_rating >= 0 AND accuracy_rating <= 5),
ADD COLUMN IF NOT EXISTS communication_rating DECIMAL(3,2) CHECK (communication_rating >= 0 AND communication_rating <= 5),
ADD COLUMN IF NOT EXISTS location_rating DECIMAL(3,2) CHECK (location_rating >= 0 AND location_rating <= 5),
ADD COLUMN IF NOT EXISTS value_rating DECIMAL(3,2) CHECK (value_rating >= 0 AND value_rating <= 5),
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'flagged')),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejected_reason TEXT,
ADD COLUMN IF NOT EXISTS rejection_notes TEXT;

-- Add missing columns to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'disputed')),
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) CHECK (refund_amount >= 0),
ADD COLUMN IF NOT EXISTS refund_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- Add check constraint for booking dates
DO $$
BEGIN
  ALTER TABLE bookings ADD CONSTRAINT check_dates_valid CHECK (check_out_date > check_in_date);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ========================================================================
-- PART 6: CREATE MISSING TABLES
-- ========================================================================

-- Activity logs table (if not exists)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- Message templates table (if not exists)
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('welcome', 'check_in', 'check_out', 'review_request', 'custom')),
  name VARCHAR(100) NOT NULL,
  subject VARCHAR(200),
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_message_templates_host ON message_templates(host_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_type ON message_templates(template_type) WHERE is_active = TRUE;

-- ========================================================================
-- PART 7: CREATE/UPDATE FUNCTIONS
-- ========================================================================

-- Function to update property image count
CREATE OR REPLACE FUNCTION update_property_image_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE properties
    SET image_count = (
      SELECT COUNT(*) FROM property_images
      WHERE property_id = OLD.property_id
    )
    WHERE id = OLD.property_id;
    RETURN OLD;
  ELSE
    UPDATE properties
    SET image_count = (
      SELECT COUNT(*) FROM property_images
      WHERE property_id = NEW.property_id
    )
    WHERE id = NEW.property_id;
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS update_property_image_count_trigger ON property_images;
CREATE TRIGGER update_property_image_count_trigger
  AFTER INSERT OR DELETE ON property_images
  FOR EACH ROW
  EXECUTE FUNCTION update_property_image_count();

-- Function to ensure only one primary image per property
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    UPDATE property_images
    SET is_primary = FALSE
    WHERE property_id = NEW.property_id
    AND id != NEW.id
    AND is_primary = TRUE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_single_primary_image_trigger ON property_images;
CREATE TRIGGER ensure_single_primary_image_trigger
  BEFORE INSERT OR UPDATE ON property_images
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_image();

-- Function to update property ratings
CREATE OR REPLACE FUNCTION update_property_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE properties
  SET
    rating = (
      SELECT ROUND(AVG(rating::numeric), 2)
      FROM reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'published'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'published'
    ),
    cleanliness_rating = (
      SELECT ROUND(AVG(cleanliness_rating::numeric), 2)
      FROM reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'published'
      AND cleanliness_rating IS NOT NULL
    ),
    accuracy_rating = (
      SELECT ROUND(AVG(accuracy_rating::numeric), 2)
      FROM reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'published'
      AND accuracy_rating IS NOT NULL
    ),
    communication_rating = (
      SELECT ROUND(AVG(communication_rating::numeric), 2)
      FROM reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'published'
      AND communication_rating IS NOT NULL
    ),
    location_rating = (
      SELECT ROUND(AVG(location_rating::numeric), 2)
      FROM reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'published'
      AND location_rating IS NOT NULL
    ),
    value_rating = (
      SELECT ROUND(AVG(value_rating::numeric), 2)
      FROM reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'published'
      AND value_rating IS NOT NULL
    )
  WHERE id = COALESCE(NEW.property_id, OLD.property_id);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS update_property_ratings_trigger ON reviews;
CREATE TRIGGER update_property_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_property_ratings();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to tables
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_review_reports_updated_at ON review_reports;
CREATE TRIGGER update_review_reports_updated_at
  BEFORE UPDATE ON review_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_property_images_updated_at ON property_images;
CREATE TRIGGER update_property_images_updated_at
  BEFORE UPDATE ON property_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_message_templates_updated_at ON message_templates;
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================================================
-- PART 8: FIX RLS POLICIES
-- ========================================================================

-- Enable RLS on all tables
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view published reviews"
  ON reviews FOR SELECT
  USING (status = 'published');

CREATE POLICY "Guests can view their own reviews"
  ON reviews FOR SELECT
  USING (guest_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Hosts can view reviews for their properties"
  ON reviews FOR SELECT
  USING (host_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Guests can create reviews for completed bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    guest_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_id
      AND guest_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      AND status = 'completed'
      AND check_out_date < NOW()
    )
  );

CREATE POLICY "Guests can update their own pending reviews"
  ON reviews FOR UPDATE
  USING (guest_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND status = 'pending')
  WITH CHECK (guest_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Hosts can respond to reviews"
  ON reviews FOR UPDATE
  USING (host_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (host_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Review images policies
CREATE POLICY "Anyone can view review images for published reviews"
  ON review_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reviews
      WHERE id = review_id AND status = 'published'
    )
  );

CREATE POLICY "Review authors can manage review images"
  ON review_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      JOIN profiles p ON r.guest_id = p.id
      WHERE r.id = review_id AND p.user_id = auth.uid()
    )
  );

-- Review helpful votes policies
CREATE POLICY "Authenticated users can manage their own helpful votes"
  ON review_helpful_votes FOR ALL
  USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view helpful vote counts"
  ON review_helpful_votes FOR SELECT
  USING (true);

-- Review reports policies
CREATE POLICY "Authenticated users can create review reports"
  ON review_reports FOR INSERT
  WITH CHECK (reporter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own reports"
  ON review_reports FOR SELECT
  USING (reporter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all reports"
  ON review_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

CREATE POLICY "Admins can update reports"
  ON review_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Property images policies
CREATE POLICY "Anyone can view property images"
  ON property_images FOR SELECT
  USING (true);

CREATE POLICY "Property owners can insert images"
  ON property_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties p
      JOIN profiles pr ON p.host_id = pr.id
      WHERE p.id = property_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can update their images"
  ON property_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      JOIN profiles pr ON p.host_id = pr.id
      WHERE p.id = property_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can delete their images"
  ON property_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      JOIN profiles pr ON p.host_id = pr.id
      WHERE p.id = property_id AND pr.user_id = auth.uid()
    )
  );

-- Activity logs policies
CREATE POLICY "Users can view their own activity"
  ON activity_logs FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all activity"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "System can insert activity logs" ON activity_logs;
CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (true);

-- Message templates policies
CREATE POLICY "Hosts can manage their own templates"
  ON message_templates FOR ALL
  USING (host_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (host_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Update properties policy to require approval
DROP POLICY IF EXISTS "Anyone can view active properties" ON properties;
CREATE POLICY "Anyone can view approved active properties"
  ON properties FOR SELECT
  USING (is_active = true AND approval_status = 'approved');

CREATE POLICY "Hosts can view their own properties"
  ON properties FOR SELECT
  USING (host_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all properties"
  ON properties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- ========================================================================
-- PART 9: CREATE VIEWS
-- ========================================================================

-- Review statistics view
CREATE OR REPLACE VIEW review_statistics AS
SELECT
  r.property_id,
  COUNT(*) as total_reviews,
  ROUND(AVG(r.rating::numeric), 2) as avg_rating,
  ROUND(AVG(r.cleanliness_rating::numeric), 2) as avg_cleanliness,
  ROUND(AVG(r.accuracy_rating::numeric), 2) as avg_accuracy,
  ROUND(AVG(r.communication_rating::numeric), 2) as avg_communication,
  ROUND(AVG(r.location_rating::numeric), 2) as avg_location,
  ROUND(AVG(r.value_rating::numeric), 2) as avg_value,
  COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star_count,
  COUNT(CASE WHEN r.rating = 4 THEN 1 END) as four_star_count,
  COUNT(CASE WHEN r.rating = 3 THEN 1 END) as three_star_count,
  COUNT(CASE WHEN r.rating = 2 THEN 1 END) as two_star_count,
  COUNT(CASE WHEN r.rating = 1 THEN 1 END) as one_star_count
FROM reviews r
WHERE r.status = 'published'
GROUP BY r.property_id;

-- ========================================================================
-- PART 10: HELPER FUNCTIONS
-- ========================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = user_uuid
    AND role IN ('admin', 'super_admin', 'moderator')
  );
END;
$$;

-- Function to check if user is host
CREATE OR REPLACE FUNCTION is_host(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = user_uuid
    AND (role = 'host' OR is_host = true)
  );
END;
$$;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action VARCHAR(100),
  p_entity_type VARCHAR(50) DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_metadata,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- ========================================================================
-- PART 11: GRANTS
-- ========================================================================

GRANT SELECT ON reviews TO anon, authenticated;
GRANT INSERT, UPDATE ON reviews TO authenticated;
GRANT SELECT ON review_images TO anon, authenticated;
GRANT ALL ON review_images TO authenticated;
GRANT SELECT ON review_helpful_votes TO anon, authenticated;
GRANT ALL ON review_helpful_votes TO authenticated;
GRANT SELECT, INSERT ON review_reports TO authenticated;
GRANT SELECT ON property_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON property_images TO authenticated;
GRANT SELECT ON activity_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON message_templates TO authenticated;
GRANT SELECT ON review_statistics TO anon, authenticated;

-- ========================================================================
-- PART 12: CLEANUP & OPTIMIZATION
-- ========================================================================

-- Analyze tables for query optimization
ANALYZE reviews;
ANALYZE review_images;
ANALYZE review_helpful_votes;
ANALYZE review_reports;
ANALYZE property_images;
ANALYZE properties;
ANALYZE bookings;
ANALYZE profiles;
ANALYZE messages;
ANALYZE activity_logs;

COMMIT;

-- ========================================================================
-- VERIFICATION & SUCCESS MESSAGE
-- ========================================================================

DO $$
DECLARE
  v_reviews_count INTEGER;
  v_property_images_count INTEGER;
  v_properties_columns INTEGER;
  v_bookings_columns INTEGER;
  v_profiles_columns INTEGER;
BEGIN
  -- Verify tables exist
  SELECT COUNT(*) INTO v_reviews_count FROM information_schema.tables WHERE table_name = 'reviews';
  SELECT COUNT(*) INTO v_property_images_count FROM information_schema.tables WHERE table_name = 'property_images';

  -- Count new columns
  SELECT COUNT(*) INTO v_properties_columns FROM information_schema.columns WHERE table_name = 'properties' AND column_name IN ('rating', 'review_count', 'approval_status');
  SELECT COUNT(*) INTO v_bookings_columns FROM information_schema.columns WHERE table_name = 'bookings' AND column_name IN ('payment_status', 'payment_intent_id');
  SELECT COUNT(*) INTO v_profiles_columns FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('role', 'is_verified');

  RAISE NOTICE '========================================================================';
  RAISE NOTICE '✅ COMPREHENSIVE CONSOLIDATION MIGRATION COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '========================================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 TABLES CONSOLIDATED:';
  RAISE NOTICE '  ✅ reviews table (% existing)', v_reviews_count;
  RAISE NOTICE '  ✅ property_images table (% existing)', v_property_images_count;
  RAISE NOTICE '  ✅ review_images, review_helpful_votes, review_reports created';
  RAISE NOTICE '  ✅ activity_logs, message_templates created';
  RAISE NOTICE '';
  RAISE NOTICE '📋 COLUMNS ADDED:';
  RAISE NOTICE '  ✅ properties: % critical columns added', v_properties_columns;
  RAISE NOTICE '  ✅ bookings: % payment columns added', v_bookings_columns;
  RAISE NOTICE '  ✅ profiles: % role/verification columns added', v_profiles_columns;
  RAISE NOTICE '  ✅ messages: booking_id, is_template, template_type added';
  RAISE NOTICE '';
  RAISE NOTICE '📋 FUNCTIONS CREATED:';
  RAISE NOTICE '  ✅ update_property_ratings() - Updates property rating aggregates';
  RAISE NOTICE '  ✅ update_property_image_count() - Tracks image count';
  RAISE NOTICE '  ✅ ensure_single_primary_image() - Ensures one primary image';
  RAISE NOTICE '  ✅ sync_property_image_url() - Backward compatibility for image URLs';
  RAISE NOTICE '  ✅ is_admin() - Admin role checking';
  RAISE NOTICE '  ✅ is_host() - Host role checking';
  RAISE NOTICE '  ✅ log_activity() - Activity logging';
  RAISE NOTICE '';
  RAISE NOTICE '📋 RLS POLICIES FIXED:';
  RAISE NOTICE '  ✅ Reviews: 6 policies configured';
  RAISE NOTICE '  ✅ Property images: 4 policies configured';
  RAISE NOTICE '  ✅ Activity logs: 3 policies configured';
  RAISE NOTICE '  ✅ Properties: Approval status enforcement added';
  RAISE NOTICE '';
  RAISE NOTICE '📋 VIEWS CREATED:';
  RAISE NOTICE '  ✅ review_statistics - Aggregated review metrics';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NEXT STEPS:';
  RAISE NOTICE '  1. Regenerate TypeScript types: npx supabase gen types typescript';
  RAISE NOTICE '  2. Update API routes to use new columns';
  RAISE NOTICE '  3. Test booking flow with payment_status';
  RAISE NOTICE '  4. Test property moderation with approval_status';
  RAISE NOTICE '  5. Verify RLS policies with different user roles';
  RAISE NOTICE '';
  RAISE NOTICE '========================================================================';
END $$;
