import { Database, Shield, Sparkles, Wifi, Heart, GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-border mt-auto bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none" />
      
      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
              <Database className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-card-foreground">Local Storage</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 rounded-full border border-emerald-500/10">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-card-foreground">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/5 rounded-full border border-violet-500/10">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-card-foreground">Offline Ready</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/5 rounded-full border border-amber-500/10">
              <Wifi className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-card-foreground">No Internet Required</span>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>for educators</span>
            <span className="mx-2">•</span>
            <span className="font-semibold text-card-foreground">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
