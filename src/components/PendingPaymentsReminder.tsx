import { useState } from 'react';
import { Student } from '@/types/student';
import { AlertTriangle, IndianRupee, ChevronRight, Bell, Calendar, User, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

interface PendingStudent {
  student: Student;
  pendingMonths: { month: number; year: number; amount: number }[];
  totalPending: number;
}

interface PendingPaymentsReminderProps {
  students: Student[];
  onViewPayments: (student: Student) => void;
}

export function PendingPaymentsReminder({ students, onViewPayments }: PendingPaymentsReminderProps) {
  const [showAll, setShowAll] = useState(false);

  // Get current month/year for highlighting overdue
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate pending payments per student
  const pendingStudents: PendingStudent[] = students
    .map(student => {
      const pendingMonths = (student.monthlyPayments || [])
        .filter(p => !p.isPaid)
        .map(p => ({ month: p.month, year: p.year, amount: p.amount }));
      const totalPending = pendingMonths.reduce((sum, p) => sum + p.amount, 0);
      return { student, pendingMonths, totalPending };
    })
    .filter(s => s.pendingMonths.length > 0)
    .sort((a, b) => b.totalPending - a.totalPending);

  if (pendingStudents.length === 0) return null;

  const totalPendingAmount = pendingStudents.reduce((sum, s) => sum + s.totalPending, 0);
  const displayStudents = showAll ? pendingStudents : pendingStudents.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isOverdue = (month: number, year: number) => {
    return year < currentYear || (year === currentYear && month < currentMonth);
  };

  return (
    <div className="card-elevated animate-fade-in overflow-hidden" style={{ animationDelay: '0.15s' }}>
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 dark:from-rose-500/15 dark:via-amber-500/15 dark:to-rose-500/15 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 bg-rose-500/15 dark:bg-rose-500/25 rounded-xl">
                <Bell className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {pendingStudents.length}
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-card-foreground font-display">
                Fee Reminders
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {pendingStudents.length} student{pendingStudents.length !== 1 ? 's' : ''} with pending fees
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(totalPendingAmount)}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Pending</p>
          </div>
        </div>
      </div>

      {/* Student Cards */}
      <div className="divide-y divide-border">
        {displayStudents.map(({ student, pendingMonths, totalPending }) => {
          const overdueCount = pendingMonths.filter(p => isOverdue(p.month, p.year)).length;
          
          return (
            <div
              key={student.id}
              className="p-3 sm:p-4 hover:bg-muted/30 transition-colors cursor-pointer active:bg-muted/50"
              onClick={() => onViewPayments(student)}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                  {student.fullName.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-card-foreground truncate">
                      {student.fullName}
                    </p>
                    {overdueCount > 0 && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0">
                        <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                        {overdueCount} overdue
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{student.course}</p>
                  
                  {/* Pending months pills */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {pendingMonths.slice(0, 4).map((p, i) => (
                      <span
                        key={i}
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          isOverdue(p.month, p.year)
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {MONTH_NAMES[p.month]} {p.year.toString().slice(2)}
                      </span>
                    ))}
                    {pendingMonths.length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        +{pendingMonths.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount & Arrow */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(totalPending)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {pendingMonths.length} month{pendingMonths.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More */}
      {pendingStudents.length > 5 && (
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full text-sm text-primary hover:text-primary"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `View All ${pendingStudents.length} Students`}
          </Button>
        </div>
      )}
    </div>
  );
}
