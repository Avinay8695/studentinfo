import { GraduationCap, Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="gradient-primary text-primary-foreground py-6 sm:py-8 px-4 shadow-2xl relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-white/3 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'linear-gradient(90deg, white 1px, transparent 1px), linear-gradient(white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="container max-w-7xl mx-auto relative z-10">
        {/* Mobile Layout */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-white/20 rounded-xl sm:rounded-2xl blur-xl animate-pulse-slow" />
              <div className="relative p-2.5 sm:p-4 bg-white/15 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/25 shadow-2xl">
                <GraduationCap className="w-7 h-7 sm:w-10 sm:h-10" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight font-display truncate">
                  Student Management
                </h1>
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300 animate-pulse flex-shrink-0" />
              </div>
              <p className="text-primary-foreground/80 text-xs sm:text-sm font-semibold tracking-wider sm:tracking-widest uppercase truncate">
                Computer Training Institute
              </p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Desktop only info */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right mr-2">
                <p className="text-xs text-primary-foreground/60 uppercase tracking-wider">Welcome to</p>
                <p className="text-sm font-semibold">Admin Dashboard</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
            </div>
            
            {/* Theme Toggle - Always visible */}
            <ThemeToggle />
            
            {/* Dashboard Button - Hidden on small mobile */}
            <div className="hidden sm:block px-3 sm:px-5 py-2 sm:py-2.5 bg-white/15 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/25 text-xs sm:text-sm font-semibold shadow-lg hover:bg-white/20 transition-all cursor-pointer">
              Dashboard
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
