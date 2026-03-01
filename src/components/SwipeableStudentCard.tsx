import { useRef, useState, useCallback } from 'react';
import { Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, GraduationCap, BarChart3, CreditCard, Phone } from 'lucide-react';
import { hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics';

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
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 70;
  const MAX_SWIPE = isAdmin ? 140 : 70;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = null;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;

    const diffX = e.touches[0].clientX - startX.current;
    const diffY = e.touches[0].clientY - startY.current;

    // Determine direction on first significant move
    if (isHorizontal.current === null && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
      isHorizontal.current = Math.abs(diffX) > Math.abs(diffY);
    }

    if (!isHorizontal.current) return;

    // Only allow swiping left (negative)
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

  const closeSwipe = useCallback(() => {
    setSwipeX(0);
  }, []);

  const payments = student.monthlyPayments || [];
  const paidCount = payments.filter(p => p.isPaid).length;
  const totalMonths = payments.length;
  const progressPercent = totalMonths > 0 ? (paidCount / totalMonths) * 100 : 0;

  return (
    <div className="relative overflow-hidden" ref={cardRef}>
      {/* Background actions (revealed on swipe) */}
      <div className="absolute inset-y-0 right-0 flex items-stretch z-0">
        <button
          onClick={() => { hapticLight(); onEdit(student); closeSwipe(); }}
          className="flex items-center justify-center w-[70px] bg-primary text-primary-foreground active:opacity-80 transition-opacity"
          aria-label="Edit"
        >
          <div className="flex flex-col items-center gap-1">
            <Pencil className="w-4 h-4" />
            <span className="text-[10px] font-medium">Edit</span>
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
              <span className="text-[10px] font-medium">Delete</span>
            </div>
          </button>
        )}
      </div>

      {/* Foreground card */}
      <div
        className={`relative z-10 bg-card p-4 ${!isSwiping ? 'transition-transform duration-300 ease-out' : ''}`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
            onClick={() => { hapticLight(); onViewAnalytics(student); }}
            className="flex-1 min-h-[40px] text-xs gap-1.5 rounded-xl"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            Analytics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { hapticLight(); onViewPayments(student); }}
            className="flex-1 min-h-[40px] text-xs gap-1.5 rounded-xl"
          >
            <CreditCard className="w-3.5 h-3.5 text-violet-600" />
            Payments
          </Button>
        </div>

        {/* Swipe hint indicator */}
        {swipeX === 0 && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-muted-foreground/15" />
        )}
      </div>
    </div>
  );
}
