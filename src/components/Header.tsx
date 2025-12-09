import { GraduationCap, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="gradient-primary text-primary-foreground py-8 px-4 shadow-2xl relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-white/3 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'linear-gradient(90deg, white 1px, transparent 1px), linear-gradient(white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl animate-pulse-slow" />
              <div className="relative p-4 bg-white/15 rounded-2xl backdrop-blur-sm border border-white/25 shadow-2xl">
                <GraduationCap className="w-10 h-10" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-extrabold tracking-tight font-display">
                  Student Management
                </h1>
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-primary-foreground/80 text-sm font-semibold tracking-widest uppercase">
                Computer Training Institute
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right mr-4">
              <p className="text-xs text-primary-foreground/60 uppercase tracking-wider">Welcome to</p>
              <p className="text-sm font-semibold">Admin Dashboard</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="px-5 py-2.5 bg-white/15 rounded-xl backdrop-blur-sm border border-white/25 text-sm font-semibold shadow-lg hover:bg-white/20 transition-all cursor-pointer">
              Dashboard
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
