import { Database, Shield, Sparkles, Cloud, Heart, GraduationCap, Code2, Phone, Mail } from 'lucide-react';
import logoImage from '@/assets/logo-success-desirous.jpg';
import developerImage from '@/assets/developer-avinay.jpg';

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

        <div className="relative z-10 px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="w-full mx-auto py-4 sm:py-8">
            <div className="flex flex-col gap-3 sm:gap-5">
              
              {/* Branding + Feature pills - single row on mobile */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-white/40 to-white/10 p-[1.5px]">
                      <div className="w-full h-full rounded-[10px] bg-black/10 backdrop-blur-sm" />
                    </div>
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-2xl">
                      <img src={logoImage} alt="Success Desirous Logo" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-base font-extrabold tracking-tight font-display text-white drop-shadow-md">
                        Success Desirous
                      </span>
                      <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse drop-shadow-lg" />
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-2.5 h-2.5 text-white/60" />
                      <p className="text-white/70 text-[9px] sm:text-[10px] font-medium tracking-widest uppercase">
                        Student Management
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Feature pills - smaller on mobile */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                  {[
                    { icon: Cloud, label: 'Cloud Sync' },
                    { icon: Shield, label: 'Secure' },
                    { icon: Sparkles, label: 'Real-time' },
                    { icon: Database, label: 'Supabase' },
                  ].map((feature) => (
                    <div 
                      key={feature.label}
                      className="group flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/15 hover:bg-white/20 transition-all duration-300 cursor-default hover:scale-105"
                    >
                      <feature.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/80" />
                      <span className="text-[10px] sm:text-xs font-medium text-white/90">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              {/* Developer credit - compact on mobile */}
              <div className="flex items-center gap-3 sm:gap-5">
                <img
                  src={developerImage}
                  alt="Avinay Gupta"
                  className="w-10 h-10 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white/20 shadow-lg flex-shrink-0"
                />
                <div className="space-y-0.5 sm:space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Code2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-300" />
                    <span className="text-xs sm:text-sm font-semibold text-white font-display">Built by Avinay Gupta</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-white/60 truncate">Full-Stack Developer & Software Engineering Student</p>
                  <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-white/50">
                    <a href="tel:8695721922" className="inline-flex items-center gap-1 hover:text-white/80 transition-colors">
                      <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>8695721922</span>
                    </a>
                    <span className="text-white/20">|</span>
                    <a href="mailto:avinay.gupta@zohomail.in" className="inline-flex items-center gap-1 hover:text-white/80 transition-colors truncate">
                      <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="truncate">avinay.gupta@zohomail.in</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Bottom row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-white/70">
                  <span>Made with</span>
                  <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
                  <span>for educators</span>
                  <span className="mx-0.5 text-white/30">•</span>
                  <span className="font-semibold text-white">© {currentYear}</span>
                </div>
                
                <span className="text-[9px] sm:text-[10px] text-white/60 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/15 font-medium">
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
