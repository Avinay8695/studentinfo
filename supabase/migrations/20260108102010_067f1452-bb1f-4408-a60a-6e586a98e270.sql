-- Fix PUBLIC_DATA_EXPOSURE: Restrict students and monthly_payments access to admins only

-- Drop overly permissive policies on students table
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can insert students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can update students" ON public.students;

-- Create admin-only policies for students table
CREATE POLICY "Admins can view students"
ON public.students
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert students"
ON public.students
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update students"
ON public.students
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop overly permissive policies on monthly_payments table
DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Authenticated users can insert payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Authenticated users can update payments" ON public.monthly_payments;

-- Create admin-only policies for monthly_payments table
CREATE POLICY "Admins can view payments"
ON public.monthly_payments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert payments"
ON public.monthly_payments
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update payments"
ON public.monthly_payments
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));