import { useState } from 'react';
import { Student, FeesFilter } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Pencil, Trash2, Users, Filter, TableIcon, GraduationCap, Calendar, CreditCard, BarChart3, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface StudentTableProps {
  students: Student[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  feesFilter: FeesFilter;
  onFilterChange: (filter: FeesFilter) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  onViewPayments: (student: Student) => void;
  onViewAnalytics: (student: Student) => void;
  isAdmin?: boolean;
}

export function StudentTable({
  students,
  searchQuery,
  onSearchChange,
  feesFilter,
  onFilterChange,
  onEdit,
  onDelete,
  onViewPayments,
  onViewAnalytics,
  isAdmin = false,
}: StudentTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      onDelete(studentToDelete.id);
      toast.success('Student deleted successfully');
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="card-elevated animate-fade-in overflow-hidden" style={{ animationDelay: '0.2s' }}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl">
              <TableIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-card-foreground font-display">Student Records</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{students.length} student{students.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or course..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 min-h-[44px] input-focus bg-background/80"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <Select value={feesFilter} onValueChange={(value: FeesFilter) => onFilterChange(value)}>
              <SelectTrigger className="w-full sm:w-48 min-h-[44px] input-focus bg-background/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="paid">✅ Fees Paid</SelectItem>
                <SelectItem value="not_paid">⏳ Fees Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      {students.length > 0 ? (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border">
            {students.map((student, index) => {
              const payments = student.monthlyPayments || [];
              const paidCount = payments.filter(p => p.isPaid).length;
              const totalMonths = payments.length;
              const progressPercent = totalMonths > 0 ? (paidCount / totalMonths) * 100 : 0;

              return (
                <div key={student.id} className="p-4 hover:bg-primary/5 transition-colors active:bg-primary/10">
                  {/* Top row: Avatar + Name + Course */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                        {student.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-card-foreground text-sm truncate">{student.fullName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <GraduationCap className="w-3 h-3 text-primary flex-shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">{student.course}</span>
                          {student.batch && (
                            <>
                              <span className="text-muted-foreground/40">•</span>
                              <span className="text-xs text-muted-foreground">{student.batch}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Middle row: Fees + Progress */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Fees</p>
                      <p className="text-sm font-bold text-card-foreground">{formatCurrency(student.feesAmount)}</p>
                    </div>
                    {totalMonths > 0 && (
                      <div className="flex-1 max-w-[160px]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{paidCount}/{totalMonths}</span>
                          <span className={`font-bold ${progressPercent === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {Math.round(progressPercent)}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-accent'}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile number */}
                  {student.mobile && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <a href={`tel:${student.mobile}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                        {student.mobile}
                      </a>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewAnalytics(student)}
                      className="flex-1 min-h-[40px] text-xs gap-1.5 rounded-xl"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                      Analytics
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewPayments(student)}
                      className="flex-1 min-h-[40px] text-xs gap-1.5 rounded-xl"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-violet-600" />
                      Payments
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(student)}
                      className="min-h-[40px] min-w-[40px] rounded-xl px-2"
                    >
                      <Pencil className="w-3.5 h-3.5 text-primary" />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(student)}
                        className="min-h-[40px] min-w-[40px] rounded-xl px-2 border-destructive/30 hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 border-b-2 border-border">
                  <TableHead className="w-14 font-bold text-card-foreground">#</TableHead>
                  <TableHead className="font-bold text-card-foreground">Name</TableHead>
                  <TableHead className="font-bold text-card-foreground">Course</TableHead>
                  <TableHead className="font-bold text-card-foreground">Batch</TableHead>
                  <TableHead className="font-bold text-card-foreground">Fees</TableHead>
                  <TableHead className="font-bold text-card-foreground">Payment Progress</TableHead>
                  <TableHead className="font-bold text-card-foreground">Mobile</TableHead>
                  <TableHead className="text-right font-bold text-card-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => {
                  const payments = student.monthlyPayments || [];
                  const paidCount = payments.filter(p => p.isPaid).length;
                  const totalMonths = payments.length;
                  const progressPercent = totalMonths > 0 ? (paidCount / totalMonths) * 100 : 0;
                  
                  return (
                    <TableRow 
                      key={student.id} 
                      className="hover:bg-primary/5 transition-colors group border-b border-border/50"
                    >
                      <TableCell className="font-bold text-primary">
                        {String(index + 1).padStart(2, '0')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {student.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-card-foreground">{student.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground text-sm">{student.course}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.batch || '—'}
                      </TableCell>
                      <TableCell className="font-semibold text-card-foreground">
                        {formatCurrency(student.feesAmount)}
                      </TableCell>
                      <TableCell>
                        {totalMonths > 0 ? (
                          <div className="min-w-[120px]">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{paidCount}/{totalMonths} months</span>
                              <span className={`font-bold ${progressPercent === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {Math.round(progressPercent)}%
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-accent'}`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No schedule</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium">
                        {student.mobile || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewAnalytics(student)}
                            className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-500/15 rounded-xl transition-all hover:scale-105"
                            title="View Analytics"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewPayments(student)}
                            className="h-9 w-9 text-violet-600 hover:text-violet-700 hover:bg-violet-500/15 rounded-xl transition-all hover:scale-105"
                            title="View Payments"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(student)}
                            className="h-9 w-9 text-primary hover:text-primary hover:bg-primary/15 rounded-xl transition-all hover:scale-105"
                            title="Edit Student"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(student)}
                              className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/15 rounded-xl transition-all hover:scale-105"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div className="p-12 sm:p-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-4 sm:mb-5 animate-float">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-card-foreground font-display">
            No students found
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            {searchQuery || feesFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first student using the form above'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        studentName={studentToDelete?.fullName || ''}
      />
    </div>
  );
}
