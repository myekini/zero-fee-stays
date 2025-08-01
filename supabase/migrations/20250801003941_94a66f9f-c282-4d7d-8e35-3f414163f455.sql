-- Create analytics cache table for storing external analytics data
CREATE TABLE public.analytics_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(255) NOT NULL,
  value DECIMAL(15,2),
  dimensions JSONB,
  entity_id UUID, -- host_id, property_id, etc.
  entity_type VARCHAR(50), -- 'host', 'property', 'platform'
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_analytics_cache_metric_date ON public.analytics_cache(metric_name, date);
CREATE INDEX idx_analytics_cache_entity ON public.analytics_cache(entity_id, metric_name);
CREATE INDEX idx_analytics_cache_type ON public.analytics_cache(entity_type, date);
CREATE INDEX idx_analytics_cache_updated ON public.analytics_cache(updated_at);

-- Enable RLS
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Analytics cache is viewable by authenticated users" 
ON public.analytics_cache 
FOR SELECT 
USING (true); -- Analytics data can be viewed by all authenticated users

CREATE POLICY "Analytics cache can be managed by service" 
ON public.analytics_cache 
FOR ALL 
USING (true); -- Service role can manage all analytics data

-- Create function to update analytics cache
CREATE OR REPLACE FUNCTION public.upsert_analytics_metric(
  p_metric_name VARCHAR(255),
  p_value DECIMAL(15,2),
  p_dimensions JSONB DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_entity_type VARCHAR(50) DEFAULT NULL,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result_id UUID;
BEGIN
  INSERT INTO public.analytics_cache (
    metric_name,
    value,
    dimensions,
    entity_id,
    entity_type,
    date,
    updated_at
  )
  VALUES (
    p_metric_name,
    p_value,
    p_dimensions,
    p_entity_id,
    p_entity_type,
    p_date,
    now()
  )
  ON CONFLICT (metric_name, entity_id, date)
  DO UPDATE SET
    value = EXCLUDED.value,
    dimensions = EXCLUDED.dimensions,
    updated_at = now()
  RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$;

-- Create analytics event tracking table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  user_id UUID,
  session_id VARCHAR(255),
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for analytics events
CREATE INDEX idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at);

-- Enable RLS for analytics events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy for analytics events
CREATE POLICY "Users can view their own analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Analytics events can be created by anyone" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

-- Add trigger for analytics cache updated_at
CREATE TRIGGER update_analytics_cache_updated_at
BEFORE UPDATE ON public.analytics_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();