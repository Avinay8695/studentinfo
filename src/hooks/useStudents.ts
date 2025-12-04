import { useState, useEffect, useCallback } from 'react';
import { Student, FeesFilter } from '@/types/student';

const STORAGE_KEY = 'institute_students_data';

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
        setStudents(parsed);
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

  // Statistics
  const stats = {
    total: students.length,
    paid: students.filter(s => s.feesStatus === 'paid').length,
    notPaid: students.filter(s => s.feesStatus === 'not_paid').length,
    totalFees: students.reduce((sum, s) => sum + s.feesAmount, 0),
    paidFees: students.filter(s => s.feesStatus === 'paid').reduce((sum, s) => sum + s.feesAmount, 0),
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
    startEditing,
    cancelEditing,
  };
}
