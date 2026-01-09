import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useCallback } from 'react';
import { Student, FeesFilter, MonthlyPayment } from '@/types/student';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logStudentCreate, logStudentUpdate, logStudentDelete, logPaymentUpdate } from '@/utils/logger';

// Helper to generate monthly payments based on enrollment date, duration, and total fee
export function generateMonthlyPayments(
  enrollmentDate: string,
  durationMonths: number,
  totalFee: number
): MonthlyPayment[] {
  const payments: MonthlyPayment[] = [];
  const startDate = new Date(enrollmentDate);
  
  const baseMonthlyFee = Math.floor(totalFee / durationMonths);
  const remainder = totalFee - (baseMonthlyFee * durationMonths);
  
  for (let i = 0; i < durationMonths; i++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);
    
    const amount = i === durationMonths - 1 ? baseMonthlyFee + remainder : baseMonthlyFee;
    
    payments.push({
      month: paymentDate.getMonth(),
      year: paymentDate.getFullYear(),
      amount,
      isPaid: false,
    });
  }
  
  return payments;
}

interface DbStudent {
  id: string;
  full_name: string;
  course: string;
  batch: string | null;
  fees_amount: number;
  monthly_fee: number;
  duration_months: number;
  fees_status: string;
  mobile_number: string | null;
  enrollment_date: string | null;
  created_at: string;
  updated_at: string;
}

interface DbPayment {
  id: string;
  student_id: string;
  month: number;
  year: number;
  amount: number;
  is_paid: boolean;
  paid_date: string | null;
}

function toStudent(dbStudent: DbStudent, payments: DbPayment[]): Student {
  const sortedPayments = [...payments].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  return {
    id: dbStudent.id,
    fullName: dbStudent.full_name,
    course: dbStudent.course,
    batch: dbStudent.batch || '',
    feesAmount: Number(dbStudent.fees_amount),
    monthlyFee: Number(dbStudent.monthly_fee),
    courseDuration: dbStudent.duration_months,
    enrollmentDate: dbStudent.enrollment_date || new Date().toISOString(),
    feesStatus: dbStudent.fees_status as 'paid' | 'not_paid',
    mobile: dbStudent.mobile_number || '',
    address: '',
    notes: '',
    monthlyPayments: sortedPayments.map(p => ({
      month: p.month,
      year: p.year,
      amount: Number(p.amount),
      isPaid: p.is_paid,
      paidDate: p.paid_date || undefined,
    })),
    createdAt: dbStudent.created_at,
    updatedAt: dbStudent.updated_at,
  };
}

// Fetch students with their payments
async function fetchStudentsFromDB(): Promise<Student[]> {
  const { data: studentsData, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });

  if (studentsError) throw studentsError;

  const { data: paymentsData, error: paymentsError } = await supabase
    .from('monthly_payments')
    .select('*');

  if (paymentsError) throw paymentsError;

  return (studentsData as DbStudent[]).map(student => {
    const studentPayments = (paymentsData as DbPayment[]).filter(
      p => p.student_id === student.id
    );
    return toStudent(student, studentPayments);
  });
}

// Add student mutation
async function addStudentToDB(studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'> & { monthlyPayments?: MonthlyPayment[] }) {
  const { data: newStudent, error: studentError } = await supabase
    .from('students')
    .insert({
      full_name: studentData.fullName,
      course: studentData.course,
      batch: studentData.batch || null,
      fees_amount: studentData.feesAmount,
      monthly_fee: studentData.monthlyFee,
      duration_months: studentData.courseDuration,
      fees_status: studentData.feesStatus,
      mobile_number: studentData.mobile || null,
      enrollment_date: studentData.enrollmentDate,
    })
    .select()
    .single();

  if (studentError) throw studentError;

  if (studentData.monthlyPayments && studentData.monthlyPayments.length > 0) {
    const paymentsToInsert = studentData.monthlyPayments.map((payment) => ({
      student_id: newStudent.id,
      month: payment.month,
      year: payment.year,
      amount: payment.amount,
      is_paid: payment.isPaid,
      paid_date: payment.paidDate || null,
    }));

    const { error: paymentsError } = await supabase
      .from('monthly_payments')
      .insert(paymentsToInsert);

    if (paymentsError) throw paymentsError;
  }

  // Log activity
  await logStudentCreate(newStudent.id, {
    full_name: studentData.fullName,
    course: studentData.course,
    batch: studentData.batch,
    fees_amount: studentData.feesAmount,
  });

  return newStudent;
}

// Update student mutation
async function updateStudentInDB({ id, data, previousData }: { id: string; data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>; previousData?: Student }) {
  const { error: studentError } = await supabase
    .from('students')
    .update({
      full_name: data.fullName,
      course: data.course,
      batch: data.batch || null,
      fees_amount: data.feesAmount,
      monthly_fee: data.monthlyFee,
      duration_months: data.courseDuration,
      fees_status: data.feesStatus,
      mobile_number: data.mobile || null,
      enrollment_date: data.enrollmentDate,
    })
    .eq('id', id);

  if (studentError) throw studentError;

  // Log activity
  if (previousData) {
    await logStudentUpdate(
      id,
      {
        full_name: previousData.fullName,
        course: previousData.course,
        batch: previousData.batch,
        fees_amount: previousData.feesAmount,
      },
      {
        full_name: data.fullName,
        course: data.course,
        batch: data.batch,
        fees_amount: data.feesAmount,
      }
    );
  }

  return { id };
}

// Delete student mutation
async function deleteStudentFromDB({ id, studentData }: { id: string; studentData?: Student }) {
  // Log activity before deletion
  if (studentData) {
    await logStudentDelete(id, {
      full_name: studentData.fullName,
      course: studentData.course,
      batch: studentData.batch,
      fees_amount: studentData.feesAmount,
    });
  }

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { id };
}

// Update payment status mutation
async function updatePaymentStatusInDB({ studentId, paymentIndex, isPaid, studentName }: { studentId: string; paymentIndex: number; isPaid: boolean; studentName?: string }) {
  const { data: payments, error: fetchError } = await supabase
    .from('monthly_payments')
    .select('*')
    .eq('student_id', studentId)
    .order('year', { ascending: true })
    .order('month', { ascending: true });

  if (fetchError) throw fetchError;

  if (payments && payments[paymentIndex]) {
    const payment = payments[paymentIndex];
    const previousStatus = payment.is_paid;
    
    const { error: updateError } = await supabase
      .from('monthly_payments')
      .update({
        is_paid: isPaid,
        paid_date: isPaid ? new Date().toISOString().split('T')[0] : null,
      })
      .eq('id', payment.id);

    if (updateError) throw updateError;

    // Log payment update
    await logPaymentUpdate(
      payment.id,
      studentName || 'Unknown Student',
      { is_paid: previousStatus, month: payment.month, year: payment.year },
      { is_paid: isPaid, month: payment.month, year: payment.year }
    );

    const updatedPayments = payments.map((p, i) => 
      i === paymentIndex ? { ...p, is_paid: isPaid } : p
    );
    const allPaid = updatedPayments.every(p => p.is_paid);

    await supabase
      .from('students')
      .update({ fees_status: allPaid ? 'paid' : 'not_paid' })
      .eq('id', studentId);
  }

  return { studentId, paymentIndex, isPaid };
}

export function useStudentsQuery() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [feesFilter, setFeesFilter] = useState<FeesFilter>('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Main query for students
  const { data: students = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudentsFromDB,
  });

  // Add student mutation
  const addMutation = useMutation({
    mutationFn: addStudentToDB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student added successfully');
    },
    onError: (error) => {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    },
  });

  // Update student mutation
  const updateMutation = useMutation({
    mutationFn: updateStudentInDB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setEditingStudent(null);
      toast.success('Student updated successfully');
    },
    onError: (error) => {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
    },
  });

  // Delete student mutation
  const deleteMutation = useMutation({
    mutationFn: deleteStudentFromDB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    },
  });

  // Update payment mutation
  const updatePaymentMutation = useMutation({
    mutationFn: updatePaymentStatusInDB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error) => {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment');
    },
  });

  const addStudent = useCallback(async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'> & { monthlyPayments?: MonthlyPayment[] }) => {
    await addMutation.mutateAsync(studentData);
    return true;
  }, [addMutation]);

  const updateStudent = useCallback(async (id: string, data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    const previousData = students.find(s => s.id === id);
    await updateMutation.mutateAsync({ id, data, previousData });
    return true;
  }, [updateMutation, students]);

  const deleteStudent = useCallback(async (id: string) => {
    const studentData = students.find(s => s.id === id);
    await deleteMutation.mutateAsync({ id, studentData });
    return true;
  }, [deleteMutation, students]);

  const updatePaymentStatus = useCallback(async (studentId: string, paymentIndex: number, isPaid: boolean, studentName?: string) => {
    await updatePaymentMutation.mutateAsync({ studentId, paymentIndex, isPaid, studentName });
  }, [updatePaymentMutation]);

  const startEditing = useCallback((student: Student) => {
    setEditingStudent(student);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingStudent(null);
  }, []);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.course.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        feesFilter === 'all' || student.feesStatus === feesFilter;

      return matchesSearch && matchesFilter;
    });
  }, [students, searchQuery, feesFilter]);

  // Statistics
  const stats = useMemo(() => ({
    total: students.length,
    paid: students.filter(s => s.feesStatus === 'paid').length,
    notPaid: students.filter(s => s.feesStatus === 'not_paid').length,
    totalFees: students.reduce((sum, s) => {
      const monthlyTotal = s.monthlyPayments?.reduce((pSum, p) => pSum + p.amount, 0) || 0;
      return sum + (monthlyTotal > 0 ? monthlyTotal : s.feesAmount);
    }, 0),
    paidFees: students.reduce((sum, s) => {
      const paidMonths = s.monthlyPayments?.filter(p => p.isPaid) || [];
      return sum + paidMonths.reduce((pSum, p) => pSum + p.amount, 0);
    }, 0),
  }), [students]);

  return {
    students: filteredStudents,
    allStudents: students,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
    feesFilter,
    setFeesFilter,
    editingStudent,
    addStudent,
    updateStudent,
    deleteStudent,
    updatePaymentStatus,
    startEditing,
    cancelEditing,
    refetch,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
