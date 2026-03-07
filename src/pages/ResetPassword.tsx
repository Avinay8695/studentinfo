import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import logoImage from '@/assets/logo-success-desirous.jpg';

const passwordSchema = z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long');

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkRecoveryState = async () => {
      const hash = window.location.hash;
      const search = window.location.search;

      const hasRecoveryToken =
        hash.includes('type=recovery') ||
        hash.includes('access_token=') ||
        search.includes('type=recovery') ||
        search.includes('access_token=');

      if (hasRecoveryToken) {
        setIsRecovery(true);
        return;
      }

      // Fallback: if recovery has already established a session before component mounted
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsRecovery(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setIsRecovery(true);
      }
    });

    checkRecoveryState();

    return () => subscription.unsubscribe();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
        return;
      }

      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => navigate('/auth', { replace: true }), 2500);
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/30 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-8 text-center">
            <ShieldCheck className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Invalid Reset Link</h1>
            <p className="text-white/60 text-sm mb-6">
              This link has expired or is invalid. Please request a new password reset.
            </p>
            <Button
              onClick={() => navigate('/auth', { replace: true })}
              className="w-full min-h-[48px] font-semibold bg-primary hover:bg-primary/90 rounded-xl"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/30 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[140px] animate-float" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(90deg, white 1px, transparent 1px), linear-gradient(white 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-scale-in">
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-primary/40 rounded-2xl blur-xl animate-pulse-slow" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-white/30 shadow-2xl mx-auto">
                <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>

            {success ? (
              <>
                <div className="flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Password Updated!</h1>
                <p className="text-white/60 text-sm">Redirecting you to sign in...</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Reset Password</h1>
                <p className="text-white/60 text-sm">Enter your new password below</p>
              </>
            )}
          </div>

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium text-white/80">
                  New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className={`pl-10 pr-10 min-h-[48px] bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:bg-white/10 transition-all rounded-xl ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-white/80">
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className={`pl-10 min-h-[48px] bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:bg-white/10 transition-all rounded-xl ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                className="w-full min-h-[48px] font-semibold text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
