import type { ReactNode } from "react";

export function PageHeader({
  title,
  sub,
  action,
  breadcrumbs,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
  breadcrumbs?: ReactNode;
}) {
  return (
    <div className="mb-8 space-y-4">
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
