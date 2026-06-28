import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  primary: "bg-primary/10 text-primary",
  gold: "bg-gold/20 text-primary-deep",
  rose: "bg-rose-100 text-rose-700",
  emerald: "bg-emerald-100 text-emerald-700",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-800",
  neutral: "bg-secondary text-foreground",
};

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "primary",
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-soft", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
          {delta && (
            <p className={cn(
              "mt-1 text-xs font-medium",
              delta.startsWith("-") ? "text-rose-600" : "text-emerald-600"
            )}>{delta}</p>
          )}
        </div>
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function StatCardGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </div>
  );
}
