import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '@/hooks/useStudents';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { StudentForm } from '@/components/StudentForm';
import { StatsCards } from '@/components/StatsCards';
import { StudentTable } from '@/components/StudentTable';
import { Footer } from '@/components/Footer';
import { MonthlyPaymentTracker } from '@/components/MonthlyPaymentTracker';
import { ExportButton } from '@/components/ExportButton';
import { Student } from '@/types/student';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user, role } = useAuth();
  
  const {
    students,
    allStudents,
    stats,
    loading: studentsLoading,
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
  } = useStudents();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Get the latest student data from allStudents - this ensures instant updates
  const selectedStudentForPayments = selectedStudentId 
    ? allStudents.find(s => s.id === selectedStudentId) || null
    : null;

  const handleViewPayments = (student: Student) => {
    setSelectedStudentId(student.id);
    setIsPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedStudentId(null);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Background pattern */}
      <div className="fixed inset-0 pattern-dots pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-10 relative z-10">
        {/* Stats Cards with Export Button */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <StatsCards stats={stats} />
          </div>
          <div className="flex justify-end sm:mt-0">
            <ExportButton students={allStudents} />
          </div>
        </div>

        {/* Student Form */}
        <div className="mb-8">
          <StudentForm
            editingStudent={editingStudent}
            onSubmit={addStudent}
            onUpdate={updateStudent}
            onCancel={cancelEditing}
          />
        </div>

        {/* Student Table */}
        {studentsLoading ? (
          <div className="card-elevated p-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        ) : (
          <StudentTable
            students={students}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            feesFilter={feesFilter}
            onFilterChange={setFeesFilter}
            onEdit={startEditing}
            onDelete={deleteStudent}
            onViewPayments={handleViewPayments}
          />
        )}
      </main>

      <Footer />

      {/* Monthly Payment Tracker Dialog */}
      <MonthlyPaymentTracker
        student={selectedStudentForPayments}
        isOpen={isPaymentDialogOpen}
        onClose={handleClosePaymentDialog}
        onUpdatePayment={updatePaymentStatus}
      />
    </div>
  );
};

export default Index;
