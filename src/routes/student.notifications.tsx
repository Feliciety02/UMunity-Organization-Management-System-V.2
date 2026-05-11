import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { notifs } from "./student";

export const Route = createFileRoute("/student/notifications")({
  component: Notifications,
});

function Notifications() {
  return (
    <>
      <PageHead title="Notifications" sub="All your updates in one place." action={<button className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold">Mark all read</button>} />

      <Panel>
        <div className="divide-y divide-border">
          {notifs.map((n, i) => (
            <div key={i} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
              <div className={`mt-1 h-2.5 w-2.5 rounded-full ${n.unread ? "bg-gradient-gold" : "bg-border"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.meta}</p>
              </div>
              {n.unread && <Badge tone="gold">New</Badge>}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
