-- ========================================================================
-- PROPERTY MANAGEMENT SYSTEM - WEEK 1 CRITICAL FIXES
-- ========================================================================
-- This migration adds:
-- 1. Image upload/storage tracking system
-- 2. Property availability calendar with custom pricing
-- 3. Reviews system with rating aggregation
-- ========================================================================

BEGIN;

-- ========================================================================
-- PART 1: IMAGE UPLOAD & STORAGE
-- ========================================================================

-- Table to track uploaded property images
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,

  -- Storage information
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'property-images',
  public_url TEXT,

  -- File metadata
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,

  -- Image properties
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  caption TEXT,

  -- Tracking
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 5242880), -- Max 5MB
  CONSTRAINT valid_mime_type CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_images_property ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_primary ON public.property_images(property_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_property_images_order ON public.property_images(property_id, display_order);

-- Enable RLS
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  CREATE POLICY "Anyone can view property images"
    ON public.property_images
    FOR SELECT
    USING (TRUE);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Property owners can insert images"
    ON public.property_images
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.properties
        WHERE id = property_id
        AND host_id IN (
          SELECT user_id FROM public.profiles
          WHERE user_id = auth.uid()
        )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Property owners can update their images"
    ON public.property_images
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.properties
        WHERE id = property_id
        AND host_id IN (
          SELECT user_id FROM public.profiles
          WHERE user_id = auth.uid()
        )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Property owners can delete their images"
    ON public.property_images
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.properties
        WHERE id = property_id
        AND host_id IN (
          SELECT user_id FROM public.profiles
          WHERE user_id = auth.uid()
        )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Function to ensure only one primary image per property
CREATE OR REPLACE FUNCTION public.ensure_single_primary_image()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    -- Unset other primary images for this property
    UPDATE public.property_images
    SET is_primary = FALSE
    WHERE property_id = NEW.property_id
    AND id != NEW.id
    AND is_primary = TRUE;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER ensure_single_primary_image_trigger
  BEFORE INSERT OR UPDATE ON public.property_images
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_primary_image();

-- Update properties table to track image count
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS image_count INTEGER DEFAULT 0;

-- Function to update image count
CREATE OR REPLACE FUNCTION public.update_property_image_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.properties
    SET image_count = (
      SELECT COUNT(*) FROM public.property_images
      WHERE property_id = OLD.property_id
    )
    WHERE id = OLD.property_id;
    RETURN OLD;
  ELSE
    UPDATE public.properties
    SET image_count = (
      SELECT COUNT(*) FROM public.property_images
      WHERE property_id = NEW.property_id
    )
    WHERE id = NEW.property_id;
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER update_property_image_count_trigger
  AFTER INSERT OR DELETE ON public.property_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_property_image_count();

-- ========================================================================
-- PART 2: AVAILABILITY CALENDAR
-- ========================================================================

-- Table to manage property availability and custom pricing
CREATE TABLE IF NOT EXISTS public.property_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,

  -- Date and availability
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,

  -- Custom pricing for this date
  custom_price DECIMAL(10,2),
  min_nights INTEGER,
  max_nights INTEGER,

  -- Reason for blocking (if not available)
  blocked_reason VARCHAR(50) CHECK (blocked_reason IN ('host_blocked', 'maintenance', 'personal_use', 'booked')),
  notes TEXT,

  -- Tracking
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique date per property
  UNIQUE(property_id, date),

  -- Constraints
  CONSTRAINT valid_custom_price CHECK (custom_price IS NULL OR custom_price > 0),
  CONSTRAINT valid_min_nights CHECK (min_nights IS NULL OR min_nights > 0),
  CONSTRAINT valid_max_nights CHECK (max_nights IS NULL OR max_nights >= min_nights)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_availability_property_date ON public.property_availability(property_id, date);
CREATE INDEX IF NOT EXISTS idx_property_availability_date ON public.property_availability(date);
CREATE INDEX IF NOT EXISTS idx_property_availability_available ON public.property_availability(property_id, is_available) WHERE is_available = TRUE;

-- Enable RLS
ALTER TABLE public.property_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view availability"
  ON public.property_availability
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Property owners can manage availability"
  ON public.property_availability
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id
      AND host_id IN (
        SELECT user_id FROM public.profiles
        WHERE user_id = auth.uid()
      )
    )
  );

-- Function to check property availability for date range
CREATE OR REPLACE FUNCTION public.check_property_availability(
  property_uuid UUID,
  check_in_date DATE,
  check_out_date DATE
)
RETURNS TABLE (
  is_available BOOLEAN,
  unavailable_dates DATE[],
  booked_dates DATE[],
  blocked_dates DATE[]
)
LANGUAGE plpgsql
AS $$
DECLARE
  date_cursor DATE;
  unavailable_array DATE[] := ARRAY[]::DATE[];
  booked_array DATE[] := ARRAY[]::DATE[];
  blocked_array DATE[] := ARRAY[]::DATE[];
  all_available BOOLEAN := TRUE;
BEGIN
  -- Loop through each date in range
  FOR date_cursor IN
    SELECT d::DATE FROM generate_series(check_in_date, check_out_date - INTERVAL '1 day', INTERVAL '1 day') AS d
  LOOP
    -- Check if date is booked
    IF EXISTS (
      SELECT 1 FROM public.bookings
      WHERE property_id = property_uuid
      AND status IN ('confirmed', 'pending')
      AND date_cursor >= check_in_date
      AND date_cursor < check_out_date
    ) THEN
      booked_array := array_append(booked_array, date_cursor);
      unavailable_array := array_append(unavailable_array, date_cursor);
      all_available := FALSE;
    END IF;

    -- Check if date is blocked in availability table
    IF EXISTS (
      SELECT 1 FROM public.property_availability
      WHERE property_id = property_uuid
      AND date = date_cursor
      AND is_available = FALSE
    ) THEN
      blocked_array := array_append(blocked_array, date_cursor);
      unavailable_array := array_append(unavailable_array, date_cursor);
      all_available := FALSE;
    END IF;
  END LOOP;

  RETURN QUERY SELECT all_available, unavailable_array, booked_array, blocked_array;
END;
$$;

COMMENT ON FUNCTION public.check_property_availability IS
  'Checks if a property is available for a date range. Returns availability status and arrays of unavailable dates categorized by reason.';

-- Function to get pricing for date range (considering custom pricing)
CREATE OR REPLACE FUNCTION public.get_property_pricing(
  property_uuid UUID,
  check_in_date DATE,
  check_out_date DATE
)
RETURNS TABLE (
  date DATE,
  price DECIMAL(10,2),
  is_custom_price BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  base_price DECIMAL(10,2);
BEGIN
  -- Get base price
  SELECT price_per_night INTO base_price
  FROM public.properties
  WHERE id = property_uuid;

  -- Return pricing for each date
  RETURN QUERY
  SELECT
    d::DATE AS date,
    COALESCE(pa.custom_price, base_price) AS price,
    (pa.custom_price IS NOT NULL) AS is_custom_price
  FROM generate_series(check_in_date, check_out_date - INTERVAL '1 day', INTERVAL '1 day') AS d
  LEFT JOIN public.property_availability pa
    ON pa.property_id = property_uuid
    AND pa.date = d::DATE;
END;
$$;

COMMENT ON FUNCTION public.get_property_pricing IS
  'Returns pricing for each night in a date range, using custom pricing if available, otherwise base price.';

-- ========================================================================
-- PART 3: REVIEWS SYSTEM
-- ========================================================================

-- Table to store property reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  guest_id UUID NOT NULL REFERENCES public.profiles(id),

  -- Ratings (1-5 scale, allowing half stars with DECIMAL(2,1))
  overall_rating DECIMAL(2,1) NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  cleanliness_rating DECIMAL(2,1) CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  accuracy_rating DECIMAL(2,1) CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  communication_rating DECIMAL(2,1) CHECK (communication_rating >= 1 AND communication_rating <= 5),
  location_rating DECIMAL(2,1) CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating DECIMAL(2,1) CHECK (value_rating >= 1 AND value_rating <= 5),

  -- Review content
  review_text TEXT,

  -- Host response
  host_response TEXT,
  host_response_date TIMESTAMPTZ,

  -- Moderation
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden', 'flagged')),
  flagged_reason TEXT,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT one_review_per_booking UNIQUE(booking_id),
  CONSTRAINT review_text_length CHECK (LENGTH(review_text) >= 10 AND LENGTH(review_text) <= 2000),
  CONSTRAINT host_response_length CHECK (host_response IS NULL OR LENGTH(host_response) <= 1000)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_property ON public.reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_guest ON public.reviews(guest_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(property_id, overall_rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status) WHERE status = 'published';

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published reviews"
  ON public.reviews
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Guests can create reviews for their completed bookings"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    guest_id IN (
      SELECT user_id FROM public.profiles
      WHERE user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id
      AND guest_id = auth.uid()
      AND status = 'completed'
      AND check_out_date < NOW()
    )
  );

CREATE POLICY "Guests can update their own reviews"
  ON public.reviews
  FOR UPDATE
  USING (
    guest_id IN (
      SELECT user_id FROM public.profiles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can respond to reviews"
  ON public.reviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id
      AND host_id IN (
        SELECT user_id FROM public.profiles
        WHERE user_id = auth.uid()
      )
    )
  );

-- Add rating fields to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cleanliness_rating DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS accuracy_rating DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS communication_rating DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS location_rating DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS value_rating DECIMAL(2,1);

-- Function to update property ratings
CREATE OR REPLACE FUNCTION public.update_property_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.properties
  SET
    rating = (
      SELECT ROUND(AVG(overall_rating), 1)
      FROM public.reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'published'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'published'
    ),
    cleanliness_rating = (
      SELECT ROUND(AVG(cleanliness_rating), 1)
      FROM public.reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'published'
      AND cleanliness_rating IS NOT NULL
    ),
    accuracy_rating = (
      SELECT ROUND(AVG(accuracy_rating), 1)
      FROM public.reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'published'
      AND accuracy_rating IS NOT NULL
    ),
    communication_rating = (
      SELECT ROUND(AVG(communication_rating), 1)
      FROM public.reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'published'
      AND communication_rating IS NOT NULL
    ),
    location_rating = (
      SELECT ROUND(AVG(location_rating), 1)
      FROM public.reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'published'
      AND location_rating IS NOT NULL
    ),
    value_rating = (
      SELECT ROUND(AVG(value_rating), 1)
      FROM public.reviews
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

-- Trigger to update property ratings
CREATE TRIGGER update_property_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_property_ratings();

COMMENT ON FUNCTION public.update_property_ratings IS
  'Automatically updates property rating aggregations when reviews are added, updated, or deleted.';

-- Function to get review summary for a property
CREATE OR REPLACE FUNCTION public.get_review_summary(property_uuid UUID)
RETURNS TABLE (
  average_rating DECIMAL(2,1),
  total_reviews INTEGER,
  rating_5_stars INTEGER,
  rating_4_stars INTEGER,
  rating_3_stars INTEGER,
  rating_2_stars INTEGER,
  rating_1_star INTEGER,
  avg_cleanliness DECIMAL(2,1),
  avg_accuracy DECIMAL(2,1),
  avg_communication DECIMAL(2,1),
  avg_location DECIMAL(2,1),
  avg_value DECIMAL(2,1)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(overall_rating), 1) AS average_rating,
    COUNT(*)::INTEGER AS total_reviews,
    COUNT(*) FILTER (WHERE overall_rating >= 4.5)::INTEGER AS rating_5_stars,
    COUNT(*) FILTER (WHERE overall_rating >= 3.5 AND overall_rating < 4.5)::INTEGER AS rating_4_stars,
    COUNT(*) FILTER (WHERE overall_rating >= 2.5 AND overall_rating < 3.5)::INTEGER AS rating_3_stars,
    COUNT(*) FILTER (WHERE overall_rating >= 1.5 AND overall_rating < 2.5)::INTEGER AS rating_2_stars,
    COUNT(*) FILTER (WHERE overall_rating < 1.5)::INTEGER AS rating_1_star,
    ROUND(AVG(cleanliness_rating), 1) AS avg_cleanliness,
    ROUND(AVG(accuracy_rating), 1) AS avg_accuracy,
    ROUND(AVG(communication_rating), 1) AS avg_communication,
    ROUND(AVG(location_rating), 1) AS avg_location,
    ROUND(AVG(value_rating), 1) AS avg_value
  FROM public.reviews
  WHERE property_id = property_uuid
  AND status = 'published';
END;
$$;

COMMENT ON FUNCTION public.get_review_summary IS
  'Returns comprehensive review statistics for a property including rating distribution and category averages.';

-- ========================================================================
-- GRANTS
-- ========================================================================

-- Property Images
GRANT SELECT ON public.property_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.property_images TO authenticated;

-- Property Availability
GRANT SELECT ON public.property_availability TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.property_availability TO authenticated;

-- Reviews
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE ON public.reviews TO authenticated;

COMMIT;

-- ========================================================================
-- SUCCESS MESSAGE
-- ========================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Property Management Week 1 migration completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📦 Created tables:';
  RAISE NOTICE '  - property_images (image upload tracking)';
  RAISE NOTICE '  - property_availability (calendar management)';
  RAISE NOTICE '  - reviews (guest reviews system)';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Created functions:';
  RAISE NOTICE '  - ensure_single_primary_image()';
  RAISE NOTICE '  - update_property_image_count()';
  RAISE NOTICE '  - check_property_availability()';
  RAISE NOTICE '  - get_property_pricing()';
  RAISE NOTICE '  - update_property_ratings()';
  RAISE NOTICE '  - get_review_summary()';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 RLS policies configured for all tables';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next: Create API endpoints for these features';
END $$;
