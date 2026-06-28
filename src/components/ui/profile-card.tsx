import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AppAvatar } from "@/components/ui/app-avatar";

export function ProfileCard({
  name,
  email,
  role,
  avatar,
  stats,
  actions,
  className,
}: {
  name: string;
  email?: string;
  role?: string;
  avatar?: ReactNode;
  stats?: { label: string; value: string }[];
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6 shadow-soft", className)}>
      <div className="flex flex-col items-center text-center">
        <AppAvatar ring className="h-20 w-20">
          {avatar ?? (
            <div className="grid h-full w-full place-items-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </AppAvatar>
        <p className="mt-4 font-display text-lg font-bold text-foreground">{name}</p>
        {role ? <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{role}</p> : null}
        {email ? <p className="mt-1 text-sm text-muted-foreground">{email}</p> : null}
      </div>
      {stats && stats.length > 0 ? (
        <div className="mt-5 grid grid-cols-3 gap-4 rounded-xl bg-secondary/60 px-4 py-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-base font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      ) : null}
      {actions ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
