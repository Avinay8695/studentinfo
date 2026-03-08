import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().trim().email('Invalid email address').max(255, 'Email too long');
const PASSWORD_RESET_REDIRECT_URL = import.meta.env.VITE_PASSWORD_RESET_REDIRECT_URL?.trim() || 'https://studentinfo.lovable.app/reset-password';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setLoading(true);
    try {
      // Check if email is registered
      const { data: emailExists } = await supabase.rpc('check_email_exists', { _email: email });
      if (!emailExists) {
        setError('यह email registered नहीं है। पहले Sign Up करें।');
        setLoading(false);
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: PASSWORD_RESET_REDIRECT_URL,
      });

      if (resetError) {
        toast.error(resetError.message);
        return;
      }

      setSent(true);
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setEmail('');
      setSent(false);
      setError('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-900/95 backdrop-blur-xl border-white/10 text-white rounded-2xl">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold text-white text-center">Check Your Email</DialogTitle>
              <DialogDescription className="text-white/60 text-center mt-2">
                We've sent a password reset link to <span className="text-white/80 font-medium">{email}</span>. 
                Check your inbox and spam folder.
              </DialogDescription>
            </DialogHeader>
            <Button
              onClick={handleClose}
              variant="outline"
              className="min-h-[44px] border-white/20 text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Forgot Password?</DialogTitle>
              <DialogDescription className="text-white/60">
                Enter your email and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium text-white/80">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    autoFocus
                    className={`pl-10 min-h-[48px] bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:bg-white/10 transition-all rounded-xl ${error ? 'border-destructive' : ''}`}
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 min-h-[44px] border-white/20 text-white hover:bg-white/10 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 min-h-[48px] font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 rounded-xl"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Link'}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
