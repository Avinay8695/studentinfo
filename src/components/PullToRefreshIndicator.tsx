import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  isPastThreshold: boolean;
}

export function PullToRefreshIndicator({ pullDistance, isRefreshing, isPastThreshold }: PullToRefreshIndicatorProps) {
  if (pullDistance === 0 && !isRefreshing) return null;

  const rotation = Math.min(pullDistance * 3, 360);
  const opacity = Math.min(pullDistance / 60, 1);
  const scale = Math.min(0.5 + pullDistance / 160, 1);

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-[height] duration-300 ease-out md:hidden"
      style={{ height: pullDistance }}
    >
      <div
        className={`flex items-center gap-2 rounded-full px-4 py-2 shadow-lg border transition-all duration-200 ${
          isPastThreshold || isRefreshing
            ? 'bg-primary/10 border-primary/30 text-primary'
            : 'bg-background border-border text-muted-foreground'
        }`}
        style={{ opacity, transform: `scale(${scale})` }}
      >
        <RefreshCw
          className={`w-4 h-4 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
          style={{ transform: isRefreshing ? undefined : `rotate(${rotation}deg)` }}
        />
        <span className="text-xs font-medium">
          {isRefreshing ? 'Refreshing...' : isPastThreshold ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </div>
    </div>
  );
}
