-- Create a separate table for snooker registrations
CREATE TABLE public.snooker_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  hour INTEGER NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.snooker_registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (same as registrations table)
CREATE POLICY "Anyone can register to snooker" 
ON public.snooker_registrations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view snooker registrations" 
ON public.snooker_registrations 
FOR SELECT 
USING (true);

CREATE POLICY "Users can delete their own snooker registrations" 
ON public.snooker_registrations 
FOR DELETE 
USING (true);

-- Enable realtime for snooker registrations
ALTER PUBLICATION supabase_realtime ADD TABLE public.snooker_registrations;