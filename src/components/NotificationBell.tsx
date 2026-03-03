import { useState, useMemo } from 'react';
import { Bell, AlertTriangle, ChevronRight, IndianRupee } from 'lucide-react';
import { Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { hapticLight } from '@/utils/haptics';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

interface PendingStudent {
  student: Student;
  overdueMonths: { month: number; year: number; amount: number }[];
  totalPending: number;
}

interface NotificationBellProps {
  students: Student[];
  onViewPayments: (student: Student) => void;
}

export function NotificationBell({ students, onViewPayments }: NotificationBellProps) {
  const [open, setOpen] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const isOverdue = (month: number, year: number) => {
    return year < currentYear || (year === currentYear && month < currentMonth);
  };

  const pendingStudents = useMemo<PendingStudent[]>(() => {
    return students
      .map(student => {
        const overdueMonths = (student.monthlyPayments || [])
          .filter(p => !p.isPaid && isOverdue(p.month, p.year))
          .map(p => ({ month: p.month, year: p.year, amount: p.amount }));
        const totalPending = overdueMonths.reduce((sum, p) => sum + p.amount, 0);
        return { student, overdueMonths, totalPending };
      })
      .filter(s => s.overdueMonths.length > 0)
      .sort((a, b) => b.totalPending - a.totalPending);
  }, [students, currentMonth, currentYear]);

  const totalPendingAmount = pendingStudents.reduce((sum, s) => sum + s.totalPending, 0);
  const overdueCount = pendingStudents.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleStudentClick = (student: Student) => {
    hapticLight();
    onViewPayments(student);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => hapticLight()}
          className="relative w-10 h-10 bg-white/12 hover:bg-white/20 rounded-xl backdrop-blur-md border border-white/20 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/30"
        >
          <Bell className="w-[18px] h-[18px]" />
          {overdueCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse shadow-lg shadow-rose-500/40">
              {overdueCount > 99 ? '99+' : overdueCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[340px] sm:w-[380px] p-0 rounded-2xl shadow-2xl border-border/50 overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-rose-500/8 to-amber-500/8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500/15 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-card-foreground">Overdue Fees</h4>
                <p className="text-[11px] text-muted-foreground">
                  {overdueCount} student{overdueCount !== 1 ? 's' : ''} with overdue payments
                </p>
              </div>
            </div>
            {overdueCount > 0 && (
              <div className="text-right">
                <p className="text-sm font-bold text-rose-500">{formatCurrency(totalPendingAmount)}</p>
                <p className="text-[10px] text-muted-foreground">Total overdue</p>
              </div>
            )}
          </div>
        </div>

        {/* Student List */}
        {overdueCount === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <Bell className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-card-foreground">All clear!</p>
            <p className="text-xs text-muted-foreground mt-1">No overdue payments right now</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[320px]">
            <div className="divide-y divide-border">
              {pendingStudents.map(({ student, overdueMonths, totalPending }) => (
                <button
                  key={student.id}
                  onClick={() => handleStudentClick(student)}
                  className="w-full px-4 py-3 hover:bg-muted/40 transition-colors text-left flex items-center gap-3 active:bg-muted/60"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
                    {student.fullName.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-card-foreground truncate">
                      {student.fullName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{student.course}</p>
                    {/* Month pills */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {overdueMonths.slice(0, 3).map((p, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-rose-500/12 text-rose-500 border border-rose-500/15"
                        >
                          {MONTH_NAMES[p.month]} {p.year.toString().slice(2)}
                        </span>
                      ))}
                      {overdueMonths.length > 3 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                          +{overdueMonths.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount + Arrow */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-bold text-rose-500">{formatCurrency(totalPending)}</p>
                      <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 mt-0.5">
                        {overdueMonths.length}mo overdue
                      </Badge>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
