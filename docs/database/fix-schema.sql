-- Fix Missing Columns in Properties Table
-- Run this directly in Supabase SQL Editor

-- Add missing columns to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS min_nights INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_nights INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS advance_notice_hours INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS same_day_booking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS availability_rules JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Update house_rules to TEXT[] if it's TEXT
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'properties'
               AND column_name = 'house_rules'
               AND data_type = 'text') THEN
        ALTER TABLE public.properties
        ALTER COLUMN house_rules TYPE TEXT[]
        USING CASE
          WHEN house_rules IS NULL THEN '{}'::TEXT[]
          ELSE ARRAY[house_rules]
        END;
    END IF;
END $$;

-- Add status constraint
DO $$
BEGIN
    ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_status_check;
    ALTER TABLE public.properties
    ADD CONSTRAINT properties_status_check
    CHECK (status IN ('draft', 'active', 'inactive'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_active ON public.properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_host_id ON public.properties(host_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);

-- Update property_images table
ALTER TABLE public.property_images
ADD COLUMN IF NOT EXISTS image_type TEXT DEFAULT 'photo';

-- Add image_type constraint
DO $$
BEGIN
    ALTER TABLE public.property_images DROP CONSTRAINT IF EXISTS property_images_image_type_check;
    ALTER TABLE public.property_images
    ADD CONSTRAINT property_images_image_type_check
    CHECK (image_type IN ('photo', 'screenshot', 'floor_plan', 'amenity'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create blocked_dates table if not exists
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  price_override DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for blocked_dates
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked_dates
DROP POLICY IF EXISTS "Anyone can view blocked dates" ON public.blocked_dates;
CREATE POLICY "Anyone can view blocked dates" ON public.blocked_dates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Hosts can manage their property blocked dates" ON public.blocked_dates;
CREATE POLICY "Hosts can manage their property blocked dates" ON public.blocked_dates
FOR ALL USING (property_id IN (SELECT id FROM public.properties WHERE host_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- Create indexes for blocked_dates
CREATE INDEX IF NOT EXISTS idx_blocked_dates_property ON public.blocked_dates(property_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_dates ON public.blocked_dates(start_date, end_date);

-- Add email column to profiles if missing
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update email from auth.users if null
UPDATE public.profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.user_id = auth.users.id
AND profiles.email IS NULL;

SELECT 'Schema fix completed successfully!' AS result;
