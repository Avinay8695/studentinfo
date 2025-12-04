export interface Student {
  id: string;
  fullName: string;
  course: string;
  batch: string;
  feesAmount: number;
  feesStatus: 'paid' | 'not_paid';
  mobile: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type FeesFilter = 'all' | 'paid' | 'not_paid';
