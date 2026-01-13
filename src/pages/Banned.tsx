import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ban, LogOut, Mail } from 'lucide-react';
import { useEffect } from 'react';

export default function Banned() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, signOut, isBanned } = useAuth();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  // Redirect to dashboard if not banned
  useEffect(() => {
    if (!loading && isAuthenticated && isBanned === false) {
      navigate('/', { replace: true });
    }
  }, [loading, isAuthenticated, isBanned, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  // Don't render anything while loading or if not authenticated
  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-destructive/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative backdrop-blur-sm border-destructive/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-4 bg-destructive/10 rounded-full w-fit">
            <Ban className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">Account Banned</CardTitle>
          <CardDescription className="text-base">
            Your account has been suspended by an administrator. You no longer have access to this system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User info */}
          <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Account</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
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
            If you believe this is a mistake, please contact the administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}