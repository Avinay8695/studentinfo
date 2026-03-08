import { useState, useEffect, useMemo } from 'react';
import { Sparkles, LogOut, User, Shield, Users, History, GraduationCap, Search, Clock } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { Student } from '@/types/student';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { CommandPalette } from './CommandPalette';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface HeaderProps {
  students?: Student[];
  onViewPayments?: (student: Student) => void;
  onStudentSelect?: (student: Student) => void;
}

const PAGE_NAMES: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'User Management',
  '/audit-logs': 'Audit Logs',
};

export function Header({ students = [], onViewPayments, onStudentSelect }: HeaderProps) {
  const { user, fullName, isAdmin, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  const currentPage = PAGE_NAMES[location.pathname] || 'Dashboard';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch last login time from audit logs
  useEffect(() => {
    if (!user) return;
    const fetchLastLogin = async () => {
      try {
        const { data } = await supabase
          .from('audit_logs' as any)
          .select('created_at')
          .eq('action_type', 'LOGIN')
          .eq('entity_type', 'USER')
          .order('created_at', { ascending: false })
          .limit(2);
        // Second entry = previous login (first is current session)
        const prev = (data as any)?.[1]?.created_at;
        if (prev) setLastLogin(formatDistanceToNow(new Date(prev), { addSuffix: true }));
      } catch {}
    };
    fetchLastLogin();
  }, [user]);

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
    <>
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="relative overflow-hidden transition-all duration-500">
        {/* Gradient background - fades on scroll */}
        <div className={`absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] transition-opacity duration-500 ${scrolled ? 'opacity-0' : 'opacity-100'}`} style={{ animation: 'gradient-shift 8s ease infinite' }} />
        
        {/* Glassmorphism background - appears on scroll */}
        <div className={`absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-border/50 transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Decorative overlay (gradient only) */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/5 transition-opacity duration-500 ${scrolled ? 'opacity-0' : 'opacity-100'}`} />

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
                  <div className={`absolute -inset-1 rounded-xl sm:rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${scrolled ? 'bg-primary/20' : 'bg-white/20'}`} />
                  <div className={`absolute -inset-0.5 rounded-xl sm:rounded-2xl p-[1.5px] ${scrolled ? 'bg-gradient-to-br from-primary/40 to-primary/10' : 'bg-gradient-to-br from-white/40 to-white/10'}`}>
                    <div className={`w-full h-full rounded-[10px] sm:rounded-[14px] ${scrolled ? 'bg-muted/50' : 'bg-black/10'} backdrop-blur-sm`} />
                  </div>
                  <div className={`relative overflow-hidden shadow-2xl transition-all duration-500 rounded-xl sm:rounded-2xl group-hover:scale-105 ${scrolled ? 'w-7 h-7 sm:w-10 sm:h-10' : 'w-9 h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14'}`}>
                    <img src={logoImage} alt="Success Desirous Logo" className="w-full h-full object-cover" loading="eager" fetchPriority="high" />
                  </div>
                </button>
                
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h1 className={`font-extrabold tracking-tight font-display drop-shadow-md transition-all duration-500 ${scrolled ? 'text-[13px] sm:text-base lg:text-lg text-foreground drop-shadow-none' : 'text-[15px] sm:text-xl lg:text-2xl text-white'}`}>
                      Success Desirous
                    </h1>
                    <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse flex-shrink-0 transition-colors duration-500 ${scrolled ? 'text-yellow-500' : 'text-yellow-300 drop-shadow-lg'}`} />
                  </div>
                  <div className={`flex items-center gap-1.5 mt-0.5 transition-all duration-500 overflow-hidden ${scrolled ? 'max-h-0 opacity-0' : 'max-h-8 opacity-100'}`}>
                    <GraduationCap className="w-3 h-3 text-white/60 hidden sm:block" />
                    <p className="hidden sm:block text-white/70 text-[10px] sm:text-xs font-medium tracking-widest uppercase truncate">
                      {currentPage}
                    </p>
                  </div>
                  {/* Scrolled breadcrumb */}
                  <div className={`flex items-center gap-1 transition-all duration-500 overflow-hidden ${scrolled ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
                      {currentPage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
                
                {/* Search trigger */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCmdOpen(true)}
                  className={`w-8 h-8 sm:w-auto sm:h-9 sm:px-3 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                    scrolled 
                      ? 'bg-muted/50 hover:bg-muted border-border text-foreground' 
                      : 'bg-white/12 hover:bg-white/20 border-white/20 text-white'
                  }`}
                  aria-label="Search (Ctrl+K)"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1.5 text-xs font-medium">Search</span>
                  <kbd className={`hidden lg:inline ml-2 text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    scrolled ? 'bg-background border border-border' : 'bg-white/15 border border-white/20'
                  }`}>
                    ⌘K
                  </kbd>
                </Button>

                {/* Desktop user info card - hidden when scrolled */}
                <div className={`hidden lg:flex items-center gap-3 mr-1 transition-all duration-500 ${scrolled ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/15">
                    {/* Avatar with online dot */}
                    <div className="relative">
                      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white/20 animate-pulse" />
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
                
                {onViewPayments && students.length > 0 && (
                  <NotificationBell students={students} onViewPayments={onViewPayments} />
                )}
                
                <ThemeToggle />
                
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`relative w-10 h-10 sm:w-auto sm:h-10 sm:px-3 rounded-xl backdrop-blur-md border shadow-lg transition-all duration-300 hover:shadow-xl ${
                          scrolled
                            ? 'bg-muted/50 hover:bg-muted border-border text-foreground'
                            : 'bg-white/12 hover:bg-white/20 border-white/20 text-white hover:border-white/30'
                        }`}
                      >
                        <div className="relative">
                          <div className="w-5 h-5 sm:w-4 sm:h-4">
                            <User className="w-full h-full" />
                          </div>
                          {/* Online dot on menu button */}
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white/30 animate-pulse" />
                        </div>
                        <span className="hidden sm:inline ml-1.5 text-xs font-semibold">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 sm:w-56 rounded-xl shadow-2xl border-border/50 backdrop-blur-xl">
                      <div className="px-3 py-3 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <div className="relative flex-shrink-0">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
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
                            {lastLogin && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                                <p className="text-[10px] text-muted-foreground">Last login {lastLogin}</p>
                              </div>
                            )}
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
    {/* Spacer for fixed header */}
    <div className="h-[60px] sm:h-[76px] lg:h-[92px]" />
    
    {/* Command Palette */}
    <CommandPalette 
      open={cmdOpen} 
      onOpenChange={setCmdOpen} 
      students={students}
      isAdmin={isAdmin}
      onStudentSelect={onStudentSelect}
    />
    </>
  );
}
