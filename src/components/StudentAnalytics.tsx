import { Student } from '@/types/student';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  Calendar, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Phone,
  User,
  BarChart3
} from 'lucide-react';
import { format, differenceInMonths, differenceInDays, addMonths } from 'date-fns';

interface StudentAnalyticsProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function StudentAnalytics({ student, isOpen, onClose }: StudentAnalyticsProps) {
  if (!student) return null;

  const payments = student.monthlyPayments || [];
  const paidPayments = payments.filter(p => p.isPaid);
  const unpaidPayments = payments.filter(p => !p.isPaid);
  
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = unpaidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  
  const paymentProgress = payments.length > 0 ? (paidPayments.length / payments.length) * 100 : 0;
  const amountProgress = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

  const enrollmentDate = new Date(student.enrollmentDate);
  const courseDuration = student.courseDuration || 1; // Fallback to 1 to prevent division by zero
  const expectedEndDate = addMonths(enrollmentDate, courseDuration);
  const today = new Date();
  
  const courseCompleted = today >= expectedEndDate;
  const daysRemaining = courseCompleted ? 0 : differenceInDays(expectedEndDate, today);
  const monthsCompleted = Math.min(differenceInMonths(today, enrollmentDate), courseDuration);
  const courseProgress = (monthsCompleted / courseDuration) * 100;

  // Find next due payment
  const nextDuePayment = unpaidPayments[0];
  
  // Calculate payment regularity (percentage of on-time payments)
  const paymentRegularity = paidPayments.length > 0 
    ? Math.round((paidPayments.length / Math.max(monthsCompleted, 1)) * 100)
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-display">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            Student Analytics
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed analytics for {student.fullName}
          </DialogDescription>
        </DialogHeader>

        {/* Student Profile Card */}
        <Card className="p-5 bg-gradient-to-r from-primary/5 to-accent/5 border-border/50">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {student.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-card-foreground">{student.fullName}</h3>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  {student.course}
                </span>
                {student.batch && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" />
                    Batch: {student.batch}
                  </span>
                )}
                {student.mobile && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-primary" />
                    {student.mobile}
                  </span>
                )}
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              student.feesStatus === 'paid' 
                ? 'bg-emerald-500/10 text-emerald-600' 
                : 'bg-amber-500/10 text-amber-600'
            }`}>
              {student.feesStatus === 'paid' ? 'Fully Paid' : 'Payment Pending'}
            </div>
          </div>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{paidPayments.length}</p>
            <p className="text-xs text-muted-foreground">Months Paid</p>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{unpaidPayments.length}</p>
            <p className="text-xs text-muted-foreground">Months Pending</p>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{Math.min(paymentRegularity, 100)}%</p>
            <p className="text-xs text-muted-foreground">Payment Rate</p>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{courseCompleted ? '✓' : daysRemaining}</p>
            <p className="text-xs text-muted-foreground">{courseCompleted ? 'Completed' : 'Days Left'}</p>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card className="p-5">
          <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-primary" />
            Financial Summary
          </h4>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Total Fees</p>
              <p className="text-lg font-bold text-card-foreground">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Amount Paid</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
              <p className="text-lg font-bold text-rose-600">{formatCurrency(totalPending)}</p>
            </div>
          </div>

          {/* Amount Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Progress</span>
              <span className="font-semibold text-primary">{Math.round(amountProgress)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${amountProgress}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Course Progress */}
        <Card className="p-5">
          <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Course Timeline
          </h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Enrollment Date</p>
              <p className="font-semibold text-card-foreground">
                {format(enrollmentDate, 'dd MMM yyyy')}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Expected End Date</p>
              <p className="font-semibold text-card-foreground">
                {format(expectedEndDate, 'dd MMM yyyy')}
              </p>
            </div>
          </div>

          {/* Course Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {monthsCompleted} of {student.courseDuration} months
              </span>
              <span className="font-semibold text-primary">{Math.round(courseProgress)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${Math.min(courseProgress, 100)}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Payment Timeline */}
        <Card className="p-5">
          <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Payment Timeline
          </h4>
          
          {payments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {payments.map((payment, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    payment.isPaid
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground border border-dashed border-border'
                  }`}
                  title={`${MONTH_NAMES[payment.month]} ${payment.year} - ${formatCurrency(payment.amount)}`}
                >
                  {MONTH_NAMES[payment.month]} {payment.year.toString().slice(-2)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No payment schedule available
            </p>
          )}

          {nextDuePayment && (
            <div className="mt-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <p className="text-sm font-medium text-amber-700">
                Next Due: {MONTH_NAMES[nextDuePayment.month]} {nextDuePayment.year} - {formatCurrency(nextDuePayment.amount)}
              </p>
            </div>
          )}
        </Card>
      </DialogContent>
    </Dialog>
  );
}
