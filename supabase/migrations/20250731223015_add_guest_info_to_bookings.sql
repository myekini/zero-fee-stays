-- Add missing guest information fields to bookings table
-- These fields are needed for booking creation even when guest is not logged in

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Add index for guest email for lookups
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings(guest_email);

-- Update the check constraint to ensure guest info is provided
-- Either guest_id (logged in user) OR guest_name + guest_email (guest checkout)
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_guest_info;
ALTER TABLE bookings ADD CONSTRAINT check_guest_info
  CHECK (
    (guest_id IS NOT NULL) OR
    (guest_name IS NOT NULL AND guest_email IS NOT NULL)
  );

-- Make guest_id nullable to support guest checkout
ALTER TABLE bookings ALTER COLUMN guest_id DROP NOT NULL;

COMMENT ON COLUMN bookings.guest_name IS 'Guest name for non-logged-in bookings';
COMMENT ON COLUMN bookings.guest_email IS 'Guest email for non-logged-in bookings';
COMMENT ON CONSTRAINT check_guest_info ON bookings IS 'Ensures either guest_id or guest info is provided';
