-- Fix missing guest_phone column in bookings table
-- Run this directly in Supabase SQL Editor

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_phone TEXT;

COMMENT ON COLUMN bookings.guest_phone IS 'Guest phone number for non-logged-in bookings';
