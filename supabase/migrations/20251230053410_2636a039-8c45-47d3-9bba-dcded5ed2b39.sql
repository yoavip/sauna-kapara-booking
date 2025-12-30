-- Allow users to delete their own registrations
CREATE POLICY "Users can delete their own registrations" 
ON public.registrations 
FOR DELETE 
USING (true);

-- Create analytics table for tracking
CREATE TABLE public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_name TEXT,
  user_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics events
CREATE POLICY "Anyone can insert analytics" 
ON public.analytics 
FOR INSERT 
WITH CHECK (true);

-- Anyone can view analytics (for admin purposes later)
CREATE POLICY "Anyone can view analytics" 
ON public.analytics 
FOR SELECT 
USING (true);