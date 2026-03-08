import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  Home, Users, History, Search, GraduationCap, 
  UserPlus, BarChart3, FileText
} from 'lucide-react';
import { Student } from '@/types/student';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students?: Student[];
  isAdmin?: boolean;
  onStudentSelect?: (student: Student) => void;
}

const pages = [
  { name: 'Dashboard', path: '/', icon: Home, description: 'Main dashboard' },
  { name: 'User Management', path: '/users', icon: Users, description: 'Manage users', adminOnly: true },
  { name: 'Audit Logs', path: '/audit-logs', icon: History, description: 'Activity history', adminOnly: true },
];

export function CommandPalette({ 
  open, 
  onOpenChange, 
  students = [], 
  isAdmin = false,
  onStudentSelect 
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const availablePages = useMemo(
    () => pages.filter(p => !p.adminOnly || isAdmin),
    [isAdmin]
  );

  const handlePageSelect = (path: string) => {
    if (location.pathname !== path) navigate(path);
    onOpenChange(false);
  };

  const handleStudentSelect = (student: Student) => {
    onStudentSelect?.(student);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search students, pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Pages">
          {availablePages.map(page => (
            <CommandItem 
              key={page.path} 
              onSelect={() => handlePageSelect(page.path)}
              className="cursor-pointer"
            >
              <page.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{page.name}</p>
                <p className="text-xs text-muted-foreground">{page.description}</p>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        {students.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Students">
              {students.slice(0, 20).map(student => (
                <CommandItem
                  key={student.id}
                  value={`${student.fullName} ${student.course} ${student.batch}`}
                  onSelect={() => handleStudentSelect(student)}
                  className="cursor-pointer"
                >
                  <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{student.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {student.course} • {student.batch || 'No batch'}
                    </p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    student.feesStatus === 'paid' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {student.feesStatus === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
