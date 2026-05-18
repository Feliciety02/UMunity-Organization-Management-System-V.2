import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { Reply, Trash2, Flag } from "lucide-react";
import { showStatusToast } from "@/lib/feedback";

export const Route = createFileRoute("/leader/comments")({
  component: Comments,
});

const items = [
  { author: "Jana Cruz", program: "BS IT - 2nd Yr", post: "Innovation Summit 2026 - Registration Open", text: "Sulit 'to last year, joining again!", time: "1h" },
  { author: "Marvin Lim", program: "BS CS - 1st Yr", post: "Innovation Summit 2026 - Registration Open", text: "Will the workshop tracks have certificates?", time: "30m", flagged: true },
  { author: "Ria Santos", program: "BS IS - 3rd Yr", post: "Officer elections opening soon", text: "Where can I read the candidate platforms?", time: "5h" },
  { author: "Karl Mendez", program: "BS CS - 4th Yr", post: "Hack Night Vol. 3", text: "Can we bring our own laptops?", time: "1d" },
];

function Comments() {
  return (
    <>
      <PageHead title="Comments" sub="Reply, resolve, or remove comments on your org's posts." />
      <Panel>
        <div className="divide-y divide-border">
          {items.map((c, i) => (
            <div key={i} className="flex items-start gap-3 py-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-primary-deep">
                {c.author.split(" ").slice(0, 2).map((w) => w[0]).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{c.author}</p>
                  <span className="text-xs text-muted-foreground">- {c.program}</span>
                  {c.flagged && <Badge tone="warning">Flagged</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">on <span className="font-medium text-foreground">{c.post}</span> - {c.time}</p>
                <p className="mt-1.5 text-sm">{c.text}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => showStatusToast("Reply sent", "Your response has been added to the thread.")} className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-secondary"><Reply className="h-3 w-3" /> Reply</button>
                  <button onClick={() => showStatusToast("Comment removed", "The flagged comment is no longer visible.", "warning")} className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/5"><Trash2 className="h-3 w-3" /> Remove</button>
                  <button className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-secondary"><Flag className="h-3 w-3" /> Report</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
