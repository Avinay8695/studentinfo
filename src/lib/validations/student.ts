import { z } from 'zod';

export const studentFormSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100, 'Name must be less than 100 characters'),
  course: z.string().min(1, 'Course is required'),
  batch: z.string().max(50, 'Batch must be less than 50 characters').optional().default(''),
  feesAmount: z.coerce.number().min(0, 'Fees cannot be negative'),
  monthlyFee: z.coerce.number().min(0, 'Monthly fee cannot be negative'),
  courseDuration: z.coerce.number().min(1, 'Duration must be at least 1 month'),
  enrollmentDate: z.string().min(1, 'Enrollment date is required'),
  feesStatus: z.enum(['paid', 'not_paid']).default('not_paid'),
  mobile: z.string().max(20, 'Mobile number is too long').optional().default(''),
  address: z.string().max(500, 'Address is too long').optional().default(''),
  notes: z.string().max(1000, 'Notes are too long').optional().default(''),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
