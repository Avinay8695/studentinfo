import { Skeleton } from "@/components/ui/skeleton";

export function AuditLogsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-9 w-32" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="p-4 rounded-2xl bg-card/50 border border-border/50">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-4 w-16" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-[140px] rounded-md" />
            <Skeleton className="h-10 w-[140px] rounded-md" />
          </div>
        </div>
      </div>

      {/* Timeline Skeleton */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent" />
        
        {/* Date Group */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>
          
          {/* Log Items */}
          <div className="space-y-3 ml-5 pl-8 border-l border-border/50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-card/40 border border-border/50">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-3/4" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
