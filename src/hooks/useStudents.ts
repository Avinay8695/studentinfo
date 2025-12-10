import { useState, useEffect, useCallback } from 'react';
import { Student, FeesFilter, MonthlyPayment } from '@/types/student';

const STORAGE_KEY = 'institute_students_data';

// Helper to generate monthly payments based on enrollment date and duration
export function generateMonthlyPayments(
  enrollmentDate: string,
  durationMonths: number,
  monthlyFee: number
): MonthlyPayment[] {
  const payments: MonthlyPayment[] = [];
  const startDate = new Date(enrollmentDate);
  
  for (let i = 0; i < durationMonths; i++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);
    
    payments.push({
      month: paymentDate.getMonth(),
      year: paymentDate.getFullYear(),
      amount: monthlyFee,
      isPaid: false,
    });
  }
  
  return payments;
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [feesFilter, setFeesFilter] = useState<FeesFilter>('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Load students from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Migrate old data format to new format with monthly payments
        const migrated = parsed.map((student: any) => ({
          ...student,
          monthlyPayments: student.monthlyPayments || [],
          monthlyFee: student.monthlyFee || 0,
          courseDuration: student.courseDuration || 0,
          enrollmentDate: student.enrollmentDate || student.createdAt,
        }));
        setStudents(migrated);
      } catch (e) {
        console.error('Failed to parse students from localStorage');
      }
    }
  }, []);

  // Save students to localStorage whenever they change
  const saveToStorage = useCallback((data: Student[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const addStudent = useCallback((studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    saveToStorage(updated);
  }, [students, saveToStorage]);

  const updateStudent = useCallback((id: string, studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    const updated = students.map(s => 
      s.id === id 
        ? { ...s, ...studentData, updatedAt: new Date().toISOString() }
        : s
    );
    setStudents(updated);
    saveToStorage(updated);
    setEditingStudent(null);
  }, [students, saveToStorage]);

  const deleteStudent = useCallback((id: string) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    saveToStorage(updated);
  }, [students, saveToStorage]);

  // Update monthly payment status
  const updatePaymentStatus = useCallback((
    studentId: string, 
    paymentIndex: number, 
    isPaid: boolean
  ) => {
    const updated = students.map(s => {
      if (s.id !== studentId) return s;
      
      const updatedPayments = [...s.monthlyPayments];
      updatedPayments[paymentIndex] = {
        ...updatedPayments[paymentIndex],
        isPaid,
        paidDate: isPaid ? new Date().toISOString() : undefined,
      };
      
      // Recalculate overall fees status
      const allPaid = updatedPayments.every(p => p.isPaid);
      
      return {
        ...s,
        monthlyPayments: updatedPayments,
        feesStatus: allPaid ? 'paid' as const : 'not_paid' as const,
        updatedAt: new Date().toISOString(),
      };
    });
    
    setStudents(updated);
    saveToStorage(updated);
  }, [students, saveToStorage]);

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
  };
}
