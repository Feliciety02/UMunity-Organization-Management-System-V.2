import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
};

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft", className)}>
      {title || description ? (
        <div className="space-y-1">
          {title ? <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3> : null}
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function FormRow({
  columns = 1,
  children,
  className,
}: {
  columns?: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
}

const alignMap = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

export function FormActions({
  align = "right",
  children,
  className,
}: {
  align?: "left" | "right" | "center";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 pt-4", alignMap[align], className)}>
      {children}
    </div>
  );
}
