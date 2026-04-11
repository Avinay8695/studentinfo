import { useState, useEffect, useCallback } from 'react';
import { useStudentsQuery } from '@/hooks/useStudentsQuery';
import { useAuth } from '@/hooks/useAuth';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator';
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
import { BulkImportStudents } from '@/components/BulkImportStudents';
import { AIChatBot } from '@/components/AIChatBot';

import { SectionNav, defaultSections } from '@/components/SectionNav';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Student } from '@/types/student';
import { UserPlus, ChevronDown, ChevronUp, FileSpreadsheet, PieChart, Users, BarChart3 } from 'lucide-react';
import { StudentTableSkeleton } from '@/components/skeletons/StudentTableSkeleton';
import { StatsCardsSkeleton } from '@/components/skeletons/StatsCardsSkeleton';
import { StudentFormSkeleton } from '@/components/skeletons/StudentFormSkeleton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Index = () => {
  const { isAdmin } = useAuth();
  
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
    refetch,
    bulkAddStudents,
  } = useStudentsQuery();

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const { containerRef, pullDistance, isRefreshing, isPastThreshold } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [analyticsStudentId, setAnalyticsStudentId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

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

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      {/* Lightweight background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 pattern-dots" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 dark:to-background/80" />
      </div>
      
      <Header students={allStudents} onViewPayments={handleViewPayments} />

      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} isPastThreshold={isPastThreshold} />

      {/* Section Navigation */}
      <SectionNav sections={defaultSections} />
      
      <main className="flex-1 container max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-10 pb-24 md:pb-10 relative z-10 stagger-children">
        {/* Dashboard Summary */}
        <div id="dashboard-summary" className="min-h-[50px]">
          {!studentsLoading && stats.total > 0 && (
            <DashboardSummary stats={stats} />
          )}
        </div>

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Stats Cards with Export Button */}
        <div id="stats" className="glass-section mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="section-label">
              <PieChart className="w-3 h-3" />
              Statistics
            </span>
            <ExportButton students={allStudents} />
          </div>
          {studentsLoading ? <StatsCardsSkeleton /> : <StatsCards stats={stats} />}
        </div>

        {/* Student Form - Collapsible */}
        <div id="add-student" className="mb-4 sm:mb-6">
          <div className="flex gap-2">
            <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen} className="flex-1">
              <CollapsibleTrigger asChild>
                <Button
                  variant={isFormOpen ? "secondary" : "default"}
                  className={`w-full py-5 sm:py-6 text-base sm:text-lg font-semibold transition-all duration-500 rounded-xl sm:rounded-2xl ${
                    isFormOpen 
                      ? 'bg-muted hover:bg-muted/80 text-muted-foreground border border-border' 
                      : 'btn-glow bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] hover:bg-[length:100%_100%] transition-all duration-700'
                  }`}
                >
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                  {isFormOpen ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 sm:mt-4 animate-fade-in">
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
            <Button
              variant="outline"
              className="py-5 sm:py-6 px-3 sm:px-4 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all rounded-xl sm:rounded-2xl"
              onClick={() => setIsBulkImportOpen(true)}
              title="Bulk Import"
            >
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="hidden sm:inline ml-2 font-medium">Bulk Import</span>
            </Button>
          </div>
        </div>

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Student Table */}
        <div id="students" className="glass-section mb-4 sm:mb-6">
          <div className="flex items-center mb-3 sm:mb-4">
            <span className="section-label">
              <Users className="w-3 h-3" />
              Students
            </span>
          </div>
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

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Date Range Analytics */}
        <div id="analytics">
          {!studentsLoading && allStudents.length > 0 && (
            <div className="glass-section">
              <div className="flex items-center mb-3 sm:mb-4">
                <span className="section-label">
                  <BarChart3 className="w-3 h-3" />
                  Analytics
                </span>
              </div>
              <DateRangeAnalytics students={allStudents} />
            </div>
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

      {/* Bulk Import Dialog */}
      <BulkImportStudents
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={bulkAddStudents}
        existingStudents={allStudents}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* AI Chat Bot */}
      {!studentsLoading && stats.total > 0 && (
        <AIChatBot 
          stats={stats}
          overdueStudents={allStudents.filter(s => (s.monthlyPayments || []).some(p => !p.isPaid && (p.year < new Date().getFullYear() || (p.year === new Date().getFullYear() && p.month < new Date().getMonth())))).length}
          totalOverdueMonths={allStudents.reduce((sum, s) => sum + (s.monthlyPayments || []).filter(p => !p.isPaid && (p.year < new Date().getFullYear() || (p.year === new Date().getFullYear() && p.month < new Date().getMonth()))).length, 0)}
          activeCourses={new Set(allStudents.map(s => s.course)).size}
          courseList={[...new Set(allStudents.map(s => s.course))].join(', ')}
        />
      )}

      {/* Scroll to Top Button - hidden on mobile (bottom nav covers it) */}
      <ScrollToTop />
    </div>
  );
};

export default Index;
