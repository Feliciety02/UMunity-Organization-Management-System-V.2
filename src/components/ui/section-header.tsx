import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  sub,
  action,
  className,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-1">
        <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
        {sub ? <p className="text-sm text-muted-foreground">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  sub,
  action,
  breadcrumbs,
  className,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 space-y-4", className)}>
      {breadcrumbs ? <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">{breadcrumbs}</div> : null}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight">{title}</h1>
          {sub ? <p className="text-lg text-muted-foreground">{sub}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}
