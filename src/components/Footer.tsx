import { Database, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-5 px-4 border-t border-border mt-8 bg-muted/30">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Local Storage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Offline Ready</span>
            </div>
          </div>
          <p className="text-muted-foreground/70">
            © {new Date().getFullYear()} Student Management System
          </p>
        </div>
      </div>
    </footer>
  );
}
