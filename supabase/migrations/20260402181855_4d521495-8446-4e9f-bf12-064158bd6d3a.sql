
-- Add deleted_at column for soft delete
ALTER TABLE public.students ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Create index for efficient filtering
CREATE INDEX idx_students_deleted_at ON public.students (deleted_at);
