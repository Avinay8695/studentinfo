import { useRef, useState, useEffect } from 'react';
import { RefreshCw, Check } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  isPastThreshold: boolean;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => { ref.current = value; });
  return ref.current;
}

export function PullToRefreshIndicator({ pullDistance, isRefreshing, isPastThreshold }: PullToRefreshIndicatorProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const prevRefreshing = usePrevious(isRefreshing);

  useEffect(() => {
    if (prevRefreshing && !isRefreshing) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isRefreshing, prevRefreshing]);

  if (pullDistance === 0 && !isRefreshing && !showSuccess) return null;

  const rotation = Math.min(pullDistance * 4, 540);
  const opacity = Math.min(pullDistance / 50, 1);
  const scale = Math.min(0.6 + pullDistance / 120, 1);

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-[height] duration-300 ease-out md:hidden"
      style={{ height: showSuccess ? 56 : pullDistance }}
    >
      <div
        className={`flex items-center gap-2.5 rounded-2xl px-5 py-2.5 shadow-xl border transition-all duration-300 ${
          showSuccess
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
            : isPastThreshold || isRefreshing
            ? 'bg-primary/10 border-primary/30 text-primary shadow-primary/10'
            : 'bg-card border-border text-muted-foreground'
        }`}
        style={{ opacity: showSuccess ? 1 : opacity, transform: `scale(${showSuccess ? 1 : scale})` }}
      >
        {showSuccess ? (
          <Check className="w-4 h-4" />
        ) : (
          <RefreshCw
            className={`w-4 h-4 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: isRefreshing ? undefined : `rotate(${rotation}deg)` }}
          />
        )}
        <span className="text-xs font-semibold">
          {showSuccess ? 'Updated!' : isRefreshing ? 'Refreshing...' : isPastThreshold ? 'Release to refresh' : 'Pull down'}
        </span>
      </div>
    </div>
  );
}
