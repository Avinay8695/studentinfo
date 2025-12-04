import { Student, FeesFilter } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Pencil, Trash2, Users } from 'lucide-react';
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
    <div className="bg-card rounded-lg shadow-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* Search and Filter Header */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or course..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={feesFilter} onValueChange={(value: FeesFilter) => onFilterChange(value)}>
            <SelectTrigger className="w-full sm:w-40">
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

      {/* Table */}
      {students.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => (
                <TableRow key={student.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{student.fullName}</TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell>{student.batch || '-'}</TableCell>
                  <TableCell>{formatCurrency(student.feesAmount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={student.feesStatus === 'paid' ? 'default' : 'destructive'}
                      className={
                        student.feesStatus === 'paid'
                          ? 'bg-success hover:bg-success/90'
                          : ''
                      }
                    >
                      {student.feesStatus === 'paid' ? 'Paid' : 'Not Paid'}
                    </Badge>
                  </TableCell>
                  <TableCell>{student.mobile || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
        <div className="p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No students found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {searchQuery || feesFilter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Add your first student using the form above'}
          </p>
        </div>
      )}
    </div>
  );
}
