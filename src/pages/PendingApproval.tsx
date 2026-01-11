import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogOut, Mail, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export default function PendingApproval() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, isApproved, signOut, refreshApprovalStatus } = useAuth();
  const [checking, setChecking] = useState(false);
  const [autoChecking, setAutoChecking] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  // Redirect to dashboard if already approved
  useEffect(() => {
    if (!loading && isAuthenticated && isApproved === true) {
      navigate('/', { replace: true });
    }
  }, [loading, isAuthenticated, isApproved, navigate]);

  // Auto-check approval status every 5 seconds
  const autoCheckStatus = useCallback(async () => {
    if (autoChecking) return;
    
    setAutoChecking(true);
    try {
      const approved = await refreshApprovalStatus();
      if (approved) {
        toast.success('Your account has been approved!');
        navigate('/', { replace: true });
      }
    } catch {
      // Silent fail for auto-check
    } finally {
      setAutoChecking(false);
    }
  }, [refreshApprovalStatus, navigate, autoChecking]);

  useEffect(() => {
    // Only start polling if user is authenticated and not approved
    if (!loading && isAuthenticated && isApproved === false) {
      const interval = setInterval(autoCheckStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [loading, isAuthenticated, isApproved, autoCheckStatus]);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const approved = await refreshApprovalStatus();
      if (approved) {
        toast.success('Your account has been approved!');
        navigate('/', { replace: true });
      } else {
        toast.info('Your account is still pending approval.');
      }
    } catch {
      toast.error('Failed to check status');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  // Don't render anything while loading or if not authenticated
  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative backdrop-blur-sm border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-4 bg-amber-500/10 rounded-full w-fit">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Approval Pending</CardTitle>
          <CardDescription className="text-base">
            Your account is awaiting admin approval. You'll get access once an administrator approves your registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-check indicator */}
          <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${autoChecking ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
            Auto-checking every 5 seconds...
          </div>

          {/* User info */}
          <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Logged in as</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={handleCheckStatus} 
              className="w-full"
              disabled={checking}
            >
              {checking ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Check Now
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Help text */}
          <p className="text-xs text-center text-muted-foreground pt-2">
            Contact the administrator if you need immediate access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
