import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { hapticLight } from '@/utils/haptics';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 400);
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    hapticLight();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-[136px] md:bottom-[76px] right-3 sm:right-6 z-40 h-10 w-10 sm:h-11 sm:w-11 rounded-xl shadow-lg bg-card/90 backdrop-blur-xl border border-border/50 text-foreground flex items-center justify-center transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-primary/20 active:scale-90 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  );
}
