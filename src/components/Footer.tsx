import { Code2, Phone, Mail } from 'lucide-react';
import developerImage from '@/assets/developer-avinay.jpg';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-card/80 backdrop-blur-sm">
      <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Developer photo */}
          <img
            src={developerImage}
            alt="Avinay Gupta"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-primary/20 shadow-md flex-shrink-0"
          />

          {/* Info */}
          <div className="text-center sm:text-left space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              <h3 className="text-sm sm:text-base font-semibold text-foreground font-display">
                Built by Avinay Gupta
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Full-Stack Developer &amp; Software Engineering Student
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-4 text-xs text-muted-foreground">
              <a
                href="tel:8695721922"
                className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>8695721922</span>
              </a>
              <span className="hidden sm:inline text-border">|</span>
              <a
                href="mailto:avinay.gupta@zohomail.in"
                className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>avinay.gupta@zohomail.in</span>
              </a>
            </div>
          </div>

          {/* Copyright pushed right on desktop */}
          <div className="sm:ml-auto text-xs text-muted-foreground text-center">
            © {currentYear} Success Desirous
          </div>
        </div>
      </div>
    </footer>
  );
}
