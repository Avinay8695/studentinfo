import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  variant?: 'default' | 'trash' | 'search' | 'students';
}

export function EmptyState({ icon, title, description, action, variant = 'default' }: EmptyStateProps) {
  const gradients: Record<string, string> = {
    default: 'from-primary/20 via-accent/10 to-primary/5',
    trash: 'from-destructive/15 via-rose-500/8 to-orange-500/5',
    search: 'from-amber-500/15 via-yellow-500/8 to-orange-500/5',
    students: 'from-blue-500/15 via-indigo-500/8 to-violet-500/5',
  };

  const ringColors: Record<string, string> = {
    default: 'ring-primary/20',
    trash: 'ring-destructive/20',
    search: 'ring-amber-500/20',
    students: 'ring-blue-500/20',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
      {/* Animated illustration container */}
      <div className="relative mb-6">
        {/* Outer ring pulse */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradients[variant]} animate-ping opacity-20`} 
          style={{ animationDuration: '3s', margin: '-12px' }} />
        
        {/* Middle ring */}
        <div className={`absolute inset-0 rounded-full ring-2 ${ringColors[variant]} opacity-40`} 
          style={{ margin: '-8px' }} />
        
        {/* Icon container */}
        <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${gradients[variant]} 
          flex items-center justify-center animate-float shadow-xl backdrop-blur-sm border border-white/10`}>
          <div className="text-foreground/60">
            {icon}
          </div>
        </div>

        {/* Floating dots decoration */}
        <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute -bottom-1 -left-3 w-2 h-2 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 -right-4 w-1.5 h-1.5 rounded-full bg-primary/20 animate-bounce" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Text */}
      <h3 className="text-lg sm:text-xl font-bold text-card-foreground font-display mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
        {description}
      </p>

      {/* Action */}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}
