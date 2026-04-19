CREATE TABLE public.effi_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1,
  rules_accepted BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.effi_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit booking"
ON public.effi_bookings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view bookings"
ON public.effi_bookings
FOR SELECT
USING (true);

CREATE POLICY "Anyone can delete bookings"
ON public.effi_bookings
FOR DELETE
USING (true);