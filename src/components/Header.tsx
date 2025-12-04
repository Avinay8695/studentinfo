import { GraduationCap } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground py-6 px-4 shadow-card">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-foreground/10 rounded-lg">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ragini Computer Institute</h1>
            <p className="text-primary-foreground/80 text-sm font-medium">Student Information System</p>
          </div>
        </div>
      </div>
    </header>
  );
}
