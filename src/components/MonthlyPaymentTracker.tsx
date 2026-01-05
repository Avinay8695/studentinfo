import { Student, MonthlyPayment } from '@/types/student';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, Calendar, IndianRupee, User, GraduationCap, Clock, Lock, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generateReceiptFromPayment } from '@/utils/generateReceipt';
interface MonthlyPaymentTrackerProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePayment: (studentId: string, paymentIndex: number, isPaid: boolean) => void;
  isAdmin?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MonthlyPaymentTracker({ 
  student, 
  isOpen, 
  onClose, 
  onUpdatePayment,
  isAdmin = false
}: MonthlyPaymentTrackerProps) {
  if (!student) return null;

  const payments = student.monthlyPayments || [];
  const paidCount = payments.filter(p => p.isPaid).length;
  const totalPaid = payments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => !p.isPaid).reduce((sum, p) => sum + p.amount, 0);
  
  const handleTogglePayment = (index: number, currentStatus: boolean) => {
    // If payment is already paid and user is not admin, prevent unpaid action
    if (currentStatus && !isAdmin) {
      toast.error('Only admins can mark payments as unpaid');
      return;
    }
    
    onUpdatePayment(student.id, index, !currentStatus);
    toast.success(!currentStatus ? 'Payment marked as paid' : 'Payment marked as pending');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-display">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            Monthly Payment Tracker
          </DialogTitle>
          <DialogDescription className="sr-only">
            Track and manage monthly payments for {student.fullName}
          </DialogDescription>
        </DialogHeader>
        
        {/* Student Info Card */}
        <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-border/50 mb-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {student.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-card-foreground">{student.fullName}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                {student.course}
              </p>
            </div>
          </div>
          
          {/* Payment Summary */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-3 bg-background rounded-lg text-center">
              <p className="text-2xl font-bold text-card-foreground">{paidCount}/{payments.length}</p>
              <p className="text-xs text-muted-foreground">Months Paid</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-muted-foreground">Total Paid</p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-lg text-center">
              <p className="text-lg font-bold text-rose-600">{formatCurrency(totalPending)}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        {/* Admin Notice for Users */}
        {!isAdmin && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-amber-700">Only admins can mark paid fees as unpaid</p>
          </div>
        )}

        {/* Monthly Payments Grid */}
        {payments.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Payment Schedule
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {payments.map((payment, index) => {
                const canToggle = !payment.isPaid || isAdmin;
                
                const handleDownloadReceipt = () => {
                  if (payment.isPaid && payment.paidDate) {
                    generateReceiptFromPayment(
                      student.fullName,
                      student.course,
                      student.batch,
                      payment.month,
                      payment.year,
                      payment.amount,
                      payment.paidDate
                    );
                  }
                };
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      payment.isPaid 
                        ? 'bg-emerald-500/5 border-emerald-500/30' 
                        : 'bg-rose-500/5 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-card-foreground">
                          {MONTH_NAMES[payment.month]} {payment.year}
                        </p>
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          {payment.amount}
                        </p>
                        {payment.isPaid && payment.paidDate && (
                          <p className="text-xs text-emerald-600 mt-1">
                            Paid on {format(new Date(payment.paidDate), 'dd MMM yyyy')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {payment.isPaid && payment.paidDate && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleDownloadReceipt}
                                  className="rounded-full w-9 h-9 p-0 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                                >
                                  <Receipt className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Download Receipt</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTogglePayment(index, payment.isPaid)}
                                disabled={payment.isPaid && !isAdmin}
                                className={`rounded-full w-10 h-10 p-0 ${
                                  payment.isPaid
                                    ? canToggle
                                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                      : 'bg-emerald-500/50 text-white cursor-not-allowed'
                                    : 'bg-rose-500/20 text-rose-600 hover:bg-rose-500/30'
                                }`}
                              >
                                {payment.isPaid ? (
                                  canToggle ? <Check className="w-5 h-5" /> : <Lock className="w-4 h-4" />
                                ) : (
                                  <X className="w-5 h-5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {payment.isPaid 
                                ? (canToggle ? 'Click to mark as unpaid' : 'Admin access required to mark as unpaid')
                                : 'Click to mark as paid'
                              }
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No payment schedule found</p>
            <p className="text-sm mt-1">Payment schedule will be generated based on course duration</p>
          </div>
        )}

        {/* Progress Bar */}
        {payments.length > 0 && (
          <div className="mt-4 p-4 bg-muted/30 rounded-xl">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Payment Progress</span>
              <span className="font-semibold text-primary">
                {Math.round((paidCount / payments.length) * 100)}%
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${(paidCount / payments.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
