-- Drop existing policies on students table
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;
DROP POLICY IF EXISTS "Admins can insert students" ON public.students;
DROP POLICY IF EXISTS "Admins can update students" ON public.students;
DROP POLICY IF EXISTS "Admins can delete students" ON public.students;

-- Drop existing policies on monthly_payments table
DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Admins can insert payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.monthly_payments;

-- Students table policies
-- All authenticated users can view students
CREATE POLICY "Authenticated users can view students"
ON public.students
FOR SELECT
TO authenticated
USING (true);

-- All authenticated users can add students
CREATE POLICY "Authenticated users can insert students"
ON public.students
FOR INSERT
TO authenticated
WITH CHECK (true);

-- All authenticated users can update students
CREATE POLICY "Authenticated users can update students"
ON public.students
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Only admins can delete students
CREATE POLICY "Admins can delete students"
ON public.students
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Monthly payments table policies
-- All authenticated users can view payments
CREATE POLICY "Authenticated users can view payments"
ON public.monthly_payments
FOR SELECT
TO authenticated
USING (true);

-- All authenticated users can insert payments
CREATE POLICY "Authenticated users can insert payments"
ON public.monthly_payments
FOR INSERT
TO authenticated
WITH CHECK (true);

-- All authenticated users can update payments (mark as paid)
CREATE POLICY "Authenticated users can update payments"
ON public.monthly_payments
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Only admins can delete payments
CREATE POLICY "Admins can delete payments"
ON public.monthly_payments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));