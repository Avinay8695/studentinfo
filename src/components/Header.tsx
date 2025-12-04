import { GraduationCap, Settings } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-5 px-4 shadow-lg">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary-foreground/15 rounded-xl backdrop-blur-sm">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Student Management System</h1>
              <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider">Computer Training Institute</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-primary-foreground/60 text-xs">
            <Settings className="w-4 h-4" />
            <span>v1.0</span>
          </div>
        </div>
      </div>
    </header>
  );
}
