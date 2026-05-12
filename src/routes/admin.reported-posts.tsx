import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reported-posts")({
  component: ReportedPosts,
});

const items = [
  { org: "UM Debate Council", excerpt: "Open tryouts this Friday at Bolton Hall...", reporter: "Anonymous", reason: "Misinformation", time: "30m" },
  { org: "UM Athletics League", excerpt: "Sportsfest rules unfair to first-years", reporter: "Marvin L.", reason: "Harassment", time: "2h" },
  { org: "UM Theatre Guild", excerpt: "Cultural Night auditions sign-up...", reporter: "Anonymous", reason: "Spam", time: "1d" },
];

function ReportedPosts() {
  return (
    <>
      <PageHead title="Reported posts" sub="Review and act on flagged organization posts." />
      <Panel>
        <div className="divide-y divide-border">
          {items.map((r, i) => (
            <div key={i} className="flex flex-wrap items-start gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{r.org}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{r.excerpt}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <Badge tone="warning">{r.reason}</Badge>
                  <span className="text-muted-foreground">Reported by {r.reporter} · {r.time}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toast.success("Marked safe")} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary">Dismiss</button>
                <button onClick={() => toast.success("Post hidden")} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-deep">Hide</button>
                <button onClick={() => toast.success("Post removed")} className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
