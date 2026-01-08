import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentsQuery } from '@/hooks/useStudentsQuery';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { StudentFormNew } from '@/components/StudentFormNew';
import { StatsCards } from '@/components/StatsCards';
import { StudentTable } from '@/components/StudentTable';
import { Footer } from '@/components/Footer';
import { MonthlyPaymentTracker } from '@/components/MonthlyPaymentTracker';
import { StudentAnalytics } from '@/components/StudentAnalytics';
import { ExportButton } from '@/components/ExportButton';
import { DashboardSummary } from '@/components/DashboardSummary';
import { DateRangeAnalytics } from '@/components/DateRangeAnalytics';
import { SectionNav, defaultSections } from '@/components/SectionNav';
import { Student } from '@/types/student';
import { Loader2, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { StudentTableSkeleton } from '@/components/skeletons/StudentTableSkeleton';
import { StatsCardsSkeleton } from '@/components/skeletons/StatsCardsSkeleton';
import { StudentFormSkeleton } from '@/components/skeletons/StudentFormSkeleton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user, isAdmin } = useAuth();
  
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
    isAdding,
    isUpdating,
  } = useStudentsQuery();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [analyticsStudentId, setAnalyticsStudentId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Open form when editing
  useEffect(() => {
    if (editingStudent) {
      setIsFormOpen(true);
    }
  }, [editingStudent]);

  // Get the latest student data from allStudents
  const selectedStudentForPayments = selectedStudentId 
    ? allStudents.find(s => s.id === selectedStudentId) || null
    : null;

  const selectedStudentForAnalytics = analyticsStudentId 
    ? allStudents.find(s => s.id === analyticsStudentId) || null
    : null;

  const handleViewPayments = (student: Student) => {
    setSelectedStudentId(student.id);
    setIsPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedStudentId(null);
  };

  const handleViewAnalytics = (student: Student) => {
    setAnalyticsStudentId(student.id);
    setIsAnalyticsDialogOpen(true);
  };

  const handleCloseAnalyticsDialog = () => {
    setIsAnalyticsDialogOpen(false);
    setAnalyticsStudentId(null);
  };

  const handleAddStudent = async (data: any) => {
    await addStudent(data);
    setIsFormOpen(false);
  };

  const handleUpdateStudent = async (id: string, data: any) => {
    await updateStudent(id, data);
    setIsFormOpen(false);
  };

  const handleCancelEdit = () => {
    cancelEditing();
    if (!editingStudent) {
      setIsFormOpen(false);
    }
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

      {/* Section Navigation */}
      <SectionNav sections={defaultSections} />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-10 relative z-10">
        {/* Dashboard Summary */}
        <div id="dashboard-summary">
          {!studentsLoading && stats.total > 0 && (
            <DashboardSummary stats={stats} />
          )}
        </div>

        {/* Stats Cards with Export Button */}
        <div id="stats" className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            {studentsLoading ? <StatsCardsSkeleton /> : <StatsCards stats={stats} />}
          </div>
          <div className="flex justify-end sm:mt-0">
            <ExportButton students={allStudents} />
          </div>
        </div>

        {/* Student Form - Collapsible */}
        <div id="add-student" className="mb-8">
          <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant={isFormOpen ? "secondary" : "default"}
                className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
                  isFormOpen 
                    ? 'bg-muted hover:bg-muted/80 text-muted-foreground' 
                    : 'btn-glow bg-gradient-to-r from-primary to-accent hover:opacity-90'
                }`}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                {editingStudent ? 'Edit Student' : 'Add New Student'}
                {isFormOpen ? (
                  <ChevronUp className="w-5 h-5 ml-2" />
                ) : (
                  <ChevronDown className="w-5 h-5 ml-2" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 animate-fade-in">
              {studentsLoading ? (
                <StudentFormSkeleton />
              ) : (
                <StudentFormNew
                  editingStudent={editingStudent}
                  onSubmit={handleAddStudent}
                  onUpdate={handleUpdateStudent}
                  onCancel={handleCancelEdit}
                  isSubmitting={isAdding || isUpdating}
                  isAdmin={isAdmin}
                />
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Student Table */}
        <div id="students">
          {studentsLoading ? (
            <StudentTableSkeleton />
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
              onViewAnalytics={handleViewAnalytics}
              isAdmin={isAdmin}
            />
          )}
        </div>

        {/* Date Range Analytics - Below Students */}
        <div id="analytics" className="mt-8">
          {!studentsLoading && allStudents.length > 0 && (
            <DateRangeAnalytics students={allStudents} />
          )}
        </div>
      </main>

      <Footer />

      {/* Monthly Payment Tracker Dialog */}
      <MonthlyPaymentTracker
        student={selectedStudentForPayments}
        isOpen={isPaymentDialogOpen}
        onClose={handleClosePaymentDialog}
        onUpdatePayment={updatePaymentStatus}
        isAdmin={isAdmin}
      />

      {/* Student Analytics Dialog */}
      <StudentAnalytics
        student={selectedStudentForAnalytics}
        isOpen={isAnalyticsDialogOpen}
        onClose={handleCloseAnalyticsDialog}
      />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default Index;
