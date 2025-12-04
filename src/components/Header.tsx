import { GraduationCap } from 'lucide-react';

export function Header() {
  return (
    <header className="gradient-primary text-primary-foreground py-6 px-4 shadow-xl relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>
      
      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-display">
                Student Management
              </h1>
              <p className="text-primary-foreground/70 text-sm font-medium tracking-wide">
                Computer Training Institute
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 text-sm font-medium">
              Dashboard
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
