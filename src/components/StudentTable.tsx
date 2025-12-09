import { Student, FeesFilter } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Pencil, Trash2, Users, Filter, TableIcon, GraduationCap, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface StudentTableProps {
  students: Student[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  feesFilter: FeesFilter;
  onFilterChange: (filter: FeesFilter) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  onViewPayments: (student: Student) => void;
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
}: StudentTableProps) {
  const handleDelete = (student: Student) => {
    if (window.confirm(`Are you sure you want to delete "${student.fullName}"?`)) {
      onDelete(student.id);
      toast.success('Student deleted successfully');
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
      <div className="p-5 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <TableIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground font-display">Student Records</h3>
              <p className="text-sm text-muted-foreground">{students.length} student{students.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or course..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 input-focus bg-background/80"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <Select value={feesFilter} onValueChange={(value: FeesFilter) => onFilterChange(value)}>
              <SelectTrigger className="w-full sm:w-48 input-focus bg-background/80">
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

      {/* Table */}
      {students.length > 0 ? (
        <div className="overflow-x-auto">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(student)}
                          className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/15 rounded-xl transition-all hover:scale-105"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-5 animate-float">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <p className="text-xl font-bold text-card-foreground font-display">
            No students found
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            {searchQuery || feesFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first student using the form above'}
          </p>
        </div>
      )}
    </div>
  );
}
