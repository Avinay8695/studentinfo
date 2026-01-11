import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { isAuthenticated, loading, isApproved, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Not authenticated - redirect to auth
      if (!isAuthenticated) {
        navigate('/auth', { replace: true });
        return;
      }

      // Authenticated but not approved - redirect to pending
      if (isApproved === false) {
        navigate('/pending-approval', { replace: true });
        return;
      }

      // Admin required but user is not admin
      if (requireAdmin && !isAdmin) {
        navigate('/', { replace: true });
        return;
      }
    }
  }, [isAuthenticated, loading, isApproved, isAdmin, requireAdmin, navigate]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not approved
  if (!isAuthenticated || isApproved === false) {
    return null;
  }

  // Don't render if admin required but user is not admin
  if (requireAdmin && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
