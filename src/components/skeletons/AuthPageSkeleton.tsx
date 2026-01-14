import { Skeleton } from "@/components/ui/skeleton";

export function AuthPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950" />
      
      {/* Glass Card Skeleton */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-8">
          {/* Logo Section */}
          <div className="text-center mb-6 sm:mb-8">
            <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-8 w-48 mx-auto mb-2 bg-white/20" />
            <Skeleton className="h-4 w-40 mx-auto bg-white/10" />
          </div>

          {/* Tabs Skeleton */}
          <Skeleton className="h-12 w-full rounded-full mb-6 bg-white/10" />

          {/* Form Fields Skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-white/20" />
              <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 bg-white/20" />
              <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl bg-primary/30" />
          </div>

          {/* Footer */}
          <Skeleton className="h-3 w-48 mx-auto mt-6 bg-white/10" />
        </div>
      </div>
    </div>
  );
}
