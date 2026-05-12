import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppTabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item, index) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-semibold transition",
            value === item
              ? "bg-primary text-primary-foreground shadow-[0_10px_22px_rgba(122,0,25,0.16)]"
              : index === 0 && value !== item
                ? "border border-border bg-card text-muted-foreground hover:bg-secondary"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function UnderlineTabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-6", className)}>
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={cn("relative pb-3 text-sm font-semibold transition", value === item ? "text-primary" : "text-muted-foreground hover:text-foreground")}
        >
          {item}
          {value === item ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" /> : null}
        </button>
      ))}
    </div>
  );
}

export function MetaRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-2 text-sm text-muted-foreground", className)}>{children}</div>;
}
