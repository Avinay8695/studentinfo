import { Database, Shield, Sparkles, Cloud, Heart, Github, ExternalLink } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-8 px-4 border-t border-border mt-auto bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none" />
      
      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col gap-6">
          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10 hover:bg-primary/10 transition-colors cursor-default">
              <Cloud className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-card-foreground">Cloud Sync</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 rounded-full border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors cursor-default">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-card-foreground">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/5 rounded-full border border-violet-500/10 hover:bg-violet-500/10 transition-colors cursor-default">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-card-foreground">Real-time Updates</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/5 rounded-full border border-amber-500/10 hover:bg-amber-500/10 transition-colors cursor-default">
              <Database className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-card-foreground">Supabase Backend</span>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          
          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span>for educators</span>
              <span className="mx-2 hidden sm:inline">•</span>
              <span className="font-semibold text-card-foreground">© {currentYear}</span>
            </div>
            
            {/* Version */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md">
                v2.0.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
