import { useState } from 'react';
import { Student, FeesFilter } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Pencil, Trash2, Users, Filter, TableIcon, GraduationCap, CreditCard, BarChart3, Phone, AlertTriangle, SearchX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { SwipeableStudentCard } from './SwipeableStudentCard';
import { getCourseColors, getInitials } from '@/utils/courseColors';
import { EmptyState } from './EmptyState';

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
          {/* Mobile Card View with Swipe Gestures */}
          <div className="md:hidden divide-y divide-border">
            {students.map((student, index) => (
              <SwipeableStudentCard
                key={student.id}
                student={student}
                index={index}
                onEdit={onEdit}
                onDelete={handleDeleteClick}
                onViewPayments={onViewPayments}
                onViewAnalytics={onViewAnalytics}
                isAdmin={isAdmin}
                formatCurrency={formatCurrency}
              />
            ))}
            {/* Swipe hint */}
            {students.length > 0 && (
              <div className="md:hidden px-4 py-2 bg-muted/30">
                <p className="text-[10px] text-muted-foreground text-center">
                  ← Swipe left on a card for quick actions
                </p>
              </div>
            )}
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
                  
                  const now = new Date();
                  const overduePayments = payments.filter(p => !p.isPaid && (p.year < now.getFullYear() || (p.year === now.getFullYear() && p.month < now.getMonth())));
                  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  
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
                          {(() => {
                            const colors = getCourseColors(student.course);
                            return (
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${colors.avatar} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                {getInitials(student.fullName)}
                              </div>
                            );
                          })()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-card-foreground">{student.fullName}</span>
                              {overduePayments.length > 0 && (
                                <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            {overduePayments.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {overduePayments.slice(0, 4).map((p, i) => (
                                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-rose-500/12 text-rose-500 border border-rose-500/15">
                                    {MONTH_NAMES[p.month]}
                                  </span>
                                ))}
                                {overduePayments.length > 4 && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">+{overduePayments.length - 4}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const colors = getCourseColors(student.course);
                          return (
                            <div className="flex items-center gap-2">
                              <GraduationCap className={`w-4 h-4 ${colors.text}`} />
                              <Badge variant="outline" className={`text-xs border ${colors.badge}`}>
                                {student.course}
                              </Badge>
                            </div>
                          );
                        })()}
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
        <EmptyState
          icon={searchQuery || feesFilter !== 'all' 
            ? <SearchX className="w-10 h-10" /> 
            : <Users className="w-10 h-10" />
          }
          title={searchQuery || feesFilter !== 'all' ? 'No results found' : 'No students yet'}
          description={
            searchQuery || feesFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first student using the form above'
          }
          variant={searchQuery || feesFilter !== 'all' ? 'search' : 'students'}
        />
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
