import { useState, useEffect, useMemo } from 'react';
import { Sparkles, LogOut, User, Shield, Users, History, GraduationCap, Search, Clock, Trash2 } from 'lucide-react';
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
  '/trash': 'Trash',
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
          .eq('performed_by', user.id)
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
      <div className="relative transition-all duration-300">
        {/* Solid professional background with subtle border */}
        <div className={`absolute inset-0 bg-background/95 backdrop-blur-xl border-b transition-all duration-300 ${scrolled ? 'border-border shadow-sm' : 'border-border/60'}`} />

        {/* Content */}
        <div className="relative z-10 px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="w-full mx-auto h-14 sm:h-16 flex items-center">
            <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
              
              {/* Logo + Branding */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="relative flex-shrink-0 group cursor-pointer"
                  aria-label="Scroll to top"
                >
                  <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden ring-1 ring-border shadow-sm group-hover:ring-primary/40 transition-all duration-200">
                    <img src={logoImage} alt="Success Desirous Logo" className="w-full h-full object-cover" loading="eager" fetchPriority="high" />
                  </div>
                </button>
                
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-semibold tracking-tight font-display text-foreground text-sm sm:text-base leading-none truncate">
                      Success Desirous
                    </h1>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 mt-1">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    <p className="text-[11px] text-muted-foreground font-medium truncate">
                      {currentPage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                
                {/* Search trigger */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCmdOpen(true)}
                  className="w-9 h-9 sm:w-auto sm:h-9 sm:px-3 rounded-lg bg-muted/40 hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-all"
                  aria-label="Search (Ctrl+K)"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2 text-xs font-medium">Search</span>
                  <kbd className="hidden lg:inline ml-2 text-[10px] px-1.5 py-0.5 rounded font-mono bg-background border border-border text-muted-foreground">
                    ⌘K
                  </kbd>
                </Button>

                {onViewPayments && students.length > 0 && (
                  <NotificationBell students={students} onViewPayments={onViewPayments} scrolled={scrolled} />
                )}
                
                <ThemeToggle scrolled={scrolled} />

                {/* Vertical divider */}
                <div className="hidden sm:block h-6 w-px bg-border mx-1" />
                
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost"
                        className="relative h-9 px-1.5 sm:px-2 rounded-lg hover:bg-muted border border-transparent hover:border-border transition-all gap-2"
                      >
                        <div className="hidden md:flex flex-col items-end leading-tight">
                          <span className="text-[12px] font-semibold text-foreground truncate max-w-[120px]">
                            {fullName || 'User'}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                            {isAdmin ? 'Admin' : 'User'}
                          </span>
                        </div>
                        <div className="relative">
                          <div className="w-7 h-7 rounded-full bg-primary/10 ring-1 ring-border flex items-center justify-center">
                            {isAdmin ? (
                              <Shield className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-primary" />
                            )}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                        </div>
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
                          <DropdownMenuItem 
                            onClick={() => navigate('/trash')}
                            className="cursor-pointer min-h-[44px] rounded-lg mx-1 my-0.5"
                          >
                            <Trash2 className="w-4 h-4 mr-2 text-destructive" />
                            Trash
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
    <div className="h-14 sm:h-16" />
    
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
