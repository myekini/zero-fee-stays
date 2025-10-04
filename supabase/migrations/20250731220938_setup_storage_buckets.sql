-- Setup Supabase Storage Buckets for Property Images
-- This migration creates the necessary storage buckets and policies for image uploads

-- Create property-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create property-thumbnails bucket for optimized images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-thumbnails',
  'property-thumbnails',
  true,
  1048576, -- 1MB limit for thumbnails
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for property-images bucket
CREATE POLICY "Anyone can view property images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'public'
);

CREATE POLICY "Hosts can update their property images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.profiles pr ON p.host_id = pr.id
    WHERE pr.user_id = auth.uid()
    AND (storage.foldername(name))[2] = p.id::text
  )
);

CREATE POLICY "Hosts can delete their property images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.profiles pr ON p.host_id = pr.id
    WHERE pr.user_id = auth.uid()
    AND (storage.foldername(name))[2] = p.id::text
  )
);

-- Storage policies for property-thumbnails bucket
CREATE POLICY "Anyone can view property thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'property-thumbnails');

CREATE POLICY "Authenticated users can upload property thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-thumbnails' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'public'
);

CREATE POLICY "Hosts can update their property thumbnails" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-thumbnails'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.profiles pr ON p.host_id = pr.id
    WHERE pr.user_id = auth.uid()
    AND (storage.foldername(name))[2] = p.id::text
  )
);

CREATE POLICY "Hosts can delete their property thumbnails" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-thumbnails'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.profiles pr ON p.host_id = pr.id
    WHERE pr.user_id = auth.uid()
    AND (storage.foldername(name))[2] = p.id::text
  )
);

-- Function to generate unique filename
CREATE OR REPLACE FUNCTION generate_unique_filename()
RETURNS TEXT AS $$
BEGIN
  RETURN 'img_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Function to get optimized image URL
CREATE OR REPLACE FUNCTION get_optimized_image_url(
  image_path TEXT,
  width INTEGER DEFAULT 800,
  height INTEGER DEFAULT 600,
  quality INTEGER DEFAULT 80
)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://ihgzllefbkzqnomsviwh.supabase.co/storage/v1/render/image/public/property-images/' || 
         image_path || 
         '?width=' || width || 
         '&height=' || height || 
         '&quality=' || quality ||
         '&resize=cover';
END;
$$ LANGUAGE plpgsql;

