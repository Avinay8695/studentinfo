import { useState, useMemo, useEffect, useCallback } from 'react';
import { Bell, AlertTriangle, ChevronRight, TrendingUp, CheckCircle2, Clock, X } from 'lucide-react';
import { Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { hapticLight, hapticMedium } from '@/utils/haptics';

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
  scrolled?: boolean;
}

export function NotificationBell({ students, onViewPayments }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [lastReadHash, setLastReadHash] = useState<string>(() => {
    return localStorage.getItem('notifications_read_hash') || '';
  });

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
  const totalOverdueMonths = pendingStudents.reduce((sum, s) => sum + s.overdueMonths.length, 0);

  // Generate a hash of current overdue state to track "read" status
  const currentHash = useMemo(() => {
    if (overdueCount === 0) return 'clear';
    const ids = pendingStudents.map(s => `${s.student.id}:${s.overdueMonths.length}`).join(',');
    return `${overdueCount}-${ids}`;
  }, [pendingStudents, overdueCount]);

  const hasUnread = currentHash !== lastReadHash && overdueCount > 0;

  // Mark as read when popover opens
  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && hasUnread) {
      hapticMedium();
      setLastReadHash(currentHash);
      localStorage.setItem('notifications_read_hash', currentHash);
    }
  }, [hasUnread, currentHash]);

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

  const getSeverity = (months: number) => {
    if (months >= 3) return 'critical';
    if (months >= 2) return 'warning';
    return 'mild';
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => hapticLight()}
          className="relative w-10 h-10 bg-white/12 hover:bg-white/20 rounded-xl backdrop-blur-md border border-white/20 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/30 group"
        >
          <Bell className={`w-[18px] h-[18px] transition-transform duration-300 ${open ? 'scale-110' : 'group-hover:scale-105'}`} />
          {/* Unread indicator dot */}
          {hasUnread && overdueCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center">
              <span className="absolute w-4 h-4 rounded-full bg-rose-500/40 animate-ping" />
              <span className="relative min-w-[18px] h-[18px] bg-gradient-to-br from-rose-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-rose-500/50">
                {overdueCount > 99 ? '99+' : overdueCount}
              </span>
            </span>
          )}
          {/* Read state - subtle dot only */}
          {!hasUnread && overdueCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500/60 rounded-full border border-white/30" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[360px] sm:w-[400px] p-0 rounded-2xl shadow-2xl border-border/30 overflow-hidden bg-popover/95 backdrop-blur-xl"
        sideOffset={12}
      >
        {/* Premium Header */}
        <div className="relative px-5 py-4 border-b border-border/30">
          {/* Subtle gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`p-2 rounded-xl ${overdueCount > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                  {overdueCount > 0 ? (
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
                  ) : (
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground tracking-tight">Notifications</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {overdueCount > 0
                    ? `${overdueCount} student${overdueCount !== 1 ? 's' : ''} need attention`
                    : 'Everything looks good'
                  }
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-muted/60 text-muted-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Summary Stats Bar */}
          {overdueCount > 0 && (
            <div className="flex items-center gap-3 mt-3 p-2.5 rounded-xl bg-muted/40 border border-border/30">
              <div className="flex-1 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Total Overdue</p>
                  <p className="text-sm font-bold text-rose-500">{formatCurrency(totalPendingAmount)}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-border/50" />
              <div className="flex-1 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Months Due</p>
                  <p className="text-sm font-bold text-foreground">{totalOverdueMonths}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Student List */}
        {overdueCount === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-foreground">All payments up to date</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
              No overdue fees found. Great job keeping everything on track!
            </p>
          </div>
        ) : (
          <>
            <div className="px-4 py-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Overdue Students</p>
              <p className="text-[10px] text-muted-foreground">{overdueCount} total</p>
            </div>
            <ScrollArea className="max-h-[300px]">
              <div className="px-2 pb-2 space-y-1">
                {pendingStudents.map(({ student, overdueMonths, totalPending }) => {
                  const severity = getSeverity(overdueMonths.length);
                  return (
                    <button
                      key={student.id}
                      onClick={() => handleStudentClick(student)}
                      className="w-full px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-all duration-200 text-left flex items-center gap-3 active:scale-[0.98] group/item"
                    >
                      {/* Avatar with severity indicator */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ${
                          severity === 'critical' 
                            ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/25' 
                            : severity === 'warning'
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-500/25'
                        }`}>
                          {student.fullName.charAt(0).toUpperCase()}
                        </div>
                        {/* Severity dot */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-popover ${
                          severity === 'critical' ? 'bg-rose-500' : 
                          severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {student.fullName}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{student.course}</p>
                        {/* Month pills */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {overdueMonths.slice(0, 4).map((p, i) => (
                            <span
                              key={i}
                              className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold ${
                                severity === 'critical' 
                                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/15' 
                                  : severity === 'warning'
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                                  : 'bg-blue-500/10 text-blue-500 border border-blue-500/15'
                              }`}
                            >
                              {MONTH_NAMES[p.month]}'{p.year.toString().slice(2)}
                            </span>
                          ))}
                          {overdueMonths.length > 4 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold border border-border/50">
                              +{overdueMonths.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount + Arrow */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <div className="text-right">
                          <p className={`text-xs font-bold ${
                            severity === 'critical' ? 'text-rose-500' :
                            severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                          }`}>
                            {formatCurrency(totalPending)}
                          </p>
                          <p className={`text-[9px] font-semibold mt-0.5 px-1.5 py-0.5 rounded-md inline-block ${
                            severity === 'critical' 
                              ? 'bg-rose-500/10 text-rose-400' 
                              : severity === 'warning'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {overdueMonths.length}mo late
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
