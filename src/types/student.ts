export interface MonthlyPayment {
  month: number; // 0-11 (Jan-Dec)
  year: number;
  amount: number;
  isPaid: boolean;
  paidDate?: string;
}

export interface Student {
  id: string;
  fullName: string;
  course: string;
  batch: string;
  feesAmount: number;
  monthlyFee: number;
  courseDuration: number; // in months
  enrollmentDate: string;
  feesStatus: 'paid' | 'not_paid';
  mobile: string;
  address: string;
  notes: string;
  monthlyPayments: MonthlyPayment[];
  createdAt: string;
  updatedAt: string;
}

export type FeesFilter = 'all' | 'paid' | 'not_paid';
