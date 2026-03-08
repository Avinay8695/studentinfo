import { useRef, useState, useCallback } from 'react';
import { Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, GraduationCap, BarChart3, CreditCard, Phone, AlertTriangle, ChevronLeft, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface SwipeableStudentCardProps {
  student: Student;
  index: number;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onViewPayments: (student: Student) => void;
  onViewAnalytics: (student: Student) => void;
  isAdmin: boolean;
  formatCurrency: (amount: number) => string;
}

export function SwipeableStudentCard({
  student,
  index,
  onEdit,
  onDelete,
  onViewPayments,
  onViewAnalytics,
  isAdmin,
  formatCurrency,
}: SwipeableStudentCardProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);
  const hasMoved = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 70;
  const MAX_SWIPE = isAdmin ? 140 : 70;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = null;
    hasMoved.current = false;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    const diffX = e.touches[0].clientX - startX.current;
    const diffY = e.touches[0].clientY - startY.current;
    if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
      hasMoved.current = true;
    }
    if (isHorizontal.current === null && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
      isHorizontal.current = Math.abs(diffX) > Math.abs(diffY);
    }
    if (!isHorizontal.current) return;
    const clampedX = Math.max(-MAX_SWIPE, Math.min(0, diffX));
    setSwipeX(clampedX);
  }, [isSwiping, MAX_SWIPE]);

  const handleTouchEnd = useCallback(() => {
    setIsSwiping(false);
    isHorizontal.current = null;
    if (swipeX < -SWIPE_THRESHOLD) {
      setSwipeX(-MAX_SWIPE);
      hapticMedium();
    } else {
      setSwipeX(0);
    }
  }, [swipeX, MAX_SWIPE]);

  const closeSwipe = useCallback(() => setSwipeX(0), []);

  const handleCardTap = useCallback(() => {
    if (hasMoved.current) return;
    if (swipeX !== 0) {
      setSwipeX(0);
      return;
    }
    hapticLight();
    setIsExpanded(prev => !prev);
  }, [swipeX]);

  const payments = student.monthlyPayments || [];
  const paidCount = payments.filter(p => p.isPaid).length;
  const totalMonths = payments.length;
  const progressPercent = totalMonths > 0 ? (paidCount / totalMonths) * 100 : 0;

  const now = new Date();
  const overduePayments = payments.filter(p => !p.isPaid && (p.year < now.getFullYear() || (p.year === now.getFullYear() && p.month < now.getMonth())));
  const hasOverdue = overduePayments.length > 0;
  const overdueSeverity = overduePayments.length >= 3 ? 'critical' : overduePayments.length === 2 ? 'warning' : 'mild';
  const severityColors = {
    mild: { badge: 'bg-blue-500/90 text-white border-blue-400/30 shadow-blue-500/30', avatar: 'from-blue-500 to-blue-600 shadow-blue-500/20', dot: 'bg-blue-500', pill: 'bg-blue-500/10 text-blue-500 border-blue-500/15' },
    warning: { badge: 'bg-amber-500/90 text-white border-amber-400/30 shadow-amber-500/30', avatar: 'from-amber-500 to-orange-500 shadow-amber-500/20', dot: 'bg-amber-500', pill: 'bg-amber-500/10 text-amber-500 border-amber-500/15' },
    critical: { badge: 'bg-rose-500/90 text-white border-rose-400/30 shadow-rose-500/30', avatar: 'from-rose-500 to-red-600 shadow-rose-500/20', dot: 'bg-rose-500', pill: 'bg-rose-500/10 text-rose-500 border-rose-500/15' },
  };
  const sColors = hasOverdue ? severityColors[overdueSeverity] : null;

  return (
    <div className="relative overflow-hidden rounded-2xl" ref={cardRef}>
      {/* Background actions */}
      <div className="absolute inset-y-0 right-0 flex items-stretch z-0">
        <button
          onClick={() => { hapticLight(); onEdit(student); closeSwipe(); }}
          className="flex items-center justify-center w-[70px] bg-primary text-primary-foreground active:opacity-80 transition-opacity"
          aria-label="Edit"
        >
          <div className="flex flex-col items-center gap-1">
            <Pencil className="w-4 h-4" />
            <span className="text-[10px] font-semibold">Edit</span>
          </div>
        </button>
        {isAdmin && (
          <button
            onClick={() => { hapticHeavy(); onDelete(student); closeSwipe(); }}
            className="flex items-center justify-center w-[70px] bg-destructive text-destructive-foreground active:opacity-80 transition-opacity"
            aria-label="Delete"
          >
            <div className="flex flex-col items-center gap-1">
              <Trash2 className="w-4 h-4" />
              <span className="text-[10px] font-semibold">Delete</span>
            </div>
          </button>
        )}
      </div>

      {/* Foreground card */}
      <div
        className={`relative z-10 bg-card border border-border/50 rounded-2xl ${!isSwiping ? 'transition-transform duration-300 ease-out' : ''}`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardTap}
      >
        {/* Status indicator line */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl ${
          hasOverdue ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-transparent' :
          progressPercent === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
          'bg-gradient-to-r from-primary/50 to-transparent'
        }`} />

        {/* Collapsed header - always visible */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                  hasOverdue 
                    ? `bg-gradient-to-br ${sColors!.avatar}` 
                    : 'bg-gradient-to-br from-primary to-accent shadow-primary/20'
                }`}>
                  {student.fullName.charAt(0).toUpperCase()}
                </div>
                {hasOverdue && (
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${sColors!.dot} rounded-full border-2 border-card flex items-center justify-center`}>
                    <AlertTriangle className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-card-foreground text-sm truncate">{student.fullName}</p>
                  {hasOverdue && (
                    <Badge variant="destructive" className="text-[9px] px-2 py-0.5 h-4.5 gap-1 flex-shrink-0 font-extrabold animate-pulse shadow-sm shadow-destructive/30 border border-destructive/20">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {overduePayments.length} overdue
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <GraduationCap className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-[11px] text-muted-foreground truncate">{student.course}</span>
                  {student.batch && (
                    <>
                      <span className="text-muted-foreground/30">•</span>
                      <span className="text-[11px] text-muted-foreground">{student.batch}</span>
                    </>
                  )}
                </div>
                {/* Mini summary in collapsed state */}
                {!isExpanded && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-card-foreground">{formatCurrency(student.feesAmount)}</span>
                    {totalMonths > 0 && (
                      <>
                        <span className="text-muted-foreground/30">•</span>
                        <span className={`text-[10px] font-bold ${
                          progressPercent === 100 ? 'text-emerald-500' : progressPercent > 50 ? 'text-primary' : 'text-amber-500'
                        }`}>
                          {paidCount}/{totalMonths} paid
                        </span>
                        <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-accent'}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-bold text-muted-foreground/50 bg-muted/50 px-2 py-0.5 rounded-lg">
                #{String(index + 1).padStart(2, '0')}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        {/* Expandable content */}
        <div className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-4 space-y-3">
            {/* Overdue month pills */}
            {hasOverdue && (
              <div className="flex flex-wrap gap-1">
                {overduePayments.slice(0, 5).map((p, i) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 rounded-lg font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/15">
                    {MONTH_NAMES[p.month]}'{p.year.toString().slice(2)}
                  </span>
                ))}
                {overduePayments.length > 5 && (
                  <span className="text-[9px] px-2 py-0.5 rounded-lg bg-muted text-muted-foreground font-semibold border border-border/50">
                    +{overduePayments.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* Fees + Progress row */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/30 border border-border/30">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Total Fees</p>
                <p className="text-sm font-bold text-card-foreground">{formatCurrency(student.feesAmount)}</p>
              </div>
              {totalMonths > 0 && (
                <div className="flex-1 max-w-[140px]">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground font-medium">{paidCount}/{totalMonths} paid</span>
                    <span className={`font-bold ${
                      progressPercent === 100 ? 'text-emerald-500' : progressPercent > 50 ? 'text-primary' : 'text-amber-500'
                    }`}>
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progressPercent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-accent'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mobile number */}
            {student.mobile && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <a 
                  href={`tel:${student.mobile}`} 
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {student.mobile}
                </a>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); hapticLight(); onViewAnalytics(student); }}
                className="flex-1 min-h-[42px] text-xs gap-1.5 rounded-xl border-border/50 bg-muted/30 hover:bg-muted/60"
              >
                <BarChart3 className="w-3.5 h-3.5 text-primary" />
                Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); hapticLight(); onViewPayments(student); }}
                className={`flex-1 min-h-[42px] text-xs gap-1.5 rounded-xl border-border/50 ${
                  hasOverdue 
                    ? 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20 text-rose-500' 
                    : 'bg-muted/30 hover:bg-muted/60'
                }`}
              >
                <CreditCard className={`w-3.5 h-3.5 ${hasOverdue ? 'text-rose-500' : 'text-accent'}`} />
                Payments
              </Button>
            </div>
          </div>
        </div>

        {/* Swipe hint - only when collapsed */}
        {swipeX === 0 && !isExpanded && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-20">
            <ChevronLeft className="w-3 h-3 text-muted-foreground animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
