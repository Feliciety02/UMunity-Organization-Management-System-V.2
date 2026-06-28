import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AppCard } from "@/components/ui/app-card";

export function LoadingSpinner({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("animate-spin rounded-full border-2 border-border border-t-primary", s)} />
    </div>
  );
}

export function LoadingSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <AppCard className={cn("rounded-3xl", className)}>
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </AppCard>
  );
}

export function PageLoading({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-60" />
      <Skeleton className="h-5 w-96" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4">
        <LoadingSkeleton rows={rows} />
        <LoadingSkeleton rows={rows} />
      </div>
    </div>
  );
}
