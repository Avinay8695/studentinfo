import { Sparkles, LogOut, User, Shield, Users, History } from 'lucide-react';
import logoImage from '@/assets/logo-success-desirous.jpg';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, fullName, isAdmin, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      navigate('/auth', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm dark:shadow-primary/5">
      <div className="gradient-primary py-4 sm:py-6 px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
          <div className="absolute bottom-0 left-0 w-[150px] sm:w-[300px] h-[150px] sm:h-[300px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 animate-pulse-slow" style={{ animationDelay: '1s' }} />
          {/* Premium grid pattern */}
          <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: 'linear-gradient(90deg, white 1px, transparent 1px), linear-gradient(white 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }} />
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
        </div>
        
        <div className="container max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="relative flex-shrink-0 group">
                <div className="absolute inset-0 bg-white/30 dark:bg-gold/30 rounded-lg sm:rounded-xl blur-lg animate-pulse-slow group-hover:bg-gold/40 transition-colors duration-500" />
                <div className="relative w-9 h-9 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden border-2 border-white/40 shadow-xl transition-transform duration-300 group-hover:scale-105">
                  <img 
                    src={logoImage} 
                    alt="Success Desirous Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight font-display truncate text-primary-foreground drop-shadow-sm">
                    Success Desirous
                  </h1>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 animate-pulse flex-shrink-0" />
                </div>
                <p className="hidden sm:block text-primary-foreground/80 text-xs sm:text-sm font-semibold tracking-wider uppercase truncate">
                  Student Management System
                </p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {/* Desktop only info */}
              <div className="hidden lg:flex items-center gap-4">
                <div className="text-right mr-2">
                  <div className="flex items-center justify-end gap-2 mb-0.5">
                    <p className="text-xs text-primary-foreground/60 uppercase tracking-wider">Welcome</p>
                    <Badge 
                      variant={isAdmin ? 'default' : 'secondary'}
                      className={`text-[10px] px-1.5 py-0 transition-all duration-300 ${isAdmin ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-950 hover:from-yellow-300 hover:to-amber-400 shadow-lg shadow-yellow-500/25' : 'bg-white/20 text-primary-foreground hover:bg-white/30 backdrop-blur-sm'}`}
                    >
                      {isAdmin ? (
                        <><Shield className="w-2.5 h-2.5 mr-0.5" /> Admin</>
                      ) : (
                        <><User className="w-2.5 h-2.5 mr-0.5" /> User</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold truncate max-w-[200px] text-primary-foreground">
                    {fullName || 'User'}
                  </p>
                  <p className="text-xs text-primary-foreground/70 truncate max-w-[200px]">
                    {user?.email}
                  </p>
                </div>
                <div className="h-10 w-px bg-white/20" />
              </div>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* User Menu */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative min-w-[44px] min-h-[44px] sm:min-w-0 sm:px-4 sm:py-2.5 bg-white/15 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/25 text-xs sm:text-sm font-semibold shadow-lg hover:bg-white/25 transition-all text-primary-foreground"
                    >
                      {/* Show only avatar/icon on mobile, full button on desktop */}
                      <div className="w-6 h-6 sm:w-auto sm:h-auto rounded-full bg-white/20 flex items-center justify-center sm:bg-transparent sm:rounded-none">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="hidden sm:inline sm:ml-2">Account</span>
                      {isAdmin && (
                        <Shield className="w-3 h-3 ml-1 text-yellow-300 hidden sm:block" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 sm:w-56">
                    {/* User info - Always shown in dropdown, especially important for mobile */}
                    <div className="px-3 py-3 border-b border-border">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold truncate max-w-[180px]">{fullName || 'User'}</p>
                        <Badge 
                          variant={isAdmin ? 'default' : 'secondary'}
                          className={`text-[10px] flex-shrink-0 ${isAdmin ? '' : ''}`}
                        >
                          {role === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <>
                        <DropdownMenuItem 
                          onClick={() => navigate('/users')}
                          className="cursor-pointer min-h-[44px]"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          User Management
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate('/audit-logs')}
                          className="cursor-pointer min-h-[44px]"
                        >
                          <History className="w-4 h-4 mr-2" />
                          Activity History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-destructive cursor-pointer min-h-[44px]"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
