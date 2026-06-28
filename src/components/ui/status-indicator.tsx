import { cn } from "@/lib/utils";
import { AppBadge } from "@/components/ui/app-badge";

export type StatusLevel = "success" | "warning" | "danger" | "info" | "neutral" | "gold";

export function StatusDot({ level = "neutral", className }: { level?: StatusLevel; className?: string }) {
  const colors = {
    success: "bg-emerald-500",
    warning: "bg-primary",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    gold: "bg-gold",
    neutral: "bg-muted-foreground",
  };
  return (
    <span className={cn("inline-block h-2 w-2 rounded-full", colors[level], className)} />
  );
}

export function StatusBadge({ status, tone, className }: { status: string; tone?: StatusLevel; className?: string }) {
  const t = tone ?? autoTone(status);
  return <AppBadge tone={t} className={className}>{status}</AppBadge>;
}

export function StatusPill({ label, level = "neutral", className }: { label: string; level?: StatusLevel; className?: string }) {
  const colors = {
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-primary/15 text-primary-deep border-primary/30",
    danger: "bg-rose-100 text-rose-700 border-rose-200",
    info: "bg-sky-100 text-sky-700 border-sky-200",
    gold: "bg-gold/20 text-primary-deep border-gold/30",
    neutral: "bg-secondary text-foreground border-border",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", colors[level], className)}>
      <StatusDot level={level} />
      {label}
    </span>
  );
}

export function autoTone(status: string): StatusLevel {
  const s = status.toLowerCase();
  if (s.includes("approv") || s.includes("active") || s.includes("going") || s.includes("publish") || s.includes("complete") || s.includes("recognized") || s.includes("ready") || s.includes("accredit")) return "success";
  if (s.includes("pend") || s.includes("maybe") || s.includes("draft") || s.includes("probation")) return "warning";
  if (s.includes("reject") || s.includes("cancel") || s.includes("suspend") || s.includes("disbanded") || s.includes("revision") || s.includes("error") || s.includes("missing")) return "danger";
  if (s.includes("info") || s.includes("schedule") || s.includes("review") || s.includes("process") || s.includes("for-review")) return "info";
  if (s.includes("gold") || s.includes("admin")) return "gold";
  return "neutral";
}
