-- Allow deleting users (for admin)
CREATE POLICY "Anyone can delete users" 
ON public.users 
FOR DELETE 
USING (true);