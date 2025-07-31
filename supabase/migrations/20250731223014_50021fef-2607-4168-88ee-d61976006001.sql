-- Check if we need to update tables for booking system
-- The existing tables look good, but let's add some missing columns and improve the structure

-- Add some missing columns to bookings table that might be useful
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_phone text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requests text;

-- Ensure we have proper indexes for availability checking
CREATE INDEX IF NOT EXISTS idx_bookings_property_dates ON bookings(property_id, check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_availability_property_date ON availability(property_id, date);

-- Add a function to check availability for a date range
CREATE OR REPLACE FUNCTION check_date_availability(
  p_property_id uuid,
  p_check_in date,
  p_check_out date
) RETURNS boolean AS $$
DECLARE
  booking_conflict_count integer;
  blocked_date_count integer;
BEGIN
  -- Check for booking conflicts
  SELECT COUNT(*) INTO booking_conflict_count
  FROM bookings
  WHERE property_id = p_property_id
    AND status IN ('pending', 'confirmed')
    AND (
      (check_in_date <= p_check_in AND check_out_date > p_check_in) OR
      (check_in_date < p_check_out AND check_out_date >= p_check_out) OR
      (check_in_date >= p_check_in AND check_out_date <= p_check_out)
    );
  
  -- Check for blocked dates
  SELECT COUNT(*) INTO blocked_date_count
  FROM availability
  WHERE property_id = p_property_id
    AND date >= p_check_in
    AND date < p_check_out
    AND is_available = false;
  
  -- Return true if no conflicts
  RETURN booking_conflict_count = 0 AND blocked_date_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;