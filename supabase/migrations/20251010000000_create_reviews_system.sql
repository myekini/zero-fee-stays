-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Ratings (1-5 scale)
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

  -- Metadata
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'flagged', 'hidden')),
  helpful_count INTEGER DEFAULT 0,
  reported_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(booking_id), -- One review per booking
  CHECK (guest_id != host_id)
);

-- Create review images table
CREATE TABLE IF NOT EXISTS review_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create review helpful votes table
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Create review reports table
CREATE TABLE IF NOT EXISTS review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'fake', 'offensive', 'other')),
  details TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_reviews_guest_id ON reviews(guest_id);
CREATE INDEX idx_reviews_host_id ON reviews(host_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE INDEX idx_review_images_review_id ON review_images(review_id);
CREATE INDEX idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);
CREATE INDEX idx_review_reports_review_id ON review_reports(review_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_reports_updated_at
    BEFORE UPDATE ON review_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update property average rating
CREATE OR REPLACE FUNCTION update_property_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE properties
    SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE property_id = NEW.property_id
        AND status = 'published'
    ),
    review_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE property_id = NEW.property_id
        AND status = 'published'
    )
    WHERE id = NEW.property_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update property rating when review is added/updated
CREATE TRIGGER update_property_rating_on_review_insert
    AFTER INSERT ON reviews
    FOR EACH ROW
    WHEN (NEW.status = 'published')
    EXECUTE FUNCTION update_property_rating();

CREATE TRIGGER update_property_rating_on_review_update
    AFTER UPDATE ON reviews
    FOR EACH ROW
    WHEN (OLD.status != NEW.status OR OLD.rating != NEW.rating)
    EXECUTE FUNCTION update_property_rating();

-- Add rating and review_count columns to properties table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'properties' AND column_name = 'rating') THEN
        ALTER TABLE properties ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'properties' AND column_name = 'review_count') THEN
        ALTER TABLE properties ADD COLUMN review_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Row Level Security Policies

-- Reviews table policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read published reviews
CREATE POLICY "Anyone can view published reviews"
    ON reviews FOR SELECT
    USING (status = 'published');

-- Guests can view their own reviews (any status)
CREATE POLICY "Guests can view their own reviews"
    ON reviews FOR SELECT
    USING (auth.uid() = guest_id);

-- Hosts can view reviews for their properties
CREATE POLICY "Hosts can view reviews for their properties"
    ON reviews FOR SELECT
    USING (auth.uid() = host_id);

-- Guests can create reviews for their completed bookings
CREATE POLICY "Guests can create reviews for their bookings"
    ON reviews FOR INSERT
    WITH CHECK (
        auth.uid() = guest_id AND
        EXISTS (
            SELECT 1 FROM bookings
            WHERE id = booking_id
            AND guest_id = auth.uid()
            AND status = 'completed'
            AND check_out_date < NOW()
        )
    );

-- Guests can update their own pending reviews
CREATE POLICY "Guests can update their own pending reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = guest_id AND status = 'pending')
    WITH CHECK (auth.uid() = guest_id);

-- Hosts can respond to reviews
CREATE POLICY "Hosts can respond to reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = host_id)
    WITH CHECK (auth.uid() = host_id);

-- Review images policies
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view review images"
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
            SELECT 1 FROM reviews
            WHERE id = review_id AND guest_id = auth.uid()
        )
    );

-- Review helpful votes policies
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own helpful votes"
    ON review_helpful_votes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view helpful vote counts"
    ON review_helpful_votes FOR SELECT
    USING (true);

-- Review reports policies
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create review reports"
    ON review_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
    ON review_reports FOR SELECT
    USING (auth.uid() = reporter_id);

-- Create view for review statistics
CREATE OR REPLACE VIEW review_statistics AS
SELECT
    r.property_id,
    COUNT(*) as total_reviews,
    AVG(r.rating) as avg_rating,
    AVG(r.cleanliness_rating) as avg_cleanliness,
    AVG(r.accuracy_rating) as avg_accuracy,
    AVG(r.communication_rating) as avg_communication,
    AVG(r.location_rating) as avg_location,
    AVG(r.value_rating) as avg_value,
    COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star_count,
    COUNT(CASE WHEN r.rating = 4 THEN 1 END) as four_star_count,
    COUNT(CASE WHEN r.rating = 3 THEN 1 END) as three_star_count,
    COUNT(CASE WHEN r.rating = 2 THEN 1 END) as two_star_count,
    COUNT(CASE WHEN r.rating = 1 THEN 1 END) as one_star_count
FROM reviews r
WHERE r.status = 'published'
GROUP BY r.property_id;

COMMENT ON TABLE reviews IS 'Stores guest reviews and ratings for properties';
COMMENT ON TABLE review_images IS 'Stores images uploaded with reviews';
COMMENT ON TABLE review_helpful_votes IS 'Tracks helpful votes on reviews';
COMMENT ON TABLE review_reports IS 'Stores reports of inappropriate reviews';
