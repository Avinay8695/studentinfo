-- Drop existing restrictive policies on students table
DROP POLICY IF EXISTS "Admins can delete students" ON public.students;
DROP POLICY IF EXISTS "Admins can view students" ON public.students;
DROP POLICY IF EXISTS "Admins can insert students" ON public.students;
DROP POLICY IF EXISTS "Admins can update students" ON public.students;

-- Create new policies for students table
-- SELECT: Authenticated users can view all students
CREATE POLICY "Authenticated users can view students"
ON public.students
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Authenticated users can add students
CREATE POLICY "Authenticated users can insert students"
ON public.students
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Only admins can update students
CREATE POLICY "Admins can update students"
ON public.students
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- DELETE: Only admins can delete students
CREATE POLICY "Admins can delete students"
ON public.students
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Drop existing restrictive policies on monthly_payments table
DROP POLICY IF EXISTS "Admins can delete payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Admins can view payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Admins can insert payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.monthly_payments;

-- Create new policies for monthly_payments table
-- SELECT: Authenticated users can view all payments
CREATE POLICY "Authenticated users can view payments"
ON public.monthly_payments
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Authenticated users can add payments
CREATE POLICY "Authenticated users can insert payments"
ON public.monthly_payments
FOR INSERT
TO authenticated
WITH CHECK (true);

-- DELETE: Only admins can delete payments
CREATE POLICY "Admins can delete payments"
ON public.monthly_payments
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- UPDATE: Regular users can only update if is_paid is false, admins can always update
CREATE POLICY "Users can mark unpaid as paid"
ON public.monthly_payments
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR is_paid = false
)
WITH CHECK (
  has_role(auth.uid(), 'admin') OR is_paid = true
);