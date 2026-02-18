import { LayoutDashboard, UserPlus, Users, BarChart3, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const sections = [
  { id: 'dashboard-summary', label: 'Home', icon: LayoutDashboard },
  { id: 'stats', label: 'Stats', icon: PieChart },
  { id: 'add-student', label: 'Add', icon: UserPlus },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function MobileBottomNav() {
  const [activeSection, setActiveSection] = useState('dashboard-summary');

  const scrollToSection = (id: string) => {
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
      <div className="bg-card/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_-4px_hsl(var(--foreground)/0.1)]">
        <div className="flex items-center justify-around px-1 py-1.5 safe-area-bottom">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[56px]",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground active:bg-muted"
                )}
                aria-label={section.label}
              >
                <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
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
