import { useState, useEffect } from 'react';
import { Sparkles, LogOut, User, Shield, Users, History, GraduationCap } from 'lucide-react';
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className="sticky top-0 z-50">
      <div className="relative overflow-hidden transition-all duration-500" style={{ padding: scrolled ? '0' : '0' }}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]" style={{ animation: 'gradient-shift 8s ease infinite' }} />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full blur-2xl animate-pulse-slow" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 sm:w-56 sm:h-56 bg-white/8 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.07]" style={{ 
            backgroundImage: 'linear-gradient(90deg, white 1px, transparent 1px), linear-gradient(white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/5" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-3 sm:px-6">
          <div className={`container max-w-7xl mx-auto transition-all duration-500 ${scrolled ? 'py-1.5 sm:py-2' : 'py-3 sm:py-4 lg:py-5'}`}>
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              
              {/* Logo + Branding */}
              <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="relative flex-shrink-0 group cursor-pointer"
                  aria-label="Scroll to top"
                >
                  <div className="absolute -inset-1 bg-white/20 rounded-xl sm:rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -inset-0.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/40 to-white/10 p-[1.5px]">
                    <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-black/10 backdrop-blur-sm" />
                  </div>
                  <div className={`relative overflow-hidden shadow-2xl transition-all duration-500 rounded-xl sm:rounded-2xl group-hover:scale-105 ${scrolled ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14'}`}>
                    <img src={logoImage} alt="Success Desirous Logo" className="w-full h-full object-cover" />
                  </div>
                </button>
                
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h1 className={`font-extrabold tracking-tight font-display truncate text-white drop-shadow-md transition-all duration-500 ${scrolled ? 'text-sm sm:text-base lg:text-lg' : 'text-base sm:text-xl lg:text-2xl'}`}>
                      Success Desirous
                    </h1>
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300 animate-pulse flex-shrink-0 drop-shadow-lg" />
                  </div>
                  <div className={`flex items-center gap-1.5 mt-0.5 transition-all duration-500 overflow-hidden ${scrolled ? 'max-h-0 opacity-0' : 'max-h-8 opacity-100'}`}>
                    <GraduationCap className="w-3 h-3 text-white/60 hidden sm:block" />
                    <p className="hidden sm:block text-white/70 text-[10px] sm:text-xs font-medium tracking-widest uppercase truncate">
                      Student Management
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
                
                {/* Desktop user info card - hidden when scrolled */}
                <div className={`hidden lg:flex items-center gap-3 mr-1 transition-all duration-500 ${scrolled ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/15">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-white truncate max-w-[140px]">
                          {fullName || 'User'}
                        </p>
                        <Badge 
                          variant="secondary"
                          className={`text-[9px] px-1.5 py-0 h-4 ${isAdmin ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-950 border-0 shadow-sm shadow-yellow-500/30' : 'bg-white/20 text-white border-0'}`}
                        >
                          {isAdmin ? (
                            <><Shield className="w-2 h-2 mr-0.5" /> Admin</>
                          ) : (
                            'User'
                          )}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-white/60 truncate max-w-[180px]">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                <ThemeToggle />
                
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="relative w-10 h-10 sm:w-auto sm:h-10 sm:px-3 bg-white/12 hover:bg-white/20 rounded-xl backdrop-blur-md border border-white/20 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/30"
                      >
                        <div className="w-5 h-5 sm:w-4 sm:h-4">
                          <User className="w-full h-full" />
                        </div>
                        <span className="hidden sm:inline ml-1.5 text-xs font-semibold">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 sm:w-56 rounded-xl shadow-2xl border-border/50 backdrop-blur-xl">
                      <div className="px-3 py-3 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold truncate">{fullName || 'User'}</p>
                              <Badge 
                                variant={isAdmin ? 'default' : 'secondary'}
                                className="text-[9px] px-1.5 py-0 h-4 flex-shrink-0"
                              >
                                {role === 'admin' ? 'Admin' : 'User'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      {isAdmin && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => navigate('/users')}
                            className="cursor-pointer min-h-[44px] rounded-lg mx-1 my-0.5"
                          >
                            <Users className="w-4 h-4 mr-2 text-primary" />
                            User Management
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => navigate('/audit-logs')}
                            className="cursor-pointer min-h-[44px] rounded-lg mx-1 my-0.5"
                          >
                            <History className="w-4 h-4 mr-2 text-primary" />
                            Activity History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="mx-2" />
                        </>
                      )}
                      <DropdownMenuItem 
                        onClick={handleSignOut}
                        className="text-destructive cursor-pointer min-h-[44px] rounded-lg mx-1 my-0.5"
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
      </div>
    </header>
  );
}
