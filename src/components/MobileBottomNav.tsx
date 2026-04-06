import { LayoutDashboard, UserPlus, Users, BarChart3, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { hapticLight } from '@/utils/haptics';

const sections = [
  { id: 'dashboard-summary', label: 'Home', icon: LayoutDashboard },
  { id: 'stats', label: 'Stats', icon: PieChart },
  { id: 'add-student', label: 'Add', icon: UserPlus, isCenter: true },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function MobileBottomNav() {
  const [activeSection, setActiveSection] = useState('dashboard-summary');

  const scrollToSection = (id: string) => {
    hapticLight();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Gradient top edge */}
      <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      
      <div className="bg-card/80 backdrop-blur-2xl border-t border-border/30 shadow-[0_-4px_24px_-4px_hsl(var(--foreground)/0.06)]">
        <div className="flex items-end justify-around px-1.5 pt-1 pb-0.5 safe-area-bottom">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const isCenter = section.isCenter;
            
            if (isCenter) {
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="relative flex flex-col items-center -mt-5 transition-all duration-300"
                  aria-label={section.label}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 border",
                    isActive
                      ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary/30 border-primary/30 scale-110"
                      : "bg-primary/90 text-primary-foreground border-primary/20 active:scale-95"
                  )}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className={cn(
                    "text-[8px] font-bold mt-0.5 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {section.label}
                  </span>
                </button>
              );
            }
            
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "relative flex flex-col items-center gap-0 py-1 px-2.5 rounded-xl transition-all duration-300 min-w-[48px]",
                  isActive ? "text-primary" : "text-muted-foreground active:text-foreground"
                )}
                aria-label={section.label}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-gradient-to-r from-primary to-accent rounded-full animate-scale-in" />
                )}
                <div className={cn(
                  "p-1 rounded-lg transition-all duration-300",
                  isActive && "bg-primary/10"
                )}>
                  <Icon className={cn("w-[18px] h-[18px] transition-all duration-300", isActive && "scale-110")} />
                </div>
                <span className={cn("text-[9px] font-medium transition-all duration-200 leading-tight", isActive && "font-bold")}>
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
