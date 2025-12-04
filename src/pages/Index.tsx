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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        {/* Student Form */}
        <div className="mb-8">
          <StudentForm
            editingStudent={editingStudent}
            onSubmit={addStudent}
            onUpdate={updateStudent}
            onCancel={cancelEditing}
          />
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

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
