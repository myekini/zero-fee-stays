-- Add missing columns to properties table for enhanced property management
-- This migration adds columns that are needed for the property management system

-- Add missing columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS min_nights INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_nights INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS advance_notice_hours INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS same_day_booking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
ADD COLUMN IF NOT EXISTS availability_rules JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS house_rules TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Add image_type column to property_images table
ALTER TABLE public.property_images 
ADD COLUMN IF NOT EXISTS image_type TEXT DEFAULT 'photo' CHECK (image_type IN ('photo', 'screenshot', 'floor_plan', 'amenity'));

-- Create blocked_dates table for calendar management
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
CREATE POLICY "Anyone can view blocked dates" ON public.blocked_dates FOR SELECT USING (true);
CREATE POLICY "Hosts can manage their property blocked dates" ON public.blocked_dates 
FOR ALL USING (property_id IN (SELECT id FROM public.properties WHERE host_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_active ON public.properties(is_active);
CREATE INDEX IF NOT EXISTS idx_property_images_type ON public.property_images(image_type);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_property ON public.blocked_dates(property_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_dates ON public.blocked_dates(start_date, end_date);

-- Add trigger for blocked_dates updated_at
CREATE TRIGGER update_blocked_dates_updated_at 
BEFORE UPDATE ON public.blocked_dates 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
