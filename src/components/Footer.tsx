import { Database, Shield, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-6 px-4 border-t border-border mt-auto bg-card/50">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="w-4 h-4" />
              <span className="font-medium">Local Storage</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Offline Ready</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Student Management System
          </p>
        </div>
      </div>
    </footer>
  );
}
