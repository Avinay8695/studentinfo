import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PendingApprovalSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative backdrop-blur-sm border-primary/20">
        <CardHeader className="text-center space-y-4">
          <Skeleton className="w-20 h-20 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-3 w-40 mx-auto" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <div className="space-y-3 pt-2">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-3 w-56 mx-auto" />
        </CardContent>
      </Card>
    </div>
  );
}
