import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  BarChart3, 
  PieChart, 
  UserPlus, 
  Users,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionNavProps {
  sections: {
    id: string;
    label: string;
    icon: React.ReactNode;
  }[];
}

export function SectionNav({ sections }: SectionNavProps) {
  const [activeSection, setActiveSection] = useState<string>('');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
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

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-2 p-2 bg-card/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl">
      {sections.map((section) => (
        <Button
          key={section.id}
          variant="ghost"
          size="icon"
          onClick={() => scrollToSection(section.id)}
          className={cn(
            "w-10 h-10 rounded-xl transition-all duration-300",
            activeSection === section.id 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
          title={section.label}
        >
          {section.icon}
        </Button>
      ))}
    </div>
  );
}

// Export the default sections configuration
export const defaultSections = [
  { id: 'dashboard-summary', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'stats', label: 'Statistics', icon: <PieChart className="w-4 h-4" /> },
  { id: 'add-student', label: 'Add Student', icon: <UserPlus className="w-4 h-4" /> },
  { id: 'students', label: 'Students List', icon: <Users className="w-4 h-4" /> },
];
