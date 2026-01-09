import { Database, Shield, Sparkles, Cloud, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-8 px-4 border-t border-border/50 mt-auto bg-gradient-to-b from-background via-background to-muted/30 dark:to-muted/10 relative overflow-hidden">
      {/* Premium background effects */}
      <div className="absolute inset-0 pattern-grid opacity-30 dark:opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-gradient-to-t from-primary/5 to-transparent blur-3xl pointer-events-none" />
      
      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col gap-6">
          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Cloud, label: 'Cloud Sync', color: 'primary' },
              { icon: Shield, label: 'Secure & Private', color: 'emerald' },
              { icon: Sparkles, label: 'Real-time Updates', color: 'violet' },
              { icon: Database, label: 'Supabase Backend', color: 'amber' },
            ].map((feature) => (
              <div 
                key={feature.label}
                className={`group flex items-center gap-2 px-4 py-2 bg-${feature.color === 'primary' ? 'primary' : feature.color + '-500'}/5 dark:bg-${feature.color === 'primary' ? 'primary' : feature.color + '-500'}/10 rounded-full border border-${feature.color === 'primary' ? 'primary' : feature.color + '-500'}/10 dark:border-${feature.color === 'primary' ? 'primary' : feature.color + '-400'}/20 hover:bg-${feature.color === 'primary' ? 'primary' : feature.color + '-500'}/10 dark:hover:bg-${feature.color === 'primary' ? 'primary' : feature.color + '-500'}/20 transition-all duration-300 cursor-default hover:scale-105`}
              >
                <feature.icon className={`w-4 h-4 text-${feature.color === 'primary' ? 'primary' : feature.color + '-600'} dark:text-${feature.color === 'primary' ? 'primary' : feature.color + '-400'} transition-transform duration-300 group-hover:scale-110`} />
                <span className="text-sm font-medium text-card-foreground">{feature.label}</span>
              </div>
            ))}
          </div>
          
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-border/50 to-transparent" />
          
          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span>for educators</span>
              <span className="mx-2 hidden sm:inline text-border">•</span>
              <span className="font-semibold text-card-foreground">© {currentYear}</span>
            </div>
            
            {/* Version */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground px-3 py-1.5 bg-muted/50 dark:bg-muted/30 rounded-full border border-border/50 font-medium">
                v2.0.0 <span className="text-primary dark:text-gold ml-1">Premium</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
