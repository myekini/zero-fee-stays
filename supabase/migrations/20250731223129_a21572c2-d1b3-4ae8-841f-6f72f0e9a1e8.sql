-- Fix security warnings from the linter

-- Fix Function Search Path Mutable warning by setting search_path properly
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';