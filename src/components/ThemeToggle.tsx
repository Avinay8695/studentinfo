import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  scrolled?: boolean;
}

export function ThemeToggle({ scrolled = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl backdrop-blur-md border transition-all duration-300 ${
        scrolled
          ? 'bg-muted/50 hover:bg-muted border-border text-foreground'
          : 'bg-white/15 border-white/25 hover:bg-white/25 text-white'
      }`}
    >
      <Sun className={`h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 ${scrolled ? 'text-yellow-500' : 'text-yellow-300'}`} />
      <Moon className={`absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 ${scrolled ? 'text-foreground' : 'text-white'}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
