-- Add missing columns to properties table for enhanced property management
-- This migration adds the is_featured column and other missing fields

-- Add is_featured column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add email column to profiles table if missing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for better performance on featured properties
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(is_featured);

-- Create index for better performance on host_id
CREATE INDEX IF NOT EXISTS idx_properties_host_id ON public.properties(host_id);

-- Create index for better performance on property_type
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);

-- Update the email column in profiles to be populated from auth.users
UPDATE public.profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE profiles.user_id = auth.users.id 
AND profiles.email IS NULL;

-- Create function to sync email from auth.users
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET email = NEW.email 
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync email updates
DROP TRIGGER IF EXISTS sync_email_trigger ON auth.users;
CREATE TRIGGER sync_email_trigger
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_email();
