import { GraduationCap, Sparkles, LogOut, User, Shield, Users } from 'lucide-react';
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
    <header className="gradient-primary text-primary-foreground py-6 sm:py-8 px-4 shadow-2xl relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-white/3 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'linear-gradient(90deg, white 1px, transparent 1px), linear-gradient(white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="container max-w-7xl mx-auto relative z-10">
        {/* Mobile Layout */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-white/20 rounded-xl sm:rounded-2xl blur-xl animate-pulse-slow" />
              <div className="relative p-2.5 sm:p-4 bg-white/15 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/25 shadow-2xl">
                <GraduationCap className="w-7 h-7 sm:w-10 sm:h-10" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight font-display truncate">
                  Success Desirous
                </h1>
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300 animate-pulse flex-shrink-0" />
              </div>
              <p className="text-primary-foreground/80 text-xs sm:text-sm font-semibold tracking-wider sm:tracking-widest uppercase truncate">
                Student Management System
              </p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Desktop only info */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right mr-2">
                <div className="flex items-center justify-end gap-2 mb-0.5">
                  <p className="text-xs text-primary-foreground/60 uppercase tracking-wider">Welcome</p>
                  <Badge 
                    variant={isAdmin ? 'default' : 'secondary'}
                    className={`text-[10px] px-1.5 py-0 ${isAdmin ? 'bg-yellow-500 text-yellow-950 hover:bg-yellow-400' : 'bg-white/20 text-primary-foreground hover:bg-white/30'}`}
                  >
                    {isAdmin ? (
                      <><Shield className="w-2.5 h-2.5 mr-0.5" /> Admin</>
                    ) : (
                      <><User className="w-2.5 h-2.5 mr-0.5" /> User</>
                    )}
                  </Badge>
                </div>
                <p className="text-sm font-semibold truncate max-w-[200px]">
                  {fullName || 'User'}
                </p>
                <p className="text-xs text-primary-foreground/70 truncate max-w-[200px]">
                  {user?.email}
                </p>
              </div>
              <div className="h-10 w-px bg-white/20" />
            </div>
            
            {/* Theme Toggle - Always visible */}
            <ThemeToggle />
            
            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative px-3 sm:px-4 py-2 sm:py-2.5 bg-white/15 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/25 text-xs sm:text-sm font-semibold shadow-lg hover:bg-white/25 transition-all text-primary-foreground"
                  >
                    <User className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Account</span>
                    {isAdmin && (
                      <Shield className="w-3 h-3 ml-1 text-yellow-300" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold">{fullName || 'User'}</p>
                      <Badge 
                        variant={isAdmin ? 'default' : 'secondary'}
                        className={`text-[10px] ${isAdmin ? '' : ''}`}
                      >
                        {role === 'admin' ? 'Admin' : 'User'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => navigate('/users')}
                        className="cursor-pointer"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        User Management
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-destructive cursor-pointer"
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
    </header>
  );
}
