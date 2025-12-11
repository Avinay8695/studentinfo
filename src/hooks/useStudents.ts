import { useState, useEffect, useCallback } from 'react';
import { Student, FeesFilter, MonthlyPayment } from '@/types/student';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper to generate monthly payments based on enrollment date, duration, and total fee
export function generateMonthlyPayments(
  enrollmentDate: string,
  durationMonths: number,
  totalFee: number
): MonthlyPayment[] {
  const payments: MonthlyPayment[] = [];
  const startDate = new Date(enrollmentDate);
  
  // Calculate base monthly fee and remainder
  const baseMonthlyFee = Math.floor(totalFee / durationMonths);
  const remainder = totalFee - (baseMonthlyFee * durationMonths);
  
  for (let i = 0; i < durationMonths; i++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);
    
    // Add remainder to the last payment
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
  amount: number;
  is_paid: boolean;
  paid_date: string | null;
}

// Convert DB student to frontend Student type
function toStudent(dbStudent: DbStudent, payments: DbPayment[]): Student {
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
    monthlyPayments: payments.map(p => ({
      month: p.month,
      year: new Date(dbStudent.enrollment_date || new Date()).getFullYear(),
      amount: Number(p.amount),
      isPaid: p.is_paid,
      paidDate: p.paid_date || undefined,
    })),
    createdAt: dbStudent.created_at,
    updatedAt: dbStudent.updated_at,
  };
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feesFilter, setFeesFilter] = useState<FeesFilter>('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Fetch students from Supabase
  const fetchStudents = useCallback(async () => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('monthly_payments')
        .select('*');

      if (paymentsError) throw paymentsError;

      const studentsWithPayments = (studentsData as DbStudent[]).map(student => {
        const studentPayments = (paymentsData as DbPayment[]).filter(
          p => p.student_id === student.id
        );
        return toStudent(student, studentPayments);
      });

      setStudents(studentsWithPayments);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const addStudent = useCallback(async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Insert student
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

      // Insert monthly payments
      if (studentData.monthlyPayments && studentData.monthlyPayments.length > 0) {
        const paymentsToInsert = studentData.monthlyPayments.map((payment, index) => ({
          student_id: newStudent.id,
          month: index + 1,
          amount: payment.amount,
          is_paid: payment.isPaid,
          paid_date: payment.paidDate || null,
        }));

        const { error: paymentsError } = await supabase
          .from('monthly_payments')
          .insert(paymentsToInsert);

        if (paymentsError) throw paymentsError;
      }

      await fetchStudents();
      return true;
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
      return false;
    }
  }, [fetchStudents]);

  const updateStudent = useCallback(async (id: string, studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { error: studentError } = await supabase
        .from('students')
        .update({
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
        .eq('id', id);

      if (studentError) throw studentError;

      await fetchStudents();
      setEditingStudent(null);
      return true;
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
      return false;
    }
  }, [fetchStudents]);

  const deleteStudent = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchStudents();
      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
      return false;
    }
  }, [fetchStudents]);

  // Update monthly payment status
  const updatePaymentStatus = useCallback(async (
    studentId: string, 
    paymentIndex: number, 
    isPaid: boolean
  ) => {
    try {
      const { data: payments, error: fetchError } = await supabase
        .from('monthly_payments')
        .select('*')
        .eq('student_id', studentId)
        .order('month', { ascending: true });

      if (fetchError) throw fetchError;

      if (payments && payments[paymentIndex]) {
        const { error: updateError } = await supabase
          .from('monthly_payments')
          .update({
            is_paid: isPaid,
            paid_date: isPaid ? new Date().toISOString().split('T')[0] : null,
          })
          .eq('id', payments[paymentIndex].id);

        if (updateError) throw updateError;

        // Check if all payments are paid and update student status
        const updatedPayments = payments.map((p, i) => 
          i === paymentIndex ? { ...p, is_paid: isPaid } : p
        );
        const allPaid = updatedPayments.every(p => p.is_paid);

        await supabase
          .from('students')
          .update({ fees_status: allPaid ? 'paid' : 'not_paid' })
          .eq('id', studentId);

        await fetchStudents();
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment');
    }
  }, [fetchStudents]);

  const startEditing = useCallback((student: Student) => {
    setEditingStudent(student);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingStudent(null);
  }, []);

  // Filtered students based on search and fees filter
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      feesFilter === 'all' || student.feesStatus === feesFilter;

    return matchesSearch && matchesFilter;
  });

  // Statistics - calculate both totalFees and paidFees from monthlyPayments for consistency
  const stats = {
    total: students.length,
    paid: students.filter(s => s.feesStatus === 'paid').length,
    notPaid: students.filter(s => s.feesStatus === 'not_paid').length,
    totalFees: students.reduce((sum, s) => {
      // Use sum of monthly payments if available, otherwise fall back to feesAmount
      const monthlyTotal = s.monthlyPayments?.reduce((pSum, p) => pSum + p.amount, 0) || 0;
      return sum + (monthlyTotal > 0 ? monthlyTotal : s.feesAmount);
    }, 0),
    paidFees: students.reduce((sum, s) => {
      const paidMonths = s.monthlyPayments?.filter(p => p.isPaid) || [];
      return sum + paidMonths.reduce((pSum, p) => pSum + p.amount, 0);
    }, 0),
  };

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
    refetch: fetchStudents,
  };
}
