import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reported-comments")({
  component: ReportedComments,
});

const items = [
  { author: "Anon123", post: "Officer elections opening soon", text: "This is rigged lol", reason: "Harassment", time: "1h" },
  { author: "Jana C.", post: "Plastic-Free May results", text: "Numbers don't add up.", reason: "Misinformation", time: "3h" },
  { author: "Karl M.", post: "Hack Night Vol. 3", text: "spam-link-removed", reason: "Spam", time: "1d" },
];

function ReportedComments() {
  return (
    <>
      <PageHead title="Reported comments" sub="Take action on flagged comments across UMunity." />
      <Panel>
        <div className="divide-y divide-border">
          {items.map((c, i) => (
            <div key={i} className="flex flex-wrap items-start gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm"><span className="font-semibold">{c.author}</span> <span className="text-muted-foreground">on</span> <span className="font-medium">{c.post}</span></p>
                <p className="mt-1 rounded-md bg-secondary/60 p-2 text-sm">{c.text}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <Badge tone="warning">{c.reason}</Badge>
                  <span className="text-muted-foreground">{c.time} ago</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toast.success("Dismissed")} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary">Dismiss</button>
                <button onClick={() => toast.success("Comment removed")} className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10">Remove</button>
                <button onClick={() => toast.success("User warned")} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-deep">Warn user</button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
