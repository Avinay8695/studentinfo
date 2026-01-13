-- Add is_banned column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;

-- Update RLS policies to block banned users from accessing data
-- Students table: banned users cannot access
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;
CREATE POLICY "Non-banned users can view students"
ON public.students
FOR SELECT
TO authenticated
USING (
  NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_banned = true
  )
);

-- Monthly payments: banned users cannot access
DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.monthly_payments;
CREATE POLICY "Non-banned users can view payments"
ON public.monthly_payments
FOR SELECT
TO authenticated
USING (
  NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_banned = true
  )
);

DROP POLICY IF EXISTS "Authenticated users can insert payments" ON public.monthly_payments;
CREATE POLICY "Non-banned users can insert payments"
ON public.monthly_payments
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_banned = true
  )
);