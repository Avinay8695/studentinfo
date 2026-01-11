-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert students" ON public.students;

-- Create new policy that restricts INSERT to admins only
CREATE POLICY "Admins can insert students" 
ON public.students 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));