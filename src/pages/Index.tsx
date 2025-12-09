import { useStudents } from '@/hooks/useStudents';
import { Header } from '@/components/Header';
import { StudentForm } from '@/components/StudentForm';
import { StatsCards } from '@/components/StatsCards';
import { StudentTable } from '@/components/StudentTable';
import { Footer } from '@/components/Footer';

const Index = () => {
  const {
    students,
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
  } = useStudents();

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Background pattern */}
      <div className="fixed inset-0 pattern-dots pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-10 relative z-10">
        {/* Stats Cards - Moved above form for better overview */}
        <StatsCards stats={stats} />

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
        <StudentTable
          students={students}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          feesFilter={feesFilter}
          onFilterChange={setFeesFilter}
          onEdit={startEditing}
          onDelete={deleteStudent}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
