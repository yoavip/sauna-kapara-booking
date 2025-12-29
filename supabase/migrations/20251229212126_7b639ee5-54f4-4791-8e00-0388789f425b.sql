-- Create table for sauna registrations
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (to show registration counts)
CREATE POLICY "Anyone can view registrations" 
ON public.registrations 
FOR SELECT 
USING (true);

-- Create policy for public insert (anyone can register)
CREATE POLICY "Anyone can register" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for registrations table
ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;

-- Create index for faster hour-based queries
CREATE INDEX idx_registrations_hour ON public.registrations(hour);
CREATE INDEX idx_registrations_date ON public.registrations(registered_at);