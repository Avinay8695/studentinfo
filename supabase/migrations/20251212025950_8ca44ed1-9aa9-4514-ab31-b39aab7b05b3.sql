-- First drop the existing unique constraint that's causing issues
ALTER TABLE public.monthly_payments DROP CONSTRAINT IF EXISTS monthly_payments_student_id_month_key;

-- Add year column
ALTER TABLE public.monthly_payments ADD COLUMN IF NOT EXISTS year integer;

-- Update existing payments to calculate proper year and month from enrollment date
-- For each student, calculate actual month/year based on enrollment_date + payment_index
WITH payment_updates AS (
  SELECT 
    mp.id,
    mp.student_id,
    mp.month as original_month_index,
    s.enrollment_date,
    EXTRACT(MONTH FROM (s.enrollment_date + ((mp.month - 1) || ' months')::interval))::integer - 1 as new_month,
    EXTRACT(YEAR FROM (s.enrollment_date + ((mp.month - 1) || ' months')::interval))::integer as new_year
  FROM public.monthly_payments mp
  JOIN public.students s ON s.id = mp.student_id
)
UPDATE public.monthly_payments mp
SET 
  month = pu.new_month,
  year = pu.new_year
FROM payment_updates pu
WHERE mp.id = pu.id;

-- For any payments without year (shouldn't happen), set default
UPDATE public.monthly_payments SET year = 2025 WHERE year IS NULL;

-- Make year NOT NULL
ALTER TABLE public.monthly_payments ALTER COLUMN year SET NOT NULL;

-- Add new unique constraint with year included
ALTER TABLE public.monthly_payments ADD CONSTRAINT monthly_payments_student_month_year_key UNIQUE (student_id, month, year);