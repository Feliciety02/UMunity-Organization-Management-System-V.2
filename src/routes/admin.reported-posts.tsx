import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge, EmptyState, PanelSkeleton } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { SearchX } from "lucide-react";
import { showStatusToast, useDashboardPageLoading } from "@/lib/feedback";

export const Route = createFileRoute("/admin/reported-posts")({
  component: ReportedPosts,
});

const items = [
  { org: "UM Debate Council", excerpt: "Open tryouts this Friday at Bolton Hall...", reporter: "Anonymous", reason: "Misinformation", time: "30m" },
  { org: "UM Athletics League", excerpt: "Sportsfest rules unfair to first-years", reporter: "Marvin L.", reason: "Harassment", time: "2h" },
  { org: "UM Theatre Guild", excerpt: "Cultural Night auditions sign-up...", reporter: "Anonymous", reason: "Spam", time: "1d" },
];

function ReportedPosts() {
  const loading = useDashboardPageLoading();

  if (loading) {
    return (
      <>
        <PageHead title="Reported posts" sub="Loading moderation queue." />
        <PanelSkeleton rows={6} />
      </>
    );
  }

  return (
    <>
      <PageHead title="Reported posts" sub="Review and act on flagged organization posts." />
      <Panel>
        {items.length === 0 ? (
          <EmptyState
            title="No reported posts"
            sub="Your moderation queue is clear for now."
            icon={SearchX}
            action={<AppButton variant="secondary" size="sm">Check again later</AppButton>}
          />
        ) : (
          <div className="divide-y divide-border">
            {items.map((r, i) => (
              <div key={i} className="flex flex-wrap items-start gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{r.org}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{r.excerpt}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <Badge tone="warning">{r.reason}</Badge>
                    <span className="text-muted-foreground">Reported by {r.reporter} - {r.time}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => showStatusToast("Marked safe", "This post has been cleared from moderation.")} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary">Dismiss</button>
                  <button onClick={() => showStatusToast("Post hidden", "The post is now hidden while you review it.", "warning")} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-deep">Hide</button>
                  <button onClick={() => showStatusToast("Post removed", "The post has been permanently removed.", "warning")} className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
