-- Create a users table to store user information with last names
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Anyone can view users (needed for duplicate name checking)
CREATE POLICY "Anyone can view users" 
ON public.users 
FOR SELECT 
USING (true);

-- Anyone can insert users (for registration)
CREATE POLICY "Anyone can insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- Anyone can update users
CREATE POLICY "Anyone can update users" 
ON public.users 
FOR UPDATE 
USING (true);

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Anyone can view user roles (needed for UI)
CREATE POLICY "Anyone can view user roles" 
ON public.user_roles 
FOR SELECT 
USING (true);

-- Anyone can insert user roles
CREATE POLICY "Anyone can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (true);

-- Anyone can delete user roles
CREATE POLICY "Anyone can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (true);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_phone TEXT, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.users u ON ur.user_id = u.id
    WHERE u.phone = _phone
      AND ur.role = _role
  )
$$;

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;