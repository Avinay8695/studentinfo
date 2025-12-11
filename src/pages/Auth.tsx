import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Mail, Lock, User, LogIn, UserPlus, Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().trim().email('Invalid email address').max(255, 'Email too long');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long');
const nameSchema = z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long');

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, loading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    try {
      emailSchema.parse(formData.email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(formData.password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    if (!isLogin && formData.fullName) {
      try {
        nameSchema.parse(formData.fullName);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.fullName = e.errors[0].message;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setFormLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
          return;
        }
        
        toast.success('Welcome back!');
        navigate('/', { replace: true });
      } else {
        const { data, error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please login instead.');
          } else {
            toast.error(error.message);
          }
          return;
        }

        if (data.user && !data.session) {
          toast.success('Account created! Please check your email to verify your account.');
        } else {
          toast.success('Account created successfully!');
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pattern-dots pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-2xl mb-4 animate-float">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold font-display gradient-text mb-2">
              Student Management
            </h1>
            <p className="text-muted-foreground">
              Computer Training Institute
            </p>
          </div>

          {/* Auth Card */}
          <div className="card-elevated p-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              {isLogin ? (
                <LogIn className="w-5 h-5 text-primary" />
              ) : (
                <UserPlus className="w-5 h-5 text-accent" />
              )}
              <h2 className="text-xl font-semibold font-display">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name - Only for signup */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className={`pl-10 input-focus ${errors.fullName ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@example.com"
                    className={`pl-10 input-focus ${errors.email ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className={`pl-10 pr-10 input-focus ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full btn-glow font-semibold"
                disabled={formLoading}
              >
                {formLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isLogin ? (
                  <LogIn className="w-4 h-4 mr-2" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                {isLogin ? 'Create one now' : 'Sign in instead'}
              </button>
            </div>
          </div>

          {/* Info Note */}
          <p className="text-xs text-center text-muted-foreground mt-6">
            First user to sign up will be assigned as Admin
          </p>
        </div>
      </div>
    </div>
  );
}
