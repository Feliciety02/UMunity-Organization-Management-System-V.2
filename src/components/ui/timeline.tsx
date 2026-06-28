import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimelineItem = {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  icon?: LucideIcon;
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
};

const dotColors: Record<string, string> = {
  success: "bg-emerald-500 ring-emerald-200",
  warning: "bg-amber-500 ring-amber-200",
  danger: "bg-rose-500 ring-rose-200",
  info: "bg-sky-500 ring-sky-200",
  neutral: "bg-muted-foreground ring-border",
};

export function Timeline({
  items,
  className,
}: {
  items: TimelineItem[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, i) => {
        const Icon = item.icon;
        const dotClass = dotColors[item.tone ?? "neutral"];
        return (
          <div key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4",
                  dotClass,
                  Icon ? "text-white" : "",
                )}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
              </div>
              {i < items.length - 1 ? (
                <div className="mt-1 h-full w-px bg-border" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 pt-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-sm font-semibold text-foreground">{item.title}</p>
                {item.timestamp ? (
                  <span className="shrink-0 text-xs text-muted-foreground">{item.timestamp}</span>
                ) : null}
              </div>
              {item.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
