import type { LucideIcon } from "lucide-react";

export function EmptyState({ title, sub, icon: Icon }: { title: string; sub?: string; icon: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-secondary/40 p-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-display text-base font-semibold">{title}</p>
      {sub ? <p className="mt-2 max-w-sm text-sm text-muted-foreground">{sub}</p> : null}
    </div>
  );
}
