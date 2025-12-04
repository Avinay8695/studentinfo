import { Student, FeesFilter } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Pencil, Trash2, Users, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface StudentTableProps {
  students: Student[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  feesFilter: FeesFilter;
  onFilterChange: (filter: FeesFilter) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

export function StudentTable({
  students,
  searchQuery,
  onSearchChange,
  feesFilter,
  onFilterChange,
  onEdit,
  onDelete,
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
    <div className="card-elevated animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* Search and Filter Header */}
      <div className="p-5 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or course..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 input-focus"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <Select value={feesFilter} onValueChange={(value: FeesFilter) => onFilterChange(value)}>
              <SelectTrigger className="w-full sm:w-44 input-focus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="paid">Fees Paid</SelectItem>
                <SelectItem value="not_paid">Fees Pending</SelectItem>
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
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-14 font-semibold">#</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Course</TableHead>
                <TableHead className="font-semibold">Batch</TableHead>
                <TableHead className="font-semibold">Fees</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Mobile</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => (
                <TableRow 
                  key={student.id} 
                  className="hover:bg-muted/50 transition-colors group"
                >
                  <TableCell className="font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-card-foreground">
                    {student.fullName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.course}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.batch || '—'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(student.feesAmount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        student.feesStatus === 'paid'
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {student.feesStatus === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.mobile || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(student)}
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(student)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-card-foreground font-display">
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
