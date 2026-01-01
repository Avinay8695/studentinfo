-- Drop existing permissive policies on students table
DROP POLICY IF EXISTS "Authenticated users can delete students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can insert students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can update students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;

-- Drop existing permissive policies on monthly_payments table
DROP POLICY IF EXISTS "Authenticated users can delete payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Authenticated users can insert payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Authenticated users can update payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.monthly_payments;

-- Create new RLS policies for students table
-- All authenticated users can view students
CREATE POLICY "Authenticated users can view students"
ON public.students
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert students
CREATE POLICY "Admins can insert students"
ON public.students
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update students
CREATE POLICY "Admins can update students"
ON public.students
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete students
CREATE POLICY "Admins can delete students"
ON public.students
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create new RLS policies for monthly_payments table
-- All authenticated users can view payments
CREATE POLICY "Authenticated users can view payments"
ON public.monthly_payments
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert payments
CREATE POLICY "Admins can insert payments"
ON public.monthly_payments
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update payments
CREATE POLICY "Admins can update payments"
ON public.monthly_payments
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete payments
CREATE POLICY "Admins can delete payments"
ON public.monthly_payments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));