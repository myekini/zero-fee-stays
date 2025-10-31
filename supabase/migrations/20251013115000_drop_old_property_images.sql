-- Drop old tables if they exist with wrong schema so Week 1 can recreate them
DROP TABLE IF EXISTS public.property_images CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.property_availability CASCADE;

-- This allows the Week 1 migration to create them with the correct schema
