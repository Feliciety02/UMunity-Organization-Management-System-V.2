import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppCard({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-border/80 bg-card shadow-soft",
        padded && "p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AppCardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  if (!title && !subtitle && !action) return null;
  return (
    <div className={cn("mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-1">
        {title ? <h3 className="font-display text-base font-semibold text-foreground">{title}</h3> : null}
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
