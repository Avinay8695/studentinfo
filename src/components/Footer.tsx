import { Database, Shield, Sparkles, Cloud, Heart, GraduationCap } from 'lucide-react';
import logoImage from '@/assets/logo-success-desirous.jpg';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative overflow-hidden mt-auto">
      {/* Matching header gradient band */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]" style={{ animation: 'gradient-shift 8s ease infinite' }} />
        
        {/* Decorative elements matching header */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse-slow" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/8 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 opacity-[0.07]" style={{ 
            backgroundImage: 'linear-gradient(90deg, white 1px, transparent 1px), linear-gradient(white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-white/5" />
        </div>

        <div className="relative z-10 px-3 sm:px-6">
          <div className="container max-w-7xl mx-auto py-6 sm:py-8">
            <div className="flex flex-col gap-5">
              
              {/* Branding row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-white/40 to-white/10 p-[1.5px]">
                      <div className="w-full h-full rounded-[10px] bg-black/10 backdrop-blur-sm" />
                    </div>
                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-2xl">
                      <img src={logoImage} alt="Success Desirous Logo" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm sm:text-base font-extrabold tracking-tight font-display text-white drop-shadow-md">
                        Success Desirous
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse drop-shadow-lg" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <GraduationCap className="w-3 h-3 text-white/60" />
                      <p className="text-white/70 text-[10px] font-medium tracking-widest uppercase">
                        Student Management
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Feature pills */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[
                    { icon: Cloud, label: 'Cloud Sync' },
                    { icon: Shield, label: 'Secure' },
                    { icon: Sparkles, label: 'Real-time' },
                    { icon: Database, label: 'Supabase' },
                  ].map((feature) => (
                    <div 
                      key={feature.label}
                      className="group flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/15 hover:bg-white/20 transition-all duration-300 cursor-default hover:scale-105"
                    >
                      <feature.icon className="w-3 h-3 text-white/80 transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-xs font-medium text-white/90">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              {/* Bottom row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <span>Made with</span>
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
                  <span>for educators</span>
                  <span className="mx-1 hidden sm:inline text-white/30">•</span>
                  <span className="font-semibold text-white">© {currentYear}</span>
                </div>
                
                <span className="text-[10px] text-white/60 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/15 font-medium">
                  v2.0.0 <span className="text-yellow-300 ml-1">Premium</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
