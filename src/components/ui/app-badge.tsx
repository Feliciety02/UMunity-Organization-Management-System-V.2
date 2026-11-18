import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-secondary text-foreground",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "bg-primary/15 text-primary-deep",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  gold: "bg-gold/20 text-primary-deep",
};

export function AppBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
