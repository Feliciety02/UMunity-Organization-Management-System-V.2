import { Link } from "@tanstack/react-router";
import { Badge, Panel } from "@/components/dashboard/DashboardLayout";
import type { ReviewCenterActivity, ReviewCenterItem } from "@/lib/review-center";

function timeAgo(timestamp: number) {
  const hours = Math.max(1, Math.round((Date.now() - timestamp) / 3_600_000));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function ReviewCenterBoard({
  title,
  emptyTitle,
  emptySub,
  items,
}: {
  title: string;
  emptyTitle: string;
  emptySub: string;
  items: ReviewCenterItem[];
}) {
  return (
    <Panel title={title}>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{emptyTitle}</p>
            <p className="mt-1">{emptySub}</p>
          </div>
        ) : (
          items.map((item) => (
            <Link key={item.id} to={item.href as string} className="block rounded-2xl border border-border bg-card p-4 transition hover:bg-secondary/50">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={item.tone}>{item.status}</Badge>
                <Badge tone="neutral">{item.lane}</Badge>
                <span className="text-[11px] text-muted-foreground">{timeAgo(item.updatedAt)}</span>
              </div>
              <p className="mt-2 text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.orgName}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>
            </Link>
          ))
        )}
      </div>
    </Panel>
  );
}

export function ReviewActivityFeed({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: ReviewCenterActivity[];
}) {
  return (
    <Panel title={title}>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">{empty}</div>
        ) : (
          items.map((item) => (
            <Link key={item.id} to={item.href as string} className="block rounded-2xl bg-secondary/35 p-4 transition hover:bg-secondary/55">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="info">{item.lane}</Badge>
                <span className="text-[11px] text-muted-foreground">{timeAgo(item.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.by}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>
            </Link>
          ))
        )}
      </div>
    </Panel>
  );
}
