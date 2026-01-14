import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function AnalyticsSkeleton() {
  return (
    <Card className="p-6 mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Skeleton className="h-10 w-full rounded-lg mb-6" />

      {/* Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 bg-muted/30 rounded-2xl border border-border/50">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-[220px] w-full rounded-xl" />
          <div className="flex justify-center gap-6 mt-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="p-5 bg-muted/30 rounded-2xl border border-border/50">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-[180px] w-full rounded-full mx-auto" />
          <div className="flex justify-center gap-6 mt-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </Card>
  );
}
