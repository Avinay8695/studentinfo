import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogOut, Mail, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PendingApproval() {
  const navigate = useNavigate();
  const { user, signOut, refreshApprovalStatus } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const isApproved = await refreshApprovalStatus();
      if (isApproved) {
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
              Check Approval Status
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
